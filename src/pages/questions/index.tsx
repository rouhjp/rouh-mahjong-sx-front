import { Answer, AnswerForm, EMPTY_ANSWER } from "@/components/answerForm";
import { HandTypeViewer } from "@/components/handTypeViewer";
import { HandViewer } from "@/components/handViewer";
import { QuestionConditionField } from "@/components/questionConditionField";
import { ScoreChartTable } from "@/components/scoreChartTable";
import { DEFAULT_CONDITION, QuestionCondition, Question, Score, isQuestion } from "@/type";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { SVGProps, useEffect, useState } from "react";

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

const getOgpExpression = (question: Question): string => {
  const chunks = [];
  chunks.push(question.hand.handTiles.join(''));
  chunks.push(question.hand.winningTile);
  for (const meld of question.hand.openMelds) {
    chunks.push(meld.meldTiles.slice(0, 3).join(''));
  }
  return chunks.join('-');
}

const API_URL = 'api/hand';

export default function Home() {
  const router = useRouter();
  const [condition, setCondition] = useState<QuestionCondition>(DEFAULT_CONDITION);
  const [question, setQuestion] = useState<Question>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [answer, setAnswer] = useState<Answer>(EMPTY_ANSWER);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const isCorrect = question && (answer.score === question.score.score || answer.score === question.score.adjustedScore);
  const expression = question ? getExpression(question.score, question.hand.situation.isTsumo, question.hand.situation.seatWind === "EAST") : "";
  const ogImageUrl = question ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ogp/${getOgpExpression(question)}` : "";
  //TODO SSR対応
  const ogFixedImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ogp/M1M1M1M2M3M4M5M6M7M8M9M9M9-M5`

  // 問題データ取得
  const fetchQuestion = async (key: string) => {
    console.log(key);
    const response = await fetch(key);
    if(!response || response.status==500) {
      setErrorMessage("サーバにデータの読み込みができなかった...");
    }else if(response.status==400) {
      setErrorMessage("データがみつからなかった...");
    }else{
      const data = await response.json();
      if(isQuestion(data)){
        setQuestion(data);
        setErrorMessage("");
        router.push({pathname: router.pathname, query: {id: data.handId}}, undefined, {shallow: true})
      } else {
        setErrorMessage("予期せぬエラーが発生した...");
      }
    }
  }

  // 初期問題データ取得
  useEffect(()=>{
    if(!router.isReady) return;
    const getFetchKey = () => {
      const params = new URLSearchParams();
      if(router.query.id) {
        params.set('handId', String(router.query.id));
      }
      return `${API_URL}?${params.toString()}`
    }
    fetchQuestion(getFetchKey());
  }, [router.isReady]);

  // 次の問題データ取得
  const reloadQuestion = () => {
    setQuestion(undefined)
    setAnswer(EMPTY_ANSWER);
    setIsAnswered(false);
    const getNextFetchKey = () => {
      const parameters = Object.entries(condition).map(([key, value]) => `${key}=${value}`).join("&");
      return `${API_URL}?${parameters}`
    }
    fetchQuestion(getNextFetchKey());
  }

  return (
    <>
      <Head>
        <title>麻雀点数計算練習 </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="麻雀点数計算練習" />
        <meta property="og:description" content="麻雀点数計算練習を練習するアプリです" />
        <meta property="og:image" content={ogFixedImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="space-y-2 mt-2">
        {/* 出題エリア */}
        <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">麻雀<span className="text-[#008000]">点数計算</span>練習問題</h1>
            <input type="button"
              value="次の問題"
              disabled={!question && !errorMessage}
              onClick={reloadQuestion}
              className={(!question && !errorMessage) ?
                "bg-transparent text-gray-400 font-semibold py-1 px-2 border border-gray-400 rounded" :
                "hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"}
            />
          </div>
          <QuestionConditionField condition={condition} onChangeCondition={setCondition} />
          {(!question && !errorMessage) &&
            <p>読み込み中...</p>
          }
          {errorMessage &&
            <p>{errorMessage}</p>
          }
          {question &&
            <div className="mb-1">
              <HandViewer
                handTiles={question.hand.handTiles}
                openMelds={question.hand.openMelds}
                winningTile={question.hand.winningTile}
                upperIndicators={question.hand.situation.upperIndicators}
                lowerIndicators={question.hand.situation.lowerIndicators}
                roundWind={question.hand.situation.roundWind}
                seatWind={question.hand.situation.seatWind}
                isTsumo={question.hand.situation.isTsumo}
                isReady={question.hand.situation.isReady}
                isFirstAroundReady={question.hand.situation.isFirstAroundReady}
                isFirstAroundWin={question.hand.situation.isFirstAroundWin}
                isReadyAroundWin={question.hand.situation.isReadyAroundWin}
                isLastTileWin={question.hand.situation.isLastTileWin}
                isQuadTileWin={question.hand.situation.isQuadTileWin}
                isQuadTurnWin={question.hand.situation.isQuadTurnWin}
              />
            </div>
          }
        </div>
        {/* 回答エリア */}
        {question &&
          <div className="bg-white border mx-auto max-w-[800px] p-2 md:p-4 drop-shadow">
            <AnswerForm
              isTsumo={question.hand.situation.isTsumo}
              isDealer={question.hand.situation.seatWind === "EAST"}
              answer={answer}
              setAnswer={setAnswer}
              isAnswered={isAnswered}
              setIsAnswered={setIsAnswered}
            />
            <p className="text-xs text-[#808080]">※点数が一致すれば正解となります</p>
          </div>
        }
        {/* 結果エリア */}
        {(question && isAnswered) &&
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
                handTypes={question.score.handTypes}
                pointTypes={question.score.pointTypes}
              />
            </div>
            <div className="overflow-x-scroll overflow-y-hidden mb-1">
              <ScoreChartTable
                isDealer={question.score.isDealer}
                targetPoint={question.score.point}
                targetDoubles={question.score.doubles}
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return { props: {}};
}
