import { allPartColors, PartColorDto } from './part-colors.data'
import { allParts, PartDto } from './parts.data'

type PartById = { [partId: string]: PartDto }
export const allPartsById: PartById =
    Object.assign({}, ...allParts.map(p => ({ [p.id]: p })))

type PartColorById = { [partId: string]: PartColorDto[] }
export const allPartColorsById: PartColorById =
    allPartColors.reduce((dict: PartColorById, partColor) => {
        const partColors = dict[partColor.partId] != null
            ? [...dict[partColor.partId], partColor]
            : [partColor]

        return Object.assign(dict, { [partColor.partId]: partColors })
    }, {})

export const fetchPart = (partId: string) => new Promise((resolve, reject) => {
    const part = allPartsById[partId]
    if (part != null) {
        resolve(part)
    } else {
        reject(new Error(`Part '${partId}' was not found.`))
    }
})

export const fetchPartColors = (partId: string) => new Promise<PartColorDto[]>((resolve, _) => {
    const colors = allPartColorsById[partId]
    resolve(colors != null ? colors : [])
})