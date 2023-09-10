import { Answer, AnswerForm, EMPTY_ANSWER } from "@/components/answerForm";
import { HandTypeViewer } from "@/components/handTypeViewer";
import { HandViewer } from "@/components/handViewer";
import { QuestionConditionField } from "@/components/questionConditionField";
import { ScoreChartTable } from "@/components/scoreChartTable";
import { DEFAULT_CONDITION, EMPTY_QUESTION_RESPONSE, QuestionCondition, QuestionResponse, Score, isQuestionResponse } from "@/type";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import { SVGProps, useEffect, useRef, useState } from "react";
import useSWR from "swr";

const getNonDealerPaymentExpression = (score: number): string => {
  const dealerPayment = Math.ceil((score || 0) / 2 / 100) * 100;
  const nonDealerPayment = Math.ceil((score || 0) / 4 / 100) * 100;
  return `${nonDealerPayment}点/${dealerPayment}点`;
}

const getDealerPaymentExpression = (score: number): string => {
  const eachPayment = Math.ceil((score || 0) / 3 / 100) * 100;
  return `${eachPayment}点オール`;
}

const getExpression = (score: Score, isTsumo: boolean, isDealer: boolean): string => {
  return (score.point ? `${score.point}符` : "")
    + (score.doubles ? `${score.doubles}飜` : "")
    + score.limitType
    + score.score + "点"
    + ((isTsumo && isDealer) ? `(${getDealerPaymentExpression(score.score)})` : "")
    + ((isTsumo && !isDealer) ? `(${getNonDealerPaymentExpression(score.score)})` : "")
}

const API_URL = "api/hand";
const questionFetcher = async (key: string) => await fetch(key).then(response => response.json());

export default function Home() {
  const [url, setUrl] = useState<string>(API_URL);
  const [condition, setCondition] = useState<QuestionCondition>(DEFAULT_CONDITION);
  const { data, error, mutate } = useSWR<QuestionResponse>(url, questionFetcher, { revalidateOnFocus: false });
  const [answer, setAnswer] = useState<Answer>(EMPTY_ANSWER);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const isCorrect = data && (answer.score === data.score.score || answer.score === data.score.adjustedScore);
  const expression = data ? getExpression(data.score, data.hand.situation.isTsumo, data.hand.situation.seatWind === "EAST") : "";
  const parameters = Object.entries(condition).map(([key, value]) => `${key}=${value}`).join("&");
  const reloadQuestion = () => {
    //initialize states
    setAnswer(EMPTY_ANSWER);
    setIsAnswered(false);
    const random = `random=${Date.now()}` //add random arguments for avoiding cache
    setUrl(`${API_URL}?${parameters}&${random}`);
    mutate(null, false); // clear data
    mutate(); // execute api
  }
  return (
    <>
      <Head>
        <title>麻雀点数計算練習 </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="space-y-2 mt-2">
        {/* 出題エリア */}
        <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">麻雀<span className="text-[#008000]">点数計算</span>練習問題</h1>
            <input type="button"
              value="次の問題"
              disabled={!data && !error}
              onClick={reloadQuestion}
              className={(!data && !error) ?
                "bg-transparent text-gray-400 font-semibold py-1 px-2 border border-gray-400 rounded" :
                "hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"}
            />
          </div>
          <QuestionConditionField condition={condition} onChangeCondition={setCondition} />
          {(!data && !error) &&
            <p>読み込み中...</p>
          }
          {error &&
            <p>サーバにデータの読み込みができなかった...</p>
          }
          {data &&
            <div className="mb-1">
              <HandViewer
                handTiles={data.hand.handTiles}
                openMelds={data.hand.openMelds}
                winningTile={data.hand.winningTile}
                upperIndicators={data.hand.situation.upperIndicators}
                lowerIndicators={data.hand.situation.lowerIndicators}
                roundWind={data.hand.situation.roundWind}
                seatWind={data.hand.situation.seatWind}
                isTsumo={data.hand.situation.isTsumo}
                isReady={data.hand.situation.isReady}
                isFirstAroundReady={data.hand.situation.isFirstAroundReady}
                isFirstAroundWin={data.hand.situation.isFirstAroundWin}
                isReadyAroundWin={data.hand.situation.isReadyAroundWin}
                isLastTileWin={data.hand.situation.isLastTileWin}
                isQuadTileWin={data.hand.situation.isQuadTileWin}
                isQuadTurnWin={data.hand.situation.isQuadTurnWin}
              />
            </div>
          }
        </div>
        {/* 回答エリア */}
        {data &&
          <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
            <AnswerForm
              isTsumo={data.hand.situation.isTsumo}
              isDealer={data.hand.situation.seatWind === "EAST"}
              answer={answer}
              setAnswer={setAnswer}
              isAnswered={isAnswered}
              setIsAnswered={setIsAnswered}
            />
            <p className="text-xs text-[#808080]">※点数が一致すれば正解となります</p>
          </div>
        }
        {/* 結果エリア */}
        {(data && isAnswered) &&
          <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
            <div className="mb-5">
              {isCorrect &&
                <div className="flex items-center gap-1">
                  <AkarIconsCircleCheck color="#008b00"></AkarIconsCircleCheck>
                  <h2 className="text-[#008b00] text-2xl font-bold">正解！</h2>
                </div>
              }
              {!isCorrect &&
                <div className="flex items-center gap-1">
                  <AkarIconsCircleX color="#8b0000"></AkarIconsCircleX>
                  <h2 className="text-[#8b0000] text-2xl font-bold">不正解...</h2>
                </div>
              }
              <p className="text-2xl">{expression}</p>
            </div>
            <div className="mb-4">
              <HandTypeViewer
                handTypes={data.score.handTypes}
                pointTypes={data.score.pointTypes}
              />
            </div>
            <div className="overflow-x-scroll overflow-y-hidden mb-1">
              <ScoreChartTable
                isDealer={data.score.isDealer}
                targetPoint={data.score.point}
                targetDoubles={data.score.doubles}
              />
            </div>
          </div>
        }
        {/* フッターエリア */}
        <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
          <div className="text-xs text-[#808080]">
            <p>開発者: 運輸犬 <a href="https://twitter.com/kawaiiseeker" target="_blank" rel="noopener noreferrer">@kawaiiseeker</a></p>
            {/*<p>お金に余裕がある方はアマギフ買ってくれるとサーバ代の足しになります: <a href="https://www.amazon.jp/hz/wishlist/ls/1Z5ETCS6OKYOE?ref_=wl_share">ほしいものリスト</a></p>*/}
          </div>
        </div>
      </main>
    </>
  )
}

//https://icones.js.org/collection/akar-icons
export function AkarIconsCircleCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8 12.5l3 3l5-6"></path><circle cx="12" cy="12" r="10"></circle></g></svg>
  )
}


export function AkarIconsCircleX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M15 15L9 9m6 0l-6 6"></path><circle cx="12" cy="12" r="10"></circle></g></svg>
  )
}
