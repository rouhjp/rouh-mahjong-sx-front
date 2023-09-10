import { ConcealedCondition, DealerCondition, EMPTY_QUESTION_RESPONSE, HandType, Meld, PointType, QuestionResponse, Score, Side, Tile, Wind, WinningCondition, isConcealedCondition, isDealerCondition, isTile, isWinningCondition } from "@/type";
import { NextApiRequest, NextApiResponse } from "next";
import { Client } from "pg";

export default function handler(req: NextApiRequest, res: NextApiResponse<QuestionResponse>) {
  const winningConditionString = req.query.winningCondition as string
  const winningCondition: WinningCondition = isWinningCondition(winningConditionString) ? winningConditionString : "all"

  const dealerConditionString = req.query.dealerCondition as string
  const dealerCondition: DealerCondition = isDealerCondition(dealerConditionString) ? dealerConditionString : "all"

  const concealedConditionString = req.query.concealedCondition as string
  const concealedCondition: ConcealedCondition = isConcealedCondition(concealedConditionString) ? concealedConditionString : "all"

  const doublesLowerLimit = parseInt(req.query.doublesLowerLimit as string) || 0
  const doublesUpperLimit = parseInt(req.query.doublesUpperLimit as string) || 0

  const handIdString = req.query.handId as string
  const handId: number | undefined = parseInt(handIdString) || undefined

  const { query, parameters } = createHandFetchQuery(winningCondition, dealerCondition, concealedCondition, doublesLowerLimit, doublesUpperLimit, handId)

  // console.log("DB_USER=" + process.env.DB_USER);
  // console.log("DB_PASS=" + process.env.DB_PASS);
  // console.log("DB_HOST=" + process.env.DB_HOST);
  // console.log("DB_PORT=" + process.env.DB_PORT);
  // console.log("DB_NAME=" + process.env.DB_NAME);

  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? ""),
    database: process.env.DB_NAME
  })

  client.connect()
    .then(() => {
      client.query(query, parameters, (err, result) => {
        if (err || !result) {
          console.log("something went wrong", err);
          res.status(500).send(EMPTY_QUESTION_RESPONSE);
          return;
        }
        const data = result.rows[0];
        if (!data) {
          console.log("not found");
          res.status(404).send(EMPTY_QUESTION_RESPONSE);
          return;
        }
        // console.log(data);
        res.status(200).send(createResponse(data));
      })
    })
    .catch((err) => {
      console.error(err.stack);
      res.status(500).send(EMPTY_QUESTION_RESPONSE);
    });
}

type QueryAndParameters = {
  query: string,
  parameters: string[],
}

