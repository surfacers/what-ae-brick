import { allPartColors } from './part-colors'
import { allParts } from './parts'

// TODO: Rename file

export const fetchPart = (partId: string) => new Promise((resolve, _) => {
    const part = allParts.find(s => s.id == partId)
    resolve(part)
})

export const fetchPartColors = (partId: string) => new Promise((resolve, _) => {
    const colors = allPartColors.filter(s => s.partId == partId)
    console.log(colors)
    resolve(colors)
})