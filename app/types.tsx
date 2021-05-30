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
    BrickDetail: { partId: number, images: Array<string> } // TODO: ? Was ist das für ein Array?
}

export type HistoryParamList = {
    HistoryScreen: undefined
    BrickDetailScreen: { partId: string, images: Array<string> }
}

export type ScanParamList = {
    ScanScreen: undefined
    ResultScreen: { id: string; certainty: number }
    ErrorScreen: { error: Error }
};

export type WishlistParamList = {
    WishlistScreen: undefined
};
