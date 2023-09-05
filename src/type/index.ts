export const DEALER_CONDITION = {
  all: "全て",
  dealer: "親",
  others: "子",
}

export type DealerCondition = keyof typeof DEALER_CONDITION

export const isDealerCondition = (value: any): value is DealerCondition => Object.keys(DEALER_CONDITION).includes(value);

export const CONCEALED_CONDITION = {
  all: "全て",
  concealed: "門前",
  called: "鳴き",
}

export type ConcealedCondition = keyof typeof CONCEALED_CONDITION

export const isConcealedCondition = (value: any): value is ConcealedCondition => Object.keys(CONCEALED_CONDITION).includes(value);

export interface QuestionCondition {
  dealerCondition: DealerCondition,
  concealedCondition: ConcealedCondition,
  doublesLowerLimit: number,
  doublesUpperLimit: number,
}

export const DEFAULT_CONDITION: QuestionCondition = {
  dealerCondition: "all",
  concealedCondition: "all",
  doublesLowerLimit: 0,
  doublesUpperLimit: 0,
}


export const EMPTY_HAND: Hand = {
  handTiles: [],
  openMelds: [],
  winningTile: "",
  situation: {
    roundWind: "EAST",
    seatWind: "EAST",
    upperIndicators: [],
    lowerIndicators: [],
    isTsumo: false,
    isReady: false,
    isFirstAroundReady: false,
    isFirstAroundWin: false,
    isReadyAroundWin: false,
    isLastTileWin: false,
    isQuadTileWin: false,
    isQuadTurnWin: false
  }
}

export const EMPTY_SCORE: Score = {
  point: 0,
  doubles: 0,
  score: 0,
  adjustedScore: 0,
  limitType: "",
  isDealer: false,
  isHandLimit: false,
  handTypes: [],
  pointTypes: []
}

export const EMPTY_QUESTION_RESPONSE: QuestionResponse = {
  handId: -1,
  hand: EMPTY_HAND,
  score: EMPTY_SCORE
}

export type QuestionResponse = {
  handId: number,
  hand: Hand,
  score: Score
}

export type Hand = {
  handTiles: Tile[],
  winningTile: Tile,
  openMelds: Meld[],
  situation: Situation,
}

export type Meld = {
  meldTiles: Tile[],
  callFrom: Side
}

export type Situation = {
  roundWind: Wind,
  seatWind: Wind,
  upperIndicators: string[],
  lowerIndicators: string[],
  isTsumo: boolean,
  isReady: boolean,
  isFirstAroundReady: boolean,
  isFirstAroundWin: boolean,
  isReadyAroundWin: boolean,
  isLastTileWin: boolean,
  isQuadTileWin: boolean,
  isQuadTurnWin: boolean
}

export type Score = {
  point: number,
  doubles: number,
  score: number,
  adjustedScore: number,
  limitType: string,
  isDealer: boolean,
  isHandLimit: boolean,
  handTypes: HandType[],
  pointTypes: PointType[]
}

export type HandType = {
  name: string,
  grade: string
}

export type PointType = {
  name: string,
  point: number
}

export type Side = "SELF" | "RIGHT" | "ACROSS" | "LEFT";
export type Wind = "EAST" | "SOUTH" | "WEST" | "NORTH";

const tiles = [
  "M1", "M2", "M3", "M4", "M5", "M5R", "M6", "M7", "M8", "M9",
  "P1", "P2", "P3", "P4", "P5", "P5R", "P6", "P7", "P8", "P9",
  "S1", "S2", "S3", "S4", "S5", "S5R", "S6", "S7", "S8", "S9",
  "WE", "WS", "WW", "WN", "DW", "DG", "DR"];

export type Tile = typeof tiles[number];

export const isTile = (item: string): item is Tile => {
  return tiles.includes(item);
}
