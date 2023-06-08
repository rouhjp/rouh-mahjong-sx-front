import { ValueOf } from "next/dist/shared/lib/constants"

export const EMPTY_HAND: Hand = {
    hand_tiles: [],
    open_melds: [],
    winning_tile: "",
    situation: {
        round_wind: "EAST",
        seat_wind: "EAST",
        upper_indicators: [],
        lower_indicators: [],
        tsumo: false,
        ready: false,
        first_around_ready: false,
        first_around_win: false,
        ready_around_win: false,
        last_tile_win: false,
        quad_tile_win: false,
        quad_turn_win: false
    }
}

export const EMPTY_SCORE: Score = {
    point: 0,
    doubles: 0,
    score: 0,
    adjusted_score: 0,
    limit_type: "",
    dealer: false,
    hand_limit: false,
    hand_types: [],
    point_types: []
}

export const EMPTY_QUESTION_RESPONSE: QuestionResponse = {
    hand_id: -1,
    hand: EMPTY_HAND,
    score: EMPTY_SCORE
}

export type QuestionResponse = {
    hand_id: number,
    hand: Hand,
    score: Score
}

export type Hand = {
    hand_tiles: Tile[],
    winning_tile: Tile,
    open_melds: Meld[],
    situation: Situation,
}

export type Meld = {
    meld_tiles: Tile[],
    call_from: Side
}

export type Situation = {
    round_wind: Wind,
    seat_wind: Wind,
    upper_indicators: string[],
    lower_indicators: string[],
    tsumo: boolean,
    ready: boolean,
    first_around_ready: boolean,
    first_around_win: boolean,
    ready_around_win: boolean,
    last_tile_win: boolean,
    quad_tile_win: boolean,
    quad_turn_win: boolean
}

export type Score = {
    point: number,
    doubles: number,
    score: number,
    adjusted_score: number,
    limit_type: string,
    dealer: boolean,
    hand_limit: boolean,
    hand_types: HandType[],
    point_types: PointType[]
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
