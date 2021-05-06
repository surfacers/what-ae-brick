import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { assign, createMachine } from "xstate";
import { raise } from "xstate/lib/actions";
import { NetInfo } from "react-native";
import { cond } from "react-native-reanimated";

//const checkConnection = (_, _) => "";
//const fetchPartData = (context, event) => "";
//const fetchColorData = (context, event) => "";

//const fetchOffline = (context, event) => "";

const rebrickableApi = 'https://rebrickable.com/api/v3/lego'
export type DetailEvent = {type: 'RETRY_LOADING'};
export interface DetailContext {
    images: Array<Object>;
    partId: number;
    partData?: Response;
    colorData?: Response;
};
const key = '23062b8c5ce6051cf1be80b5a29be1a2';
const fetchPartData = (partId: number) =>
    fetch(`${rebrickableApi}/parts/${partId}/?key=${key}`).then((response) => response.json());

const checkConnection = () => NetInfo.isConnected.fetch().done((isConnected: boolean){
    if(!isConnected) {
        throw Error("No Connection");
    }
    return isConnected;
});
const fetchColorData = (partId: number) => fetch(`${rebrickableApi}/parts/${partId}/colors/?key=${key}`).then((response) => response.json());
const fetchOffline = fetchPartData;
const images: Array<Object> = [];
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



// on: {
//     ADD_TO_WISHLIST: '',
//     CHANGE_COLOR: '',
//     ADD_BRICK: {
//         actions: 'addBrick'
//     },
//     REMOVE_BRICK: {
//         actions: 'removeBrick',
//         cond: 'canRemoveBrick'
//     }
// },,
    // {
    //     guards: {
    //         canRemoveBrick: (context, event) => {
    //             return context.amount > 1;
    //         },
    //     },
    //     actions: {
    //         addBrick: assign({
    //             amount: (context) => context.amount + 1,
    //         }),
    //         removeBrick: assign({
    //             amount: (context) => context.amount - 1,
    //         })
    //     }
    // },