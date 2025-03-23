import { Dispatch, SetStateAction, memo } from "react";

const SELECTABLE_POINTS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const SELECTABLE_DOUBLES = Array.from(Array(15).keys()).map(index => index + 1);
const SELECTABLE_LIMIT_TYPES = ["満貫", "跳満", "倍満", "三倍満", "役満", "二倍役満", "三倍役満", "四倍役満"];

const getNonDealerPaymentExpression = (score: number): string => {
  const dealerPayment = Math.ceil((score || 0) / 2 / 100) * 100;
  const nonDealerPayment = Math.ceil((score || 0) / 4 / 100) * 100;
  return `${nonDealerPayment}点/${dealerPayment}点`;
}

const getDealerPaymentExpression = (score: number): string => {
  const eachPayment = Math.ceil((score || 0) / 3 / 100) * 100;
  return `${eachPayment}点オール`;
}

export type Answer = {
  point: number,
  doubles: number,
  limitType: string,
  score?: number,
}

export const EMPTY_ANSWER: Answer = {
  point: 0,
  doubles: 0,
  limitType: "",
  score: undefined,
}

interface Props {
  isTsumo: boolean
  isDealer: boolean
  answer: Answer
  setAnswer: Dispatch<SetStateAction<Answer>>,
  isAnswered: boolean,
  setIsAnswered: Dispatch<SetStateAction<boolean>>,
}

export const AnswerForm = memo(function AnswerFormContent({
  isTsumo,
  isDealer,
  answer,
  setAnswer,
  isAnswered,
  setIsAnswered,
}: Props) {
  return (
    <div>
      <div className="inline-block mr-2">
        <select value={answer.point}
          onChange={e => setAnswer(prev => ({ ...prev, point: parseInt(e.target.value) || 0 }))}
          className="border p-0.5">
          <option value={0} />
          {SELECTABLE_POINTS.map((point, index) =>
            <option key={index} value={point}>{point}</option>
          )}
        </select>
        <span>符</span>
      </div>
      <div className="inline-block mr-2 p-0.5">
        <select value={answer.doubles}
          onChange={e => setAnswer(prev => ({ ...prev, doubles: parseInt(e.target.value) || 0 }))}
          className="border p-0.5">
          <option value={0} />
          {SELECTABLE_DOUBLES.map((doubles, index) =>
            <option key={index} value={doubles}>{doubles}</option>
          )}
        </select>
        <span>飜</span>
      </div>
      <div className="inline-block">
        <select value={answer.limitType}
          onChange={e => setAnswer(prev => ({ ...prev, limitType: e.target.value }))}
          className="border mr-1 p-0.5">
          <option value="" />
          {SELECTABLE_LIMIT_TYPES.map((limitType, index) =>
            <option key={index} value={limitType}>{limitType}</option>
          )}
        </select>
      </div>
      <div className="inline-block mr-2">
        <input value={answer.score || ""}
          onChange={e => setAnswer(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
          onKeyDown={e => {
            if (e.key === "Enter") {
              setIsAnswered(true);
            }
          }}
          className="border w-20 p-0.5 pl-1">
        </input>
        <span>点</span>
        {isTsumo && isDealer &&
          <span className="ml-1">{`(${getDealerPaymentExpression(answer.score || 0)})`}</span>
        }
        {isTsumo && !isDealer &&
          <span className="ml-1">{`(${getNonDealerPaymentExpression(answer.score || 0)})`}</span>
        }
      </div>
      <div className="inline-block">
        <input type="button"
          value="回答する"
          onClick={() => {
            if (!isAnswered) {
              setIsAnswered(true);
            }
          }}
          className=
          {isAnswered ?
            "bg-transparent text-gray-400 font-semibold py-1 px-2 border border-gray-400 rounded" :
            "hover:cursor-pointer bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"}
        />
      </div>
    </div>
  )
});
