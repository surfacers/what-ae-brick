import { assign, createMachine } from 'xstate';
import { HistoryItem } from '../data/data-service';

export interface HistoryFetchContext {
    history: HistoryItem[]
    favs: Set<string>
}

export type HistoryFetchEvent =
    | { type: 'FETCH' }
    | { type: 'RETRY' }
    | { type: 'UPDATE_FAV', partId: string }
    | { type: 'UPDATE_HISTORY', partId: string };

export enum HistoryFetchTag {
    loading = 'loading',
    success = 'success',
    error = 'error',
    saving = 'saving'
}

export const historyFetchMachine = createMachine<HistoryFetchContext, HistoryFetchEvent>({
    context: { // TODO: should not be necessary!
        history: [],
        favs: new Set<string>()
    },
    id: 'data-fetch',
    initial: 'idle',
    states: {
        idle: {
            on: {
                FETCH: 'loading'
            }
        },
        loading: {
            tags: HistoryFetchTag.loading,
            invoke: {
                src: 'fetchData',
                onDone: [{
                    target: 'success',
                    actions: 'assignData'
                }],
                onError: 'failure'
            }
        },
        reloading: {
            tags: [HistoryFetchTag.loading, HistoryFetchTag.success],
            invoke: {
                src: 'fetchData',
                onDone: [{
                    target: 'success',
                    actions: 'assignData'
                }],
                onError: 'failure'
            }
        },
        success: {
            tags: HistoryFetchTag.success,
            on: {
                RETRY: 'reloading',
                UPDATE_FAV: 'saving_favs',
                UPDATE_HISTORY: 'saving_history'
            }
        },
        saving_favs: {
            tags: [HistoryFetchTag.saving, HistoryFetchTag.success],
            invoke: {
                src: 'saveFavs',
                onDone: [{
                    target: 'success',
                    actions: 'assignFavs'
                }],
                onError: 'success'
            }
        },
        saving_history: {
            tags: [HistoryFetchTag.saving, HistoryFetchTag.success],
            invoke: {
                src: 'saveHistory',
                onDone: [{
                    target: 'success',
                    actions: 'assignHistory'
                }],
                onError: 'success'
            }
        },
        failure: {
            tags: HistoryFetchTag.error,
            on: {
                RETRY: 'loading'
            }
        }
    }
},
{
    services: {
        fetchData: () => () => { },
        saveFavs: () => () => { },
        saveHistory: () => () => { }
    },
    actions: {
        assignData: assign((context, event: any) => {
            console.log(event)
            return {
                history: event.data.history,
                favs: event.data.favs
            };
        }),
        assignFavs: assign((context, event: any) => {
            return {
                favs: event.data
            };
        }),
        assignHistory: assign((context, event: any) => {
            return {
                history: event.data
            };
        }),
    }
})