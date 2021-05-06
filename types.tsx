/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  History: undefined;
  Scan: undefined;
  Wishlist: undefined;
};

export type HistoryParamList = {
  HistoryScreen: undefined;
  BrickDetailScreen: {brickId:number, images:Array<string>};
};

export type ScanParamList = {
  ScanScreen: undefined;
};

export type WishlistParamList = {
  WishlistScreen: undefined;
};