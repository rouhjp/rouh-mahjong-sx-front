import Head from 'next/head'
import styles from '@/styles/Question.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import type {QuestionResponse} from '@/type'
import {EMPTY_QUESTION_RESPONSE} from '@/type'

type Answer = {
  point: number,
  doubles: number,
  limit: string,
  score: number
}

export default function Home() {
  const [error, setError] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionResponse>(EMPTY_QUESTION_RESPONSE);
  const [guessPoint, setGuessPoint] = useState<number>(0);
  const [guessDoubles, setGuessDoubles] = useState<number>(0);
  const [guessLimit, setGuessLimit] = useState<string>("");
  const [guessScore, setGuessScore] = useState<number>(0);
  const [answer, setAnswer] = useState<Answer>();

  const initialize = ()=> {
    setInitialized(false);
    axios.get("api/hand").then((response) => {
      const data = response.data;
      console.log("first around ready?"+data.situation.is_first_around_ready)
      setQuestion(data);
      setGuessPoint(0);
      setGuessDoubles(0);
      setGuessLimit("");
      setGuessScore(0);
      setAnswer(undefined);
      setInitialized(true);
      setError(0);
    })
    .catch((err) => {
      setError(err.response.status);
    });
  }

  useEffect(()=>{
    initialize();
  }, [])

  return (
    <>
      <Head>
        <title>麻雀点数計算練習</title>
        <meta name="description" content="麻雀の点数計算ができるようになるために練習問題を解くアプリです" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.title_area}>
              <h1>麻雀<span>点数計算</span>練習問題</h1>
              <input className={styles.next_button} type="button" value="次の問題" onClick={e=> initialize()}/>
            </div>
            {error==404 &&
              <p>データが見つからなかった...</p>
            }
            {error!=404 && !!error &&
              <p>サーバにデータの読み込みができなかった...</p>
            }
            {!initialized && !error &&
              <p>読み込み中...</p>
            }
            {initialized &&
              <>
                <div>
                  <ul className={styles.situations}>
                    <li>場風:{get_wind_text(question.situation.round_wind)}</li>
                    <li>自風:{get_wind_text(question.situation.seat_wind)}</li>
                    <li>{question.situation.seat_wind=="E"?"親":"子"}</li>
                    <li>{question.situation.is_tsumo?"ツモ":"ロン"}</li>
                  </ul>
                  <ul className={styles.options}>
                    {question.situation.is_first_around_ready &&
                      <li>ダブル立直</li>
                    }
                    {!question.situation.is_first_around_ready && question.situation.is_ready &&
                      <li>立直</li>
                    }
                    {question.situation.is_first_around_win && question.situation.is_tsumo && question.situation.seat_wind=="E" &&
                      <li>天和</li>
                    }
                    {question.situation.is_first_around_win && question.situation.is_tsumo && question.situation.seat_wind!="E" &&
                      <li>地和</li>
                    }
                    {question.situation.is_ready_around_win &&
                      <li>一発</li>
                    }
                    {question.situation.is_quad_tile_win &&
                      <li>槍槓</li>
                    }
                    {question.situation.is_quad_turn_win &&
                      <li>嶺上開花</li>
                    }
                    {question.situation.is_last_tile_win && question.situation.is_tsumo &&
                      <li>海底摸月</li>
                    }
                    {question.situation.is_last_tile_win && question.situation.is_tsumo &&
                      <li>河底撈魚</li>
                    }
                  </ul>
                </div>
                <div>
                  <ul className={styles.hand_tiles}>
                    {
                      Object.values(question.hand_tiles).map((hand_tile, index) => {
                        return <li key={index}><img className={styles.tile_image} src={"tiles/"+hand_tile+".jpg"}/></li>;
                      })
                    }
                  </ul>
                  {question.melds.length>0 && 
                    <>
                      <p className={`${styles.guide} ${styles.sp_only}`}>副露</p>
                      {Object.values(question.melds).map((meld, meld_index) => 
                        <ul key={meld_index} className={styles.meld_tiles}>
                          {meld.call_from=='S' &&
                            <>
                              <li key={0}><img className={styles.tile_image} src={"tiles/back.jpg"}/></li>
                              <li key={1}><img className={styles.tile_image} src={"tiles/"+meld.meld_tiles[1]+".jpg"}/></li>
                              <li key={2}><img className={styles.tile_image} src={"tiles/"+meld.meld_tiles[2]+".jpg"}/></li>
                              <li key={3}><img className={styles.tile_image} src={"tiles/back.jpg"}/></li>
                            </>
                          }
                          {meld.call_from!='S' &&
                            Object.values(meld.meld_tiles).map((meld_tile, tile_index) => {
                              return <li key={meld_index + '-' +tile_index}><img className={styles.tile_image} src={"tiles/"+meld_tile+".jpg"}/></li>;
                            })
                          }
                        </ul>
                      )}
                    </>
                  }
                </div>
                <p className={styles.guide}>ドラ表示牌</p>
                <div>
                  <ul className={styles.upper_indicators}>
                    {Array.from(Array(5).keys()).map((index)=>{
                      if(index < question.situation.upper_indicators.length){
                        return <li key={index}><img className={styles.tile_image} src={"tiles/"+question.situation.upper_indicators[index]+".jpg"} /></li>
                      }else{
                        return <li key={index}><img className={styles.tile_image} src={"tiles/back.jpg"} /></li>
                      }
                    })}
                  </ul>
                  {question.situation.lower_indicators.length > 0 &&
                    <ul className={styles.lower_indicators}>
                      {Array.from(Array(5).keys()).map((index)=>{
                        if(index < question.situation.lower_indicators.length){
                          return <li key={index}><img className={styles.tile_image} src={"tiles/"+question.situation.lower_indicators[index]+".jpg"} /></li>
                        }else{
                          return <li key={index}><img className={styles.tile_image} src={"tiles/back.jpg"} /></li>
                        }
                      })}
                    </ul>
                  }
                </div>
              </>
            }
          </div>
          {initialized &&
            <div className={styles.container}>
              <div className={styles.answer_area}>
                <div>
                  <select value={guessPoint} onChange={e => setGuessPoint(parseInt(e.target.value) || 0)}>
                    <option value="0"></option>
                    {Object.values([20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]).map((point, index)=>{
                        return <option key={index} value={point}>{point}</option>
                      })
                    }
                  </select>
                  <span>符</span>
                </div>
                <div>
                  <select value={guessDoubles} onChange={e => setGuessDoubles(parseInt(e.target.value) || 0)}>
                    <option value="0"></option>
                    {Array.from(Array(15).keys()).map((index)=>{
                        return <option key={index} value={index + 1}>{index + 1}</option>
                      })
                    }
                  </select>
                  <span>飜</span>
                </div>
                <div className={styles.limit_box}>
                  <select value={guessLimit} onChange={e => setGuessLimit(e.target.value)}>
                    {Object.values(["", "満貫", "跳満", "倍満", "三倍満", "役満", "二倍役満", "三倍役満", "四倍役満"]).map((limit, index)=>{
                        return <option key={index} value={limit}>{limit}</option>
                      })
                    }
                  </select>
                </div>
                <div>
                  <input className={styles.guess_score} value={guessScore}
                    onChange={e => setGuessScore(parseInt(e.target.value) || 0)}
                    onKeyDown={e => {
                      if (e.key=='Enter'){
                        setAnswer({point:guessPoint, doubles:guessDoubles, limit:guessLimit, score:guessScore})
                      }
                    }}></input>
                  <span>点</span>
                </div>
                <div>
                  {question.situation.is_tsumo && question.situation.seat_wind!="E" &&
                    <span>{'('}{Math.ceil(guessScore/4/100)*100}点/{Math.ceil(guessScore/2/100)*100}点{')'}</span>
                  }
                  {question.situation.is_tsumo && question.situation.seat_wind=="E" &&
                    <span>{'('}{Math.ceil(guessScore/3/100)*100}点オール{')'}</span>
                  }
                </div>
                <input type="button" value="回答する" onClick={e => setAnswer({point:guessPoint, doubles:guessDoubles, limit:guessLimit, score:guessScore})}></input>
              </div>
              <p className={styles.note}>※点数が一致すれば正解となります</p>
            </div>
          }
          {initialized && answer &&
            <div className={styles.container}>
              {(answer.score == question.score.score || answer.score == question.score.adjusted_score)?(
                <h2 className={styles.answer_result}>正解！</h2>
              ):(
                <h2 className={styles.answer_result}>不正解...</h2>
              )}
              <div className={styles.score_expression}>
                {question.score.point>0 &&
                  <span>{question.score.point}符</span>
                }
                {question.score.doubles>0 &&
                  <span>{question.score.doubles}飜</span>
                }
                {question.score.limit_type &&
                  <span>{question.score.limit_type}</span>
                }
                <span>{question.score.score}点</span>
                {question.situation.is_tsumo && question.situation.seat_wind!="E" &&
                  <span>{'('}{Math.ceil(question.score.score/4/100)*100}点/{Math.ceil(question.score.score/2/100)*100}点{')'}</span>
                }
                {question.situation.is_tsumo && question.situation.seat_wind=="E" &&
                  <span>{'('}{Math.ceil(question.score.score/3/100)*100}点オール{')'}</span>
                }
              </div>
              <div className={styles.type_table}>
                <ul className={styles.hand_types}>
                  {Object.values(question.score.hand_types).map((hand_type, index)=>
                    <li key={index}>
                      <div className={styles.hand_type_name}>{hand_type.name}</div>
                      <div className={styles.hand_type_grade}>{get_grade_text(hand_type.grade)}</div>
                    </li>
                  )}
                </ul>
                {question.score.point_types.length>0 &&
                  <ul className={styles.point_types}>
                    {Object.values(question.score.point_types).map((point_type, index)=>
                      <li key={index}>
                        <div className={styles.point_type_name}>{point_type.name}</div>
                        <div className={styles.point_type_point}>{point_type.point}</div>
                      </li>
                  )}
                </ul>
                }
              </div>
              <div className={styles.score_table_area}>
                {(()=>{
                  const point_steps = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
                  const doubles_steps = [1, 2, 3, 4, 5, 6, 8, 11, 13];
                  const point_headers = <>
                    <tr>
                      <th>
                        {question.situation.seat_wind=="E"?"親":"子"}
                      </th>
                      {Object.values(point_steps).map((point_step, index)=>
                        <th key={index} className={point_step==question.score.point?styles.selected:""}>{point_step}符</th>
                      )}
                    </tr>
                  </>
                  const selected_step_index = (()=>{
                    var index = Object.values(doubles_steps).findIndex(step=>step>question.score.doubles);
                    if(index==-1) return doubles_steps.length - 1;
                    return index -1;
                  })();
                  const doubles_step_texts =
                    Object.values(doubles_steps).map((step, index)=>{
                      if(index==doubles_steps.length - 1){
                        return step+"-飜";
                      }
                      if(step==doubles_steps[index + 1] - 1){
                        return step+"飜";
                      }
                      return step+"-"+(doubles_steps[index + 1] - 1)+"飜";
                    })
                  const score_map = Object.values(doubles_steps).map(doubles=>Object.values(point_steps).map(point=>get_score(point, doubles, question.score.is_dealer)));
                  const table_content = Object.values(doubles_steps).map((doubles, row_index)=>
                    <tr key={row_index}>
                      <th className={row_index==selected_step_index?styles.selected:""}>{doubles_step_texts[row_index]}</th>
                      {Object.values(point_steps).map((point, col_index)=>{
                        const score = score_map[row_index][col_index];
                        const limit_type = get_limit_type(point, doubles);
                        const show_text = !limit_type || (doubles>=5 && point==60);
                        const show_limit = doubles>=5 && point==50;
                        const show_score = doubles>=2 || point>=30;
                        const text = show_limit?limit_type:(show_text?(show_score?score:"-"):"");
                        const border_left:boolean = score!=score_map[row_index][col_index - 1];
                        const border_right:boolean = score!=score_map[row_index][col_index + 1];
                        const border_top:boolean = row_index==0 || score_map[row_index - 1] && score!=score_map[row_index - 1][col_index];
                        const border_bottom:boolean = row_index==(doubles_steps.length + 1) || score_map[row_index + 1] && score!=score_map[row_index + 1][col_index];
                        return <td key={col_index} className={`${border_left?styles.border_left:""} ${border_right?styles.border_right:""} ${border_top?styles.border_top:""} ${border_bottom?styles.border_bottom:""}`}>{text}</td>
                      })}
                    </tr>
                  );
                  return <table className={styles.score_table}>
                    <tbody>
                      {point_headers}
                      {table_content}
                    </tbody>
                  </table>
                })()}
              </div>
            </div>
          }

          
          <div className={styles.footer}>
            <p>開発者: 運輸犬 <a href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a></p>
            <p>お金に余裕がある方はアマギフ買ってくれるとサーバ代の足しになります: <a href="https://www.amazon.jp/hz/wishlist/ls/1Z5ETCS6OKYOE?ref_=wl_share">ほしいものリスト</a></p>
          </div>
        </div>
      </main>      
    </>
  )
}

