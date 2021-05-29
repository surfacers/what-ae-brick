import { assign, createMachine } from "xstate";
import NetInfo from "@react-native-community/netinfo";

export type DetailEvent = { type: 'RETRY_LOADING' };

export interface FetchContext {
    fetchedData?: any;
};

const checkConnection = () => NetInfo.fetch().then(state => {
    if (!state.isConnected) {
        throw Error("No Connection");
    }
    return state.isConnected;
});


export const fetchingMachine = createMachine<FetchContext, DetailEvent>({
    id: 'fetching',
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
                    tags: "loading",
                    invoke: {
                        id: 'fetchOnline',
                        src: 'fetchOnline',
                        onDone: {
                            target: 'postProcess',
                            actions: [
                                assign({
                                    fetchedData: (_, event) => event.data
                                })
                            ],
                        },
                        onError: '..offline',
                    }
                },
                offline: {
                    tags: "loading",
                    invoke: {
                        id: 'fetchOffline',
                        src: 'fetchOffline',
                        onDone: {
                            target: 'postProcess',
                            actions: [
                                assign({
                                    fetchedData: (_, event) => event.data
                                })
                            ],
                        },
                        onError: '..loadingFailed'
                    }
                },
                postProcess: {
                    tags: "loading",
                    invoke: {
                        id: 'postProcessing',
                        src: 'postProcessing',
                        onDone: {
                            target: '#fetching.loaded',
                        },
                        onError: '#fetching.loadingFailed'
                    }
                },
            },
        },
        loaded: {
            tags: "finished"
        },
        loadingFailed: {
            tags: "failed",
            on: {
                RETRY_LOADING: 'loading'
            }
        }
    },
});