const createHandFetchQuery = (
  winningCondition: WinningCondition,
  dealerCondition: DealerCondition,
  concealedCondition: ConcealedCondition,
  doublesLowerLimit: number,
  doublesUpperLimit: number,
  handId?: number,
): QueryAndParameters => {
  const conditions: string[] = []
  const parameters: string[] = []

  switch (winningCondition) {
    case "tsumo":
      conditions.push("h.IS_TSUMO = true")
      break;
    case "ron":
      conditions.push("h.iS_TSUMO = false")
      break;
  }

  switch (dealerCondition) {
    case "dealer":
      conditions.push("h.SEAT_WIND = 'E'")
      break;
    case "others":
      conditions.push("h.SEAT_WIND <> 'E'")
      break;
  }

  switch (concealedCondition) {
    case "concealed":
      conditions.push("NOT EXISTS (SELECT * FROM HAND_MELD hm WHERE hm.HAND_ID = h.HAND_ID AND hm.CALL_FROM <> 'S')")
      break;
    case "called":
      conditions.push("EXISTS (SELECT * FROM HAND_MELD hm WHERE hm.HAND_ID = h.HAND_ID AND hm.CALL_FROM <> 'S')")
      break;
  }

  if (doublesLowerLimit) {
    conditions.push(`CASE WHEN hs.IS_HAND_LIMIT THEN 13 ELSE hs.DOUBLES END >= $${parameters.length + 1}`)
    parameters.push(doublesLowerLimit.toString())
  }

  if (doublesUpperLimit) {
    conditions.push(`CASE WHEN hs.IS_HAND_LIMIT THEN 13 ELSE hs.DOUBLES END <= $${parameters.length + 1}`)
    parameters.push(doublesUpperLimit.toString())
  }

  if(handId) {
    conditions.push(`h.HAND_ID = $${parameters.length + 1}`)
    parameters.push(handId.toString())
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  console.log("where: "+whereClause);

  const query = `
    SELECT
        h.HAND_ID,
        htg.ALL_TILES,
        hmg.OPEN_MELDS,
        h.ROUND_WIND,
        h.SEAT_WIND,
        h.IS_TSUMO,
        h.IS_READY,
        h.IS_FIRST_AROUND_READY,
        h.IS_FIRST_AROUND_WIN,
        h.IS_READY_AROUND_WIN,
        h.IS_LAST_TILE_WIN,
        h.IS_QUAD_TILE_WIN,
        h.IS_QUAD_TURN_WIN,
        huig.UPPER_INDICATORS,
        hlig.LOWER_INDICATORS,
        hs.HAND_ID,
        hs.POINT,
        hs.DOUBLES,
        hs.SCORE,
        hs.ADJUSTED_SCORE,
        hs.LIMIT_TYPE,
        hs.IS_DEALER,
        hs.IS_HAND_LIMIT,
        hshtg.HAND_TYPES,
        hsptg.POINT_TYPES
    FROM HAND h
    LEFT JOIN (SELECT
                ht.HAND_ID,
                STRING_AGG(ht.TILE, '/' ORDER BY ht.TILE_ORDINAL) AS ALL_TILES
            FROM HAND_TILE ht
            GROUP BY ht.HAND_ID
        ) htg ON h.HAND_ID = htg.HAND_ID 
    LEFT JOIN (SELECT
                hmtg.HAND_ID,
                STRING_AGG(hmtg.MELD_TILES || ':' || hm.CALL_FROM, ',' ORDER BY hmtg.MELD_ORDINAL) AS OPEN_MELDS
            FROM (SELECT
                    hmt.HAND_ID,
                    hmt.MELD_ORDINAL,
                    STRING_AGG(hmt.TILE, '/' ORDER BY hmt.TILE_ORDINAL) AS MELD_TILES
                FROM HAND_MELD_TILE hmt
                GROUP BY hmt.HAND_ID, hmt.MELD_ORDINAL
            ) hmtg
            JOIN HAND_MELD hm ON hmtg.HAND_ID = hm.HAND_ID AND hmtg.MELD_ORDINAL = hm.MELD_ORDINAL
            GROUP BY hmtg.HAND_ID
        ) hmg ON h.HAND_ID = hmg.HAND_ID
    LEFT JOIN (SELECT
                hui.HAND_ID,
                STRING_AGG(hui.TILE, '/' ORDER BY hui.TILE_ORDINAL) AS UPPER_INDICATORS
            FROM HAND_UPPER_INDICATOR hui
            GROUP BY hui.HAND_ID
        ) huig ON h.HAND_ID = huig.HAND_ID 
    LEFT JOIN (SELECT
                hli.HAND_ID,
                STRING_AGG(hli.TILE, '/' ORDER BY hli.TILE_ORDINAL) AS LOWER_INDICATORS
            FROM HAND_LOWER_INDICATOR hli
            GROUP BY hli.HAND_ID
        ) hlig ON h.HAND_ID = hlig.HAND_ID 
    LEFT JOIN HAND_SCORE hs ON h.HAND_ID = hs.HAND_ID
    LEFT JOIN (SELECT
          hsht.HAND_ID,
          STRING_AGG(hsht.HAND_TYPE_NAME || ':' || 
            CASE WHEN hsht.IS_HAND_LIMIT AND hsht.LIMIT_MULTIPLIER = 1 THEN 'S'
              WHEN hsht.IS_HAND_LIMIT AND hsht.LIMIT_MULTIPLIER = 2 THEN 'W'
              ELSE CAST(hsht.DOUBLES AS VARCHAR(1)) END, ',' ORDER BY hsht.HAND_TYPE_ORDINAL) AS HAND_TYPES
        FROM HAND_SCORE_HAND_TYPE hsht
        GROUP BY hsht.HAND_ID
      ) hshtg ON hs.HAND_ID = hshtg.HAND_ID 
    LEFT JOIN (SELECT
          hspt.HAND_ID,
          STRING_AGG(hspt.POINT_TYPE_NAME || ':'  || 
            hspt.POINT, ',' ORDER BY hspt.POINT_TYPE_ORDINAL) AS POINT_TYPES
        FROM HAND_SCORE_POINT_TYPE hspt
        GROUP BY hspt.HAND_ID
      ) hsptg ON hs.HAND_ID = hsptg.HAND_ID 
    ${whereClause}
    ORDER BY RANDOM()
    FETCH FIRST 1 ROWS ONLY
  `
  return { query, parameters }
}

const createResponse = (data: any): QuestionResponse => {
  const openMeldsString: string = data.open_melds;
  const openMelds: Meld[] = openMeldsString ?
    Object.values(openMeldsString.split(",")).map(meldString => {
      const meldTiles: Tile[] = meldString.split(":")[0].split("/").filter(isTile);
      const callFrom: Side = toSide(meldString.split(":")[1]);
      return { meldTiles, callFrom };
    }) : [];
  const handTypesString: string = data.hand_types;
  const pointTypesString: string = data.point_types;
  const handTypes: HandType[] = handTypesString? Object.values(handTypesString.split(",")).map(handTypeString => {
    const name: string = handTypeString.split(":")[0];
    const grade: string = handTypeString.split(":")[1];
    return { name, grade }
  }): [];
  const pointTypes: PointType[] = pointTypesString? Object.values(pointTypesString.split(",")).map(pointTypeString => {
    const name: string = pointTypeString.split(":")[0];
    const point: number = parseInt(pointTypeString.split(":")[1]) || 0;
    return { name, point }
  }): [];
  const score: Score = {
    point: data.point,
    doubles: data.doubles,
    score: data.score,
    adjustedScore: data.adjusted_score,
    limitType: data.limit_type,
    isDealer: data.is_dealer,
    isHandLimit: data.is_hand_limit,
    handTypes: handTypes,
    pointTypes: pointTypes,
  }
  const handId: number = data.hand_id;
  const allTiles: Tile[] = data.all_tiles.split("/").filter(isTile);
  const winningTile: Tile = allTiles[allTiles.length - 1];
  const handTiles: Tile[] = allTiles.slice(0, allTiles.length - 1);
  const roundWind: Wind = toWind(data.round_wind);
  const seatWind: Wind = toWind(data.seat_wind);
  const upperIndicatorsString: string = data.upper_indicators;
  const upperIndicators: Tile[] = upperIndicatorsString ? upperIndicatorsString.split("/").filter(isTile) : [];
  const lowerIndicatorsString: string = data.lower_indicators;
  const lowerIndicators: Tile[] = lowerIndicatorsString ? lowerIndicatorsString.split("/").filter(isTile) : [];
  const isTsumo: boolean = data.is_tsumo;
  const isReady: boolean = data.is_ready;
  const isFirstAroundReady: boolean = data.is_first_around_ready;
  const isFirstAroundWin: boolean = data.is_first_around_win;
  const isReadyAroundWin: boolean = data.is_ready_around_win;
  const isLastTileWin: boolean = data.is_last_tile_win;
  const isQuadTileWin: boolean = data.is_quad_tile_win;
  const isQuadTurnWin: boolean = data.is_quad_turn_win;
  return {
    handId,
    hand: {
      handTiles,
      winningTile,
      openMelds,
      situation: {
        roundWind,
        seatWind,
        upperIndicators,
        lowerIndicators,
        isTsumo,
        isReady,
        isFirstAroundReady,
        isFirstAroundWin,
        isReadyAroundWin,
        isLastTileWin,
        isQuadTileWin,
        isQuadTurnWin,
      }
    },
    score: score
  }
}

const toSide = (code: string): Side => {
  switch (code) {
    case "S": return "SELF"
    case "R": return "RIGHT"
    case "A": return "ACROSS"
    case "L": return "LEFT"
    default: throw new Error("parse error: side=" + code)
  }
}

const toWind = (code: string): Wind => {
  switch (code) {
    case "E": return "EAST";
    case "S": return "SOUTH";
    case "W": return "WEST";
    case "N": return "NORTH";
    default: throw new Error("parse error: wind=" + code);
  }
}
