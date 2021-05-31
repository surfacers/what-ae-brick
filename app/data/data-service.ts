import { allPartColors, PartColorDto } from './part-colors'
import { allParts, PartDto } from './parts'
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Rename file

type PartById = { [partId: string]: PartDto }
const allPartsById: PartById =
    Object.assign({}, ...allParts.map(p => ({[p.id]: p})))

type PartColorById = { [partId: string]: PartColorDto[] }
const allPartColorsById: PartColorById =
    allPartColors.reduce((dict: PartColorById, partColor) => {
        const partColors = dict[partColor.partId] != null
            ? [...dict[partColor.partId], partColor]
            : [partColor]

        return Object.assign(dict, {[partColor.partId]: partColors})
    }, {})

export const fetchPart = (partId: string) => new Promise((resolve, _) => {
    const part = allPartsById[partId]
    resolve(part)
})

export const fetchPartColors = (partId: string) => new Promise<PartColorDto[]>((resolve, _) => {
    const colors = allPartColorsById[partId]
    resolve(colors)
})

interface HistoryStorageItem {
    id: string
    partId: string
}

export interface HistoryItem {
    id: string
    partId: string
    partName: string
    uri: string
}

export const saveHistory = (items: HistoryItem[]) => {
}

export const fetchHistory = () => new Promise<HistoryItem[]>(async (resolve, reject) => {
    // TODO: just for test:
    // resolve([])
    // reject('No internet connection')

    try {
        const json = await AsyncStorage.getItem('history')
        const items: HistoryStorageItem[] = json != null
            ? JSON.parse(json)
            : [{ id: 'asd', partId: '3001' }, { id: '123', partId: '3002' }]; // TODO:

        const history: HistoryItem[] = items
            .map(i => {
                const part = allPartsById[i.partId]
                const color = allPartColorsById[i.partId][1].colorId // TODO

                return {
                    id: i.id,
                    partId: part.id,
                    partName: part.name,
                    uri:`https://cdn.rebrickable.com/media/thumbs/parts/ldraw/${color}/${part.id}.png/230x230.png`
                }
            })

        resolve(history)
    } catch (error) {
        reject(error)
    }
})

export const saveFavs = (favs: Set<string>) => new Promise<Set<string>>(async (resolve, reject) => {
    try {
        const json = JSON.stringify([...favs])
        await AsyncStorage.setItem('favs', json)
        resolve(favs)
    } catch (error) {
        reject(error)
    }
})

export const fetchFavs = () => new Promise<Set<string>>(async (resolve, reject) => {
    try {
        const json = await AsyncStorage.getItem('favs')
        const partIds: string[] = json != null ? JSON.parse(json) : []
        resolve(new Set(partIds))
    } catch (error) {
        reject(error)
    }
})