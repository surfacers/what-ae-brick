import { assign, createMachine } from "xstate";
import NetInfo from "@react-native-community/netinfo";

const rebrickableApi = 'https://rebrickable.com/api/v3/lego'
const key = '23062b8c5ce6051cf1be80b5a29be1a2';

export type DetailEvent = {type: 'RETRY_LOADING'};

export interface BrickInfoContext {
    images?: Array<Object>;
    partId: number;
    partData?: any;
    colorData?: any;
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


export const brickInfoMachine = createMachine<BrickInfoContext, DetailEvent>({
    id: 'brickInfo',
    initial: 'loading',
    states: {
        loading: {
            initial: 'checkingConnection',
            tags: "loading",
            states: {
                checkingConnection: {
                    tags: "loading",
                    invoke: {
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
                            tags: "loading",
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
                            tags: "loading",
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
                    tags: "loading",
                    invoke: {
                        id: 'fetchOffline',
                        src: (context, _) => fetchOffline(context.partId),
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