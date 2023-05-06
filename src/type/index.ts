export const EMPTY_QUESTION_RESPONSE: QuestionResponse = {
    hand_id: -1,
    hand_tiles: [],
    melds: [],
    situation: {
      round_wind: "",
      seat_wind: "",
      upper_indicators: [],
      lower_indicators: [],
      is_tsumo: false,
      is_ready: false,
      is_frist_around_ready: false,
      is_first_around_win: false,
      is_ready_around_win: false,
      is_last_tile_win: false,
      is_quad_tile_win: false,
      is_quad_turn_win: false
    },
    score:{
        point: 0,
        doubles: 0,
        score: 0,
        adjusted_score: 0,
        limit_type: "",
        is_dealer: false,
        is_hand_limit: false,
        hand_types: [],
        point_types: []
    }
}

export type QuestionResponse = {
    hand_id: number,
    hand_tiles: string[],
    melds: Meld[],
    situation: Situation,
    score: Score
}

export type Meld = {
    meld_tiles: string[],
    call_from: string
}

export type Situation = {
    round_wind: string,
    seat_wind: string,
    upper_indicators: string[],
    lower_indicators: string[],
    is_tsumo: boolean,
    is_ready: boolean,
    is_frist_around_ready: boolean,
    is_first_around_win: boolean,
    is_ready_around_win: boolean,
    is_last_tile_win: boolean,
    is_quad_tile_win: boolean,
    is_quad_turn_win: boolean
}

export type Score = {
    point: number,
    doubles: number,
    score: number,
    adjusted_score: number,
    limit_type: string,
    is_dealer: boolean,
    is_hand_limit: boolean,
    hand_types: HandType[],
    point_types: PointType[]
}

export type HandType = {
    name: string,
    grade: string
}

export type PointType = {
    name: string,
    point: string
}
