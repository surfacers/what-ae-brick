import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'favs'

export const saveFavs = (favs: Set<string>) => new Promise<Set<string>>(async (resolve, reject) => {
    try {
        const json = JSON.stringify([...favs])
        await AsyncStorage.setItem(storageKey, json)
        resolve(favs)
    } catch (error) {
        reject(error)
    }
})

export const fetchFavs = () => new Promise<Set<string>>(async (resolve, reject) => {
    try {
        const json = await AsyncStorage.getItem(storageKey)
        const partIds: string[] = json != null ? JSON.parse(json) : []
        resolve(new Set(partIds))
    } catch (error) {
        reject(error)
    }
})