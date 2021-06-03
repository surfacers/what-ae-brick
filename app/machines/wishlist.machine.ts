import { assign, createMachine } from 'xstate';
import { WishlistItem } from '../data/wishlist.service';

export interface WishlistContext {
    items: WishlistItem[]
    favs: Set<string>
}

export type WishlistEvent =
    | { type: 'FETCH' }
    | { type: 'RETRY' }
    | { type: 'UPDATE_FAV', partId: string };

export enum WishlistTag {
    loading = 'loading',
    success = 'success',
    error = 'error',
    saving = 'saving'
}

export const wishlistMachine = createMachine<WishlistContext, WishlistEvent>({
    id: 'wishlist',
    initial: 'idle',
    states: {
        idle: {
            on: {
                FETCH: 'loading'
            }
        },
        loading: {
            tags: WishlistTag.loading,
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
            tags: [WishlistTag.loading, WishlistTag.success],
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
            tags: WishlistTag.success,
            on: {
                RETRY: 'reloading',
                UPDATE_FAV: 'saving_favs'
            }
        },
        saving_favs: {
            tags: [WishlistTag.saving, WishlistTag.success],
            invoke: {
                src: 'saveFavs',
                onDone: [{
                    target: 'success',
                    actions: 'assignFavs'
                }],
                onError: 'success'
            }
        },
        failure: {
            tags: WishlistTag.error,
            on: {
                RETRY: 'loading'
            }
        }
    }
},
{
    services: {
        fetchData: () => () => { },
        saveFavs: () => () => { }
    },
    actions: {
        assignData: assign((context, event: any) => {
            return {
                items: event.data.items,
                favs: event.data.favs
            };
        }),
        assignFavs: assign((context, event: any) => {
            return {
                favs: event.data
            };
        })
    }
})