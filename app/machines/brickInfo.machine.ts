import NetInfo from "@react-native-community/netinfo";
import { assign, createMachine } from "xstate";
import { fetchPart, fetchPartColors } from '../data/parts.service';
import { PartColorDto } from '../data/part-colors.data';
import { PartDto } from '../data/parts.data';

export type DetailEvent = { type: 'RETRY_LOADING' };

export interface BrickInfoContext {
    partId: string
    part: PartDto
    partColors: PartColorDto[]
}

const checkConnection = () => NetInfo.fetch().then(state => {
    if (!state.isConnected) {
        throw Error("No Connection");
    }

    return state.isConnected;
});

const fetchOffline = fetchPart;

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
                                src: (context, _) => fetchPart(context.partId),
                                onDone: {
                                    target: 'fetchColorData',
                                    actions: [
                                        assign({ part: (_, event) => event.data })
                                    ]
                                },
                                onError: '..offline',
                            }
                        },
                        fetchColorData: {
                            tags: "loading",
                            invoke: {
                                id: 'fetchColorData',
                                src: (context, _) => fetchPartColors(context.partId),
                                onDone: {
                                    target: '#brickInfo.loaded',
                                    actions: [
                                        assign({ partColors: (_, event) => event.data })
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
                        id: 'fetchOffline', // TODO: funktioniert das überhaupt? Daten werden nie assigned?
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