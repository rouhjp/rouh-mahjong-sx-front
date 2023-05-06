import type { NextApiRequest, NextApiResponse } from 'next'
import {QuestionResponse, Meld, Score, EMPTY_QUESTION_RESPONSE} from '@/type'
import { Client } from 'pg'

export default function handler(req: NextApiRequest, res: NextApiResponse<QuestionResponse>){

    const query = `
        SELECT
            h.HAND_ID,
            htg.HAND_TILES,
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
                    STRING_AGG(ht.TILE, '/' ORDER BY ht.TILE_ORDINAL) AS HAND_TILES
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
        --WHERE h.IS_TSUMO = FALSE
        --AND h.SEAT_WIND <> 'E'
        ORDER BY RANDOM()
        FETCH FIRST 1 ROWS ONLY
    `;

    // console.log(process.env.DB_USER);
    // console.log(process.env.DB_PASS);
    // console.log(process.env.DB_HOST);
    // console.log(process.env.DB_PORT);
    // console.log(process.env.DB_NAME);

    const client = new Client ({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT??""),
        database: process.env.DB_NAME
    });

    client.connect()
        .then(() => {
            console.log('connected');
            client.query(query, (err, result)=>{
                if(err || !result){
                    console.log(err);
                    return EMPTY_QUESTION_RESPONSE;
                }
                
                var data = result.rows[0];
                console.log(data);
                var openMeldsExpression:string = data.open_melds;
                var openMelds:Meld[] = !openMeldsExpression?[]:Object.values(openMeldsExpression.split(",")).map(openMeldExpression => {
                    return {
                        meld_tiles: openMeldExpression.split(":")[0].split("/"),
                        call_from: openMeldExpression.split(":")[1]
                    }
                });
                var handTypesExpression:string = data.hand_types;
                var pointTypesExpression:string = data.point_types;
                var score:Score = {
                    point: data.point,
                    doubles: data.doubles,
                    score: data.score,
                    adjusted_score: data.adjusted_score,
                    limit_type: data.limit_type,
                    is_dealer: data.is_dealer,
                    is_hand_limit: data.is_hand_limit,
                    hand_types: Object.values(handTypesExpression.split(",")).map(handTypeExpression => {
                        return {
                            name: handTypeExpression.split(":")[0],
                            grade: handTypeExpression.split(":")[1]
                        }
                    }),
                    point_types: !pointTypesExpression?[]:Object.values(pointTypesExpression.split(",")).map(pointTypesExpression => {
                        return {
                            name: pointTypesExpression.split(":")[0],
                            point: pointTypesExpression.split(":")[1]
                        }
                    })
                }
                
                res.status(200).json({ 
                    hand_id: data.hand_id,
                    hand_tiles: data.hand_tiles.split("/"),
                    melds: openMelds,
                    situation: {
                        round_wind: data.round_wind,
                        seat_wind: data.seat_wind,
                        upper_indicators: data.upper_indicators?data.upper_indicators.split("/"):[],
                        lower_indicators: data.lower_indicators?data.lower_indicators.split("/"):[],
                        is_tsumo: data.is_tsumo,
                        is_ready: data.is_ready,
                        is_frist_around_ready: data.is_first_round_ready,
                        is_first_around_win: data.is_first_around_win,
                        is_ready_around_win: data.is_ready_around_win,
                        is_last_tile_win: data.is_last_tile_win,
                        is_quad_tile_win: data.is_quad_tile_win,
                        is_quad_turn_win: data.is_quad_turn_win
                    },
                    score: score
                 })
            });
        })
        .catch((err) => {
            console.error(err.stack);
            res.status(500).send(EMPTY_QUESTION_RESPONSE);
        });
}