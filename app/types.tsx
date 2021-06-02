/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
    Root: undefined
    NotFound: undefined
}

export type BottomTabParamList = {
    History: undefined
    Scan: undefined
    Wishlist: undefined
}

export type HistoryParamList = {
    HistoryScreen: undefined
    BrickDetailScreen: { brickId: string, images: Array<string> } // TODO: sollen wir jetzt das Bild anzeigen (das gescannte?)
}

export type ScanParamList = {
    ScanScreen: undefined
    BrickDetailScreen: { brickId: string, images: Array<string> } // TODO: sollen wir jetzt das Bild anzeigen (das gescannte?)
    ErrorScreen: { error: Error }
};

export type WishlistParamList = {
    WishlistScreen: undefined
};
