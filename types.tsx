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
  BrickDetail: {brickId:number, images:Array<string>};
};

export type HistoryParamList = {
  HistoryScreen: undefined;
  BrickDetailScreen: {brickId:string, images:Array<string>};
};

export type ScanParamList = {
  ScanScreen: undefined;
  ResultScreen: { id: string; certainty: number };
  ErrorScreen: { error: Error };
};

export type WishlistParamList = {
  WishlistScreen: undefined;
};


export type PartColorData = {
  color_id: number,
  color_name: string,
  num_sets: number,
  num_set_parts: number,
  part_img_url: string,
  elements: string[],
  rgb?: string,
  is_trans?: boolean
};