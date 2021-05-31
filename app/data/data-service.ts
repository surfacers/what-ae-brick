import { allPartColors, PartColorDto } from './part-colors'
import { allParts, PartDto } from './parts'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveActions } from 'xstate/lib/actions';

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

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const saveToHistory = (partId: string) => new Promise<HistoryItem[]>(async (resolve, reject) => {
    try {
        const currentHistoryJson = await AsyncStorage.getItem('history')
        const history: HistoryStorageItem[] = currentHistoryJson != null
            ? JSON.parse(currentHistoryJson)
            : []

        const newHistory: HistoryStorageItem[] = [{ id: uuid(), partId}, ...history.slice(0, 5)] // TODO: length
        await AsyncStorage.setItem('history', JSON.stringify(newHistory))
        resolve(mapToHistoryItem(newHistory))
    } catch (error) {
        reject(error)
    }
})

function mapToHistoryItem(items: HistoryStorageItem[]): HistoryItem[] {
    return items
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
}

export const fetchHistory = () => new Promise<HistoryItem[]>(async (resolve, reject) => {
    // TODO: just for test:
    // resolve([])
    // reject('No internet connection')

    try {
        const json = await AsyncStorage.getItem('history')
        const items: HistoryStorageItem[] = json != null
            ? JSON.parse(json)
            : []

        const history = mapToHistoryItem(items)
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