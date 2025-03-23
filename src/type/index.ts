export type DealerCondition = keyof typeof DEALER_CONDITION
export const isDealerCondition = (value: any): value is DealerCondition => Object.keys(DEALER_CONDITION).includes(value);
export const DEALER_CONDITION = {
  all: "全て",
  dealer: "親",
  others: "子",
}

export type ConcealedCondition = keyof typeof CONCEALED_CONDITION
export const isConcealedCondition = (value: any): value is ConcealedCondition => Object.keys(CONCEALED_CONDITION).includes(value);
export const CONCEALED_CONDITION = {
  all: "全て",
  concealed: "門前",
  called: "鳴き",
}

export type WinningCondition = keyof typeof WINNING_CONDITION
export const isWinningCondition = (value: any): value is WinningCondition => Object.keys(WINNING_CONDITION).includes(value);
export const WINNING_CONDITION = {
  all: "全て",
  tsumo: "ツモ",
  ron: "ロン",
}

export interface QuestionCondition {
  winningCondition: WinningCondition,
  dealerCondition: DealerCondition,
  concealedCondition: ConcealedCondition,
  doublesLowerLimit: number,
  doublesUpperLimit: number,
}

export const DEFAULT_CONDITION: QuestionCondition = {
  winningCondition: "all",
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
    isQuadTurnWin: false,
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
  pointTypes: [],
}

export const EMPTY_QUESTION_RESPONSE: Question = {
  handId: -1,
  hand: EMPTY_HAND,
  score: EMPTY_SCORE
}

export type Question = {
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

export type Meld = {
  meldTiles: Tile[],
  callFrom: Side
}

export const isQuestion = (data: any): data is Question => {
  return (
    data && typeof data === 'object' &&
    'handId' in data && typeof data.handId === "number" &&
    'hand' in data && isHand(data.hand) &&
    'score' in data && isScore(data.score)
  )
}

export const isHand = (data: any): data is Hand => {
  return (
    data && typeof data === 'object' &&
    'handTiles' in data && Array.isArray(data.handTiles) && data.handTiles.every(isTile) &&
    'winningTile' in data && isTile(data.winningTile) &&
    'openMelds' in data && Array.isArray(data.openMelds) && data.openMelds.every(isMeld) &&
    'situation' in data && isSituation(data.situation)
  )
}

export const isScore = (data: any): data is Score => {
  return (
    data && typeof data === 'object' &&
    'point' in data && typeof data.point === "number" &&
    'doubles' in data && typeof data.doubles === "number" &&
    'score' in data && typeof data.score === "number" &&
    'adjustedScore' in data && typeof data.adjustedScore === "number" &&
    'limitType' in data && typeof data.limitType === "string" &&
    'isDealer' in data && typeof data.isDealer === "boolean" &&
    'isHandLimit' in data && typeof data.isHandLimit === "boolean" &&
    'handTypes' in data && Array.isArray(data.handTypes) && data.handTypes.every(isHandType) &&
    'pointTypes' in data && Array.isArray(data.pointTypes) && data.pointTypes.every(isPointType)
  )
}

export const isSituation = (data: any): data is Situation => {
  return (
    data && typeof data === 'object' &&
    'roundWind' in data && isWind(data.roundWind) &&
    'seatWind' in data && isWind(data.seatWind) &&
    'upperIndicators' in data && Array.isArray(data.upperIndicators) && data.upperIndicators.every(isTile) &&
    'lowerIndicators' in data && Array.isArray(data.lowerIndicators) && data.lowerIndicators.every(isTile) &&
    'isTsumo' in data && typeof data.isTsumo === "boolean" &&
    'isReady' in data && typeof data.isReady === "boolean" &&
    'isFirstAroundReady' in data && typeof data.isFirstAroundReady === "boolean" &&
    'isFirstAroundWin' in data && typeof data.isFirstAroundWin === "boolean" &&
    'isReadyAroundWin' in data && typeof data.isReadyAroundWin === "boolean" &&
    'isLastTileWin' in data && typeof data.isLastTileWin === "boolean" &&
    'isQuadTileWin' in data && typeof data.isQuadTileWin === "boolean" &&
    'isQuadTurnWin' in data && typeof data.isQuadTurnWin === "boolean"
  )
}

export const isHandType = (data: any): data is HandType => {
  return (
    data && typeof data === "object" &&
    'name' in data && typeof data.name === "string" &&
    'grade' in data && typeof data.grade === "string"
  )
}

export const isPointType = (data: any): data is PointType => {
  return (
    data && typeof data === "object" &&
    'name' in data && typeof data.name === "string" &&
    'point' in data && typeof data.point === "number"
  )
}

export const isMeld = (data: any): data is Meld => {
  return (
    data && typeof data === "object" &&
    'meldTiles' in data && Array.isArray(data.meldTiles) && data.meldTiles.every(isTile) &&
    'callFrom' in data && isSide(data.callFrom)
  )
}

const SIDE_VALUES = ["SELF", "RIGHT", "ACROSS", "LEFT"];
const WIND_VALUES = ["EAST", "SOUTH", "WEST", "NORTH"];
export const TILE_VALUES = [
  "M1", "M2", "M3", "M4", "M5", "M5R", "M6", "M7", "M8", "M9",
  "P1", "P2", "P3", "P4", "P5", "P5R", "P6", "P7", "P8", "P9",
  "S1", "S2", "S3", "S4", "S5", "S5R", "S6", "S7", "S8", "S9",
  "WE", "WS", "WW", "WN", "DW", "DG", "DR"
];

export type Side = typeof SIDE_VALUES[number];
export type Wind = typeof WIND_VALUES[number];
export type Tile = typeof TILE_VALUES[number];

export const isSide = (value: string): value is Side => {
  return SIDE_VALUES.includes(value)
}

export const isWind = (value: string): value is Wind => {
  return WIND_VALUES.includes(value)
}

export const isTile = (value: string): value is Tile => {
  return TILE_VALUES.includes(value);
}
