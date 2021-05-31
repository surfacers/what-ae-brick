import { uuid } from '../utils/uuid'
import { Favs, fetchFavs } from './favs.service'
import { allPartColorsById, allPartsById } from './parts.service'

export interface WishlistItem {
    id: string
    partId: string
    partName: string
    uri: string // TODO: remove?
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
            const color = allPartColorsById[partId][1].colorId // TODO:

            return {
                id: uuid(),
                partId: part.id,
                partName: part.name,
                uri: `https://cdn.rebrickable.com/media/thumbs/parts/ldraw/${color}/${part.id}.png/230x230.png`
            }
        })
        resolve({ items: wishlist, favs })
    } catch (error) {
        reject(error)
    }
})