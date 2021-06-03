import { uuid } from '../utils/uuid'
import { Favs, fetchFavs } from './favs.service'
import { allPartColorsById, allPartsById } from './parts.service'

export interface WishlistItem {
    id: string
    partId: string
    partName: string
}

export interface WishlistFetchResult {
    items: WishlistItem[]
    favs: Favs
}

export const fetchWishlist = () => new Promise<WishlistFetchResult>(async (resolve, reject) => {
    try {
        const favs = await fetchFavs()
        const wishlist = [...favs].map(partId => {
            const part = allPartsById[partId]
            const color = allPartColorsById[partId][0].colorId // TODO:

            return {
                id: uuid(),
                partId: part.id,
                partName: part.name
            }
        })
        resolve({ items: wishlist, favs })
    } catch (error) {
        reject(error)
    }
})