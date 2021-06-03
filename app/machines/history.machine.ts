import { assign, createMachine } from 'xstate';
import { HistoryItem } from '../data/history.service';

export interface HistoryContext {
    parts: HistoryItem[]
    favs: Set<string>
}

export type HistoryEvent =
    | { type: 'FETCH' }
    | { type: 'RETRY' }
    | { type: 'UPDATE_FAV', partId: string }
    | { type: 'UPDATE_HISTORY', partId: string };

export enum HistoryTag {
    loading = 'loading',
    success = 'success',
    error = 'error',
    saving = 'saving'
}

export const historyMachine = createMachine<HistoryContext, HistoryEvent>({
    id: 'scanned-parts',
    initial: 'idle',
    states: {
        idle: {
            on: {
                FETCH: 'loading'
            }
        },
        loading: {
            tags: HistoryTag.loading,
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
            tags: [HistoryTag.loading, HistoryTag.success],
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
            tags: HistoryTag.success,
            on: {
                RETRY: 'reloading',
                UPDATE_FAV: 'saving_favs',
                UPDATE_HISTORY: 'saving_history'
            }
        },
        saving_favs: {
            tags: [HistoryTag.saving, HistoryTag.success],
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
            tags: [HistoryTag.saving, HistoryTag.success],
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
            tags: HistoryTag.error,
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
            return {
                parts: event.data.history,
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
                parts: event.data
            };
        }),
    }
})