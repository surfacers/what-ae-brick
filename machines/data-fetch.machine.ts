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
    loading = 'loading',
    success = 'success',
    error = 'error',
    empty = 'empty'
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
                on: {
                    FETCH: 'loading'
                }
            },
            loading: {
                tags: DataFetchTag.loading,
                invoke: {
                    src: 'fetchData',
                    onDone: [{
                        target: 'success',
                        actions: 'assignDataToContext',
                        cond: (_, event: any) => event.data != null && (event.data?.length ?? 0) > 0
                    },
                    {
                        target: 'empty',
                        actions: 'assignDataToContext'
                    }],
                    onError: 'failure'
                }
            },
            reloading: {
                tags: [DataFetchTag.loading, DataFetchTag.success],
                invoke: {
                    src: 'fetchData',
                    onDone: [{
                        target: 'success',
                        actions: 'assignDataToContext',
                        cond: (_, event: any) => event.data != null && (event.data?.length ?? 0) > 0
                    },
                    {
                        target: 'empty',
                        actions: 'assignDataToContext'
                    }],
                    onError: 'failure'
                }
            },
            success: {
                tags: DataFetchTag.success,
                on: {
                    RETRY: 'reloading'
                }
            },
            empty: {
                tags: 'empty',
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
