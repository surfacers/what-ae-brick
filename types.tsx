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
};

export type ScanParamList = {
  ScanScreen: undefined;
  ResultScreen: { id: number; certainty: number };
  ErrorScreen: { error: Error };
};

export type WishlistParamList = {
  WishlistScreen: undefined;
};