const get_limit_type = (point :number, doubles :number):string => {
  if(doubles>=13) return "役満";
  if(doubles>=11) return "三倍満";
  if(doubles>=8) return "倍満";
  if(doubles>=6) return "跳満";
  if(doubles==5) return "満貫";
  if(doubles==4 && point>=40) return "満貫";
  if(doubles==3 && point>=70) return "満貫";
  return "";
}

const get_score = (point :number, doubles :number, is_dealer:boolean):number => {
  const multiplier = is_dealer?6:4;
  if(doubles>=13) return 8000*multiplier;
  if(doubles>=11) return 6000*multiplier;
  if(doubles>=8) return 4000*multiplier;
  if(doubles>=6) return 3000*multiplier;
  if(doubles==5) return 2000*multiplier;
  const score = Math.min(2000, point*Math.pow(2, doubles + 2))*multiplier;
  return Math.ceil(score/100)*100;
}

const get_grade_text = (code :string):string => {
  switch (code) {
    case 'S':
      return "役満";
    case 'W':
      return "ダブル役満";
    default:
      return code + "飜";
  }
}

const get_wind_text = (code :string):string => {
  switch (code) {
    case "E":
      return "東";
    case "S":
      return "南";
    case "W":
      return "西";
    case "N":
      return "北";
    default:
      return "";
  }
}
