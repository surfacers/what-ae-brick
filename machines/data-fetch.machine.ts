import { assign, createMachine } from 'xstate';

export interface DataFetchContext<TData> {
    data?: TData[];
}

export type DataFetchEvent<TData> =
    | {
        type: 'FETCH'
    }
    | {
        type: 'RESOLVE',
        data: TData[]
    }
    | {
        type: 'REJECT'
    }
    | {
        type: 'RETRY'
    };

export enum DataFetchTag {
    idle = 'idle',
    loading = 'loading',
    success = 'success',
    error = 'error'
}

export default function createDataFetchMachine<TData>() { return createMachine<
    DataFetchContext<TData>,
    DataFetchEvent<TData>
>(
    {
        id: 'data-fetch',
        initial: 'idle',
        states: {
            idle: {
                tags: DataFetchTag.idle,
                on: {
                    FETCH: 'loading'
                }
            },
            loading: {
                tags: DataFetchTag.loading,
                invoke: {
                    src: 'fetchData',
                    onDone: {
                        target: 'success',
                        actions: 'assignDataToContext'
                    },
                    onError: 'failure'
                }
            },
            // TODO:
            // // reloading: {
            // //     tags: ['loading', 'success']
            // // },
            success: {
                tags: DataFetchTag.success,
                on: {
                    RETRY: 'loading'
                }
            },
            failure: {
                tags: DataFetchTag.error,
                on: {
                    RETRY: 'loading'
                }
            }
        }
    },
    {
        services: {
            fetchData: () => () => { },
        },
        actions: {
            assignDataToContext: assign((context, event: any) => {
                return {
                    data: event.data,
                };
            })
        }
    }
)};
