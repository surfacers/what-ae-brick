import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'favs'

export type Favs = Set<string>

export const addPartToFavs = (favs: Favs, partId: string) => new Promise<Favs>(async (resolve, reject) => {
    try {
        // TODO: Newly favourites should be added on top!
        let newFavs = new Set(favs)
        if (newFavs.has(partId)) {
            newFavs.delete(partId)
        } else {
            newFavs.add(partId)
        }

        newFavs = await saveFavs(newFavs)
        resolve(newFavs)
    } catch (error) {
        reject(error)
    }
})

const saveFavs = (favs: Favs) => new Promise<Favs>(async (resolve, reject) => {
    try {
        const json = JSON.stringify([...favs])
        await AsyncStorage.setItem(storageKey, json)
        resolve(favs)
    } catch (error) {
        reject(error)
    }
})

export const fetchFavs = () => new Promise<Favs>(async (resolve, reject) => {
    try {
        const json = await AsyncStorage.getItem(storageKey)
        const partIds: string[] = json != null ? JSON.parse(json) : []
        resolve(new Set(partIds))
    } catch (error) {
        reject(error)
    }
})