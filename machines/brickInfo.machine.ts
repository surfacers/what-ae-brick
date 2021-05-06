import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { assign, createMachine } from "xstate";
import { raise } from "xstate/lib/actions";
import NetInfo from "@react-native-community/netinfo";
import { cond } from "react-native-reanimated";

const rebrickableApi = 'https://rebrickable.com/api/v3/lego'
const key = '23062b8c5ce6051cf1be80b5a29be1a2';

export type DetailEvent = {type: 'RETRY_LOADING'};

export interface DetailContext {
    images: Array<Object>;
    partId: number;
    partData?: Response;
    colorData?: Response;
};

const fetchPartData = (partId: number) =>
    fetch(`${rebrickableApi}/parts/${partId}/?key=${key}`).then((response) => response.json());

const checkConnection = () => NetInfo.fetch().then(state => {
    if(!state.isConnected) {
        throw Error("No Connection");
    }
    return state.isConnected;
});

const fetchColorData = (partId: number) => fetch(`${rebrickableApi}/parts/${partId}/colors/?key=${key}`).then((response) => response.json());

const fetchOffline = fetchPartData; // TODO: implement offline capabilities


const brickInfoMachine = createMachine<DetailContext, DetailEvent>({
    id: 'brickInfo',
    initial: 'loading',
    context: {
        images: images,
        partId: 3001,
        partData: undefined,
        colorData: undefined
    },
    states: {
        loading: {
            initial: 'checkingConnection',
            states: {
                checkingConnection: {
                    invoke: {
                        tags: "loading",
                        id: 'checkingConnection',
                        src: () => checkConnection(),
                        onDone: {
                            target: 'online',
                        },
                        onError: 'offline'
                    }
                },
                online: {
                    initial: 'fetchPartData',
                    states: {
                        fetchPartData: {
                            invoke: {
                                id: 'fetchPartData',
                                src: (context, _) => fetchPartData(context.partId),
                                onDone: {
                                    target: 'fetchColorData',
                                    actions: [
                                        assign({
                                            partData: (_, event) => event.data
                                        }),]
                                },
                                onError: '..offline',
                            }
                        },
                        fetchColorData: {
                            invoke: {
                                id: 'fetchColorData',
                                src: (context, _) => fetchColorData(context.partId),
                                onDone: {
                                    target: '#brickInfo.loaded',
                                    actions: [
                                        assign({
                                            colorData: (_, event) => event.data
                                        })
                                    ],
                                },
                                onError: '..offline',
                            }
                        },
                    }
                },
                offline: {
                    invoke: {
                        id: 'fetchOffline',
                        src: fetchOffline,
                        onDone: '..loaded',
                        onError: '..loadingFailed'
                    }
                },
            },
        },
        loaded: {
            tags: "finished",
        },
        loadingFailed: {
            tags: "failed",
            on: {
                RETRY_LOADING: 'loading'
            }
        }
    },
});