import { CONCEALED_CONDITION, DEALER_CONDITION, DEFAULT_CONDITION, QuestionCondition, WINNING_CONDITION, isConcealedCondition, isDealerCondition, isWinningCondition } from "@/type";
import { Dispatch, SVGProps, SetStateAction, memo, useState } from "react";

interface Props {
  condition: QuestionCondition,
  onChangeCondition: Dispatch<SetStateAction<QuestionCondition>>,
}

export const QuestionConditionField = memo(function ({
  condition,
  onChangeCondition,
}: Props) {
  const [showField, setShowField] = useState<boolean>(false);
  return (
    <div>
      <div className="flex">
        <div className="flex items-center mb-2 hover:cursor-pointer"
          onClick={() => setShowField(prev => !prev)}>
          <div className="inline">
            {!showField &&
              <AkarIconsChevronRightSmall />
            }
            {showField &&
              <AkarIconsChevronDownSmall />
            }
          </div>
          <p className="text-xs">出題条件</p>
        </div>
      </div>
      {showField &&
        <div className="flex-wrap pb-2 mb-2 space-y-1 border-b border-dotted border-black">
          <div className="inline-block">
            {/* 条件セレクトボックス (全て|親|子) */}
            <select className="py-1.5 px-2 mr-2"
              value={condition.dealerCondition}
              onChange={e => {
                const dealerCondition: string = e.target.value;
                if (isDealerCondition(dealerCondition)) {
                  onChangeCondition(prev => ({ ...prev, dealerCondition }));
                }
              }}>
              {Object.entries(DEALER_CONDITION).map(([value, text], index) =>
                <option key={index} value={value}>{text}</option>
              )}
            </select>
            {/* 条件セレクトボックス (全て|門前|鳴き) */}
            <select className="py-1.5 px-2 mr-2"
              value={condition.concealedCondition}
              onChange={e => {
                const concealedCondition: string = e.target.value;
                if (isConcealedCondition(concealedCondition)) {
                  onChangeCondition(prev => ({ ...prev, concealedCondition }));
                }
              }}>
              {Object.entries(CONCEALED_CONDITION).map(([value, text], index) =>
                <option key={index} value={value}>{text}</option>
              )}
            </select>
            {/* 条件セレクトボックス (全て|ツモ|ロン) */}
            <select className="py-1.5 px-2 mr-2"
              value={condition.winningCondition}
              onChange={e => {
                const winningCondition: string = e.target.value;
                if (isWinningCondition(winningCondition)) {
                  onChangeCondition(prev => ({ ...prev, winningCondition }));
                }
              }}>
              {Object.entries(WINNING_CONDITION).map(([value, text], index) =>
                <option key={index} value={value}>{text}</option>
              )}
            </select>
          </div>
          <div className="inline-block">
            {/* 条件セレクトボックス (|1...13)飜以上 */}
            <select className="py-1.5 mr-2"
              value={condition.doublesLowerLimit}
              onChange={e => {
                const doublesLowerLimit = parseInt(e.target.value) || 0;
                const doublesUpperLimit = doublesLowerLimit > 0 && condition.doublesUpperLimit > 0 ?
                  Math.max(doublesLowerLimit, condition.doublesUpperLimit) : condition.doublesUpperLimit;
                onChangeCondition(prev => ({ ...prev, doublesLowerLimit, doublesUpperLimit }));
              }}>
              <option value={0}></option>
              {Array.from(Array(13).keys()).map((index) =>
                <option key={index + 1} value={index + 1}>{index + 1}</option>
              )}
            </select>
            <span className="mr-2">飜以上</span>
            {/* 条件セレクトボックス (|1...13)飜以下 */}
            <select className="py-1.5 mr-2"
              value={condition.doublesUpperLimit}
              onChange={e => {
                const doublesUpperLimit = parseInt(e.target.value) || 0;
                const doublesLowerLimit = doublesUpperLimit > 0 && condition.doublesLowerLimit > 0 ?
                  Math.min(doublesUpperLimit, condition.doublesLowerLimit) : condition.doublesLowerLimit;
                onChangeCondition(prev => ({ ...prev, doublesUpperLimit, doublesLowerLimit }));
              }}>
              <option value={0}></option>
              {Array.from(Array(13).keys()).map((index) =>
                <option key={index + 1} value={index + 1}>{index + 1}</option>
              )}
            </select>
            <span>飜以下</span>
          </div>
        </div>
      }
    </div>
  )
})

//https://icones.js.org/collection/akar-icons
const AkarIconsChevronRightSmall = function (props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 6l6 6l-6 6"></path></svg>
  )
}

const AkarIconsChevronDownSmall = function (props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 10l6 6l6-6"></path></svg>
  )
}
