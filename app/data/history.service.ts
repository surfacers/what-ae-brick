import AsyncStorage from '@react-native-async-storage/async-storage'
import { uuid } from '../utils/uuid'
import { allPartColorsById, allPartsById } from './parts.service'

const storageKey = 'history'
const maxHistoryLength = 100

interface HistoryStorageItem {
    id: string // TODO: remove?
    partId: string
}

export interface HistoryItem {
    id: string
    partId: string
    partName: string
    uri: string // TODO: remove?
}

export const saveToHistory = (partId: string) => new Promise<HistoryItem[]>(async (resolve, reject) => {
    try {
        const currentHistoryJson = await AsyncStorage.getItem(storageKey)
        const history: HistoryStorageItem[] = currentHistoryJson != null
            ? JSON.parse(currentHistoryJson)
            : []

        const newHistory: HistoryStorageItem[] = [{ id: uuid(), partId }, ...history.slice(0, maxHistoryLength)]
        await AsyncStorage.setItem(storageKey, JSON.stringify(newHistory))
        resolve(mapToHistoryItem(newHistory))
    } catch (error) {
        reject(error)
    }
})

export const fetchHistory = () => new Promise<HistoryItem[]>(async (resolve, reject) => {
    try {
        const json = await AsyncStorage.getItem(storageKey)
        const items: HistoryStorageItem[] = json != null
            ? JSON.parse(json)
            : []

        const history = mapToHistoryItem(items)
        resolve(history)
    } catch (error) {
        reject(error)
    }
})

function mapToHistoryItem(items: HistoryStorageItem[]): HistoryItem[] {
    return items
        .map(i => {
            const part = allPartsById[i.partId]
            const color = allPartColorsById[i.partId][0].colorId // TODO:

            return {
                id: i.id,
                partId: part.id,
                partName: part.name,
                uri: `https://cdn.rebrickable.com/media/thumbs/parts/ldraw/${color}/${part.id}.png/230x230.png`
            }
        })
}