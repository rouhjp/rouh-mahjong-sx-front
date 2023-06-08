import Head from 'next/head'
import styles from '@/styles/Question.module.css'
import { useEffect, useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import {Hand, QuestionResponse, Score} from '@/type'
import {EMPTY_HAND, EMPTY_SCORE} from '@/type'

type Answer = {
  point: number,
  doubles: number,
  limit: string,
  score: number,
}

const EMPTY_ANSWER: Answer = {
  point: 0,
  doubles: 0,
  limit: "",
  score: 0
}

export default function Home() {
  const [error, setError] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [hand, setHand] = useState<Hand>(EMPTY_HAND);
  const [correctScore, setCorrectScore] = useState<Score>(EMPTY_SCORE);

  const [answer, setAnswer] = useState<Answer>(EMPTY_ANSWER);
  const [answered, setAnswered] = useState<boolean>(false);

  const [showCondition, setShowCondition] = useState<boolean>(false);
  const [playerType, setPlayerType] = useState<string>("");
  const [winningType, setWinningType] = useState<string>("");
  const [doublesLower, setDoublesLower] = useState<number>(0);
  const [doublesUpper, setDoublesUpper] = useState<number>(0);

  const initialize = ()=> {
    setInitialized(false);
    const end_point = "api/hand";
    const parameters = "?winning_type="+winningType
      + "&player_type="+playerType
      + "&doubles_lower="+doublesLower
      + "&doubles_upper="+doublesUpper;
    axios.get(end_point+parameters).then((response: AxiosResponse<QuestionResponse>) => {
      const data :QuestionResponse = response.data;
      console.log("debug code: "+data.hand_id);
      console.log(data.hand);
      setHand(data.hand);
      setCorrectScore(data.score);
      setAnswer(EMPTY_ANSWER);
      setAnswered(false);
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
            <p className={styles.setting_button} onClick={e=> setShowCondition(!showCondition)}>{showCondition?"▼ 出題条件":"▶ 出題条件"}</p>
            {showCondition &&
              <div className={styles.setting_area}>
                <div>
                  <select onChange={e => setPlayerType(e.target.value)}>
                    <option value="all">全て</option>
                    <option value="dealer">親</option>
                    <option value="others">子</option>
                  </select>
                </div>
                <div>
                  <select onChange={e => setWinningType(e.target.value)}>
                    <option value="all">全て</option>
                    <option value="tsumo">ツモ</option>
                    <option value="ron">ロン</option>
                  </select>
                </div>
                <div>
                  <select onChange={e=>{
                    const new_doubles_lower = parseInt(e.target.value) || 0;
                    const new_doubles_upper = new_doubles_lower==0?doublesUpper:(doublesUpper==0?0:Math.max(new_doubles_lower, doublesUpper));
                    setDoublesLower(new_doubles_lower);
                    setDoublesUpper(new_doubles_upper);
                  }} value={doublesLower}>
                    <option key={0}></option>
                    {Array.from(Array(13).keys()).map((index)=>{
                      return <option key={index + 1} value={index + 1}>{index + 1}</option>
                    })}
                  </select>
                  <span>飜以上</span>
                </div>
                <div>
                  <select onChange={e=>{
                    const new_doubles_upper = parseInt(e.target.value) || 0;
                    const new_doubles_lower = new_doubles_upper==0?doublesLower:(doublesLower==0?0:Math.min(new_doubles_upper, doublesLower));
                    setDoublesLower(new_doubles_lower);
                    setDoublesUpper(new_doubles_upper);
                  }} value={doublesUpper}>
                    <option key={0} value={0}></option>
                    {Array.from(Array(13).keys()).map((index)=>{
                        return <option key={index + 1} value={index + 1}>{index + 1}</option>
                      })
                    }
                  </select>
                  <span>飜以下</span>
                </div>
              </div>
            }
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
                    <li>場風:{get_wind_text(hand.situation.round_wind)}</li>
                    <li>自風:{get_wind_text(hand.situation.seat_wind)}</li>
                    <li>{hand.situation.seat_wind=="EAST"?"親":"子"}</li>
                    <li>{hand.situation.tsumo?"ツモ":"ロン"}</li>
                  </ul>
                  <ul className={styles.options}>
                    {hand.situation.first_around_ready &&
                      <li>ダブル立直</li>
                    }
                    {!hand.situation.first_around_ready && hand.situation.ready &&
                      <li>立直</li>
                    }
                    {hand.situation.first_around_win && hand.situation.tsumo && hand.situation.seat_wind=="EAST" &&
                      <li>天和</li>
                    }
                    {hand.situation.first_around_win && hand.situation.tsumo && hand.situation.seat_wind!="EAST" &&
                      <li>地和</li>
                    }
                    {hand.situation.ready_around_win &&
                      <li>一発</li>
                    }
                    {hand.situation.quad_tile_win &&
                      <li>槍槓</li>
                    }
                    {hand.situation.quad_turn_win &&
                      <li>嶺上開花</li>
                    }
                    {hand.situation.last_tile_win && hand.situation.tsumo &&
                      <li>海底摸月</li>
                    }
                    {hand.situation.last_tile_win && !hand.situation.tsumo &&
                      <li>河底撈魚</li>
                    }
                  </ul>
                </div>
                <div>
                  <ul className={styles.hand_tiles}>
                    {
                      Object.values([...hand.hand_tiles, hand.winning_tile]).map((hand_tile, index) => {
                        return <li key={index}><img className={styles.tile_image} src={"tiles/"+hand_tile+".jpg"}/></li>;
                      })
                    }
                  </ul>
                  {hand.open_melds.length>0 && 
                    <>
                      <p className={`${styles.guide} ${styles.sp_only}`}>副露</p>
                      {Object.values(hand.open_melds).map((meld, meld_index) => 
                        <ul key={meld_index} className={styles.meld_tiles}>
                          {meld.call_from=="SELF" &&
                            <>
                              <li key={0}><img className={styles.tile_image} src={"tiles/back.jpg"}/></li>
                              <li key={1}><img className={styles.tile_image} src={"tiles/"+meld.meld_tiles[1]+".jpg"}/></li>
                              <li key={2}><img className={styles.tile_image} src={"tiles/"+meld.meld_tiles[2]+".jpg"}/></li>
                              <li key={3}><img className={styles.tile_image} src={"tiles/back.jpg"}/></li>
                            </>
                          }
                          {meld.call_from!="SELF" &&
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
                      if(index < hand.situation.upper_indicators.length){
                        return <li key={index}><img className={styles.tile_image} src={"tiles/"+hand.situation.upper_indicators[index]+".jpg"} /></li>
                      }else{
                        return <li key={index}><img className={styles.tile_image} src={"tiles/back.jpg"} /></li>
                      }
                    })}
                  </ul>
                  {hand.situation.lower_indicators.length > 0 &&
                    <ul className={styles.lower_indicators}>
                      {Array.from(Array(5).keys()).map((index)=>{
                        if(index < hand.situation.lower_indicators.length){
                          return <li key={index}><img className={styles.tile_image} src={"tiles/"+hand.situation.lower_indicators[index]+".jpg"} /></li>
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
                  <select value={answer.point} onChange={e => setAnswer({...answer, point:parseInt(e.target.value) || 0})}>
                    <option value="0"></option>
                    {Object.values([20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]).map((point, index)=>{
                        return <option key={index} value={point}>{point}</option>
                      })
                    }
                  </select>
                  <span>符</span>
                </div>
                <div>
                  <select value={answer.doubles} onChange={e => setAnswer({...answer, doubles:parseInt(e.target.value) || 0})}>
                    <option value="0"></option>
                    {Array.from(Array(15).keys()).map((index)=>{
                        return <option key={index} value={index + 1}>{index + 1}</option>
                      })
                    }
                  </select>
                  <span>飜</span>
                </div>
                <div className={styles.limit_box}>
                  <select value={answer.limit} onChange={e => setAnswer({...answer, limit:e.target.value})}>
                    {Object.values(["", "満貫", "跳満", "倍満", "三倍満", "役満", "二倍役満", "三倍役満", "四倍役満"]).map((limit, index)=>{
                        return <option key={index} value={limit}>{limit}</option>
                      })
                    }
                  </select>
                </div>
                <div>
                  <input className={styles.guess_score} value={answer.score}
                    onChange={e => setAnswer({...answer, score:parseInt(e.target.value) || 0})}
                    onKeyDown={e => {
                      if (e.key=='Enter'){
                        setAnswered(true)
                      }
                    }}></input>
                  <span>点</span>
                </div>
                <div>
                  {hand.situation.tsumo && hand.situation.seat_wind!="EAST" &&
                    <span>{'('}{Math.ceil((answer.score || 0)/4/100)*100}点/{Math.ceil((answer.score || 0)/2/100)*100}点{')'}</span>
                  }
                  {hand.situation.tsumo && hand.situation.seat_wind=="EAST" &&
                    <span>{'('}{Math.ceil((answer.score || 0)/3/100)*100}点オール{')'}</span>
                  }
                </div>
                <input type="button" value="回答する" onClick={e => setAnswered(true)}></input>
              </div>
              <p className={styles.note}>※点数が一致すれば正解となります</p>
            </div>
          }
          {initialized && answered &&
            <div className={styles.container}>
              {(answer.score===correctScore.score || answer.score===correctScore.adjusted_score)?(
                <h2 className={styles.answer_result}>正解！</h2>
              ):(
                <h2 className={styles.answer_result}>不正解...</h2>
              )}
              <div className={styles.score_expression}>
                {correctScore.point>0 &&
                  <span>{correctScore.point}符</span>
                }
                {correctScore.doubles>0 &&
                  <span>{correctScore.doubles}飜</span>
                }
                {correctScore.limit_type &&
                  <span>{correctScore.limit_type}</span>
                }
                <span>{correctScore.score}点</span>
                {hand.situation.tsumo && hand.situation.seat_wind!="EAST" &&
                  <span>{'('}{Math.ceil(correctScore.score/4/100)*100}点/{Math.ceil(correctScore.score/2/100)*100}点{')'}</span>
                }
                {hand.situation.tsumo && hand.situation.seat_wind=="EAST" &&
                  <span>{'('}{Math.ceil(correctScore.score/3/100)*100}点オール{')'}</span>
                }
              </div>
              <div className={styles.type_table}>
                <ul className={styles.hand_types}>
                  {Object.values(correctScore.hand_types).map((hand_type, index)=>
                    <li key={index}>
                      <div className={styles.hand_type_name}>{hand_type.name}</div>
                      <div className={styles.hand_type_grade}>{get_grade_text(hand_type.grade)}</div>
                    </li>
                  )}
                </ul>
                {correctScore.point_types.length>0 &&
                  <ul className={styles.point_types}>
                    {Object.values(correctScore.point_types).map((point_type, index)=>
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
                        {hand.situation.seat_wind=="EAST"?"親":"子"}
                      </th>
                      {Object.values(point_steps).map((point_step, index)=>
                        <th key={index} className={point_step==correctScore.point?styles.selected:""}>{point_step}符</th>
                      )}
                    </tr>
                  </>
                  const selected_step_index = (()=>{
                    var effective_doubles = correctScore.hand_limit?13:correctScore.doubles;
                    var index = Object.values(doubles_steps).findIndex(step=>step>effective_doubles);
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
                  const score_map = Object.values(doubles_steps).map(doubles=>Object.values(point_steps).map(point=>get_score(point, doubles, correctScore.dealer)));
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
            {/*<p>お金に余裕がある方はアマギフ買ってくれるとサーバ代の足しになります: <a href="https://www.amazon.jp/hz/wishlist/ls/1Z5ETCS6OKYOE?ref_=wl_share">ほしいものリスト</a></p>*/}
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

const get_score = (point :number, doubles :number, dealer:boolean):number => {
  const multiplier = dealer?6:4;
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
    case "S":
      return "役満";
    case "W":
      return "ダブル役満";
    default:
      return code + "飜";
  }
}

const get_wind_text = (code :string):string => {
  switch (code) {
    case "EAST":
      return "東";
    case "SOUTH":
      return "南";
    case "WEST":
      return "西";
    case "NORTH":
      return "北";
    default:
      return "";
  }
}
