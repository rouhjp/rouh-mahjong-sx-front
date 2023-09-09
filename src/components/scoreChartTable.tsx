import { memo } from "react";

const POINT_STEPS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const DOUBLES_STEPS = [1, 2, 3, 4, 5, 6, 8, 11, 13];

const getDoublesRowIndex = (targetDoubles?: number): number => {
  if (targetDoubles) {
    const index = Object.values(DOUBLES_STEPS)
      .findIndex(doubles => doubles > targetDoubles);
    if (index != -1) {
      return index - 1;
    }
    return DOUBLES_STEPS.length - 1;
  }
  return -1;
}

const getDoublesRowText = (index: number): string => {
  const doubles = DOUBLES_STEPS[index];
  const nextDoubles = DOUBLES_STEPS[index + 1]
  if (nextDoubles) {
    if (nextDoubles === doubles + 1) {
      return `${doubles}飜`
    }
    return `${doubles}-${nextDoubles - 1}飜`
  } else {
    return `${doubles}-飜`
  }
}

const getScore = (point: number, doubles: number, dealer: boolean): number => {
  const multiplier = dealer ? 6 : 4;
  if (doubles >= 13) return 8000 * multiplier;
  if (doubles >= 11) return 6000 * multiplier;
  if (doubles >= 8) return 4000 * multiplier;
  if (doubles >= 6) return 3000 * multiplier;
  if (doubles == 5) return 2000 * multiplier;
  const score = Math.min(2000, point * Math.pow(2, doubles + 2)) * multiplier;
  return Math.ceil(score / 100) * 100;
}

const getLimitType = (point: number, doubles: number): string => {
  if (doubles >= 13) return "役満";
  if (doubles >= 11) return "三倍満";
  if (doubles >= 8) return "倍満";
  if (doubles >= 6) return "跳満";
  if (doubles == 5) return "満貫";
  if (doubles == 4 && point >= 40) return "満貫";
  if (doubles == 3 && point >= 70) return "満貫";
  return "";
}

const DEALER_SCORE_MAP = Object.values(DOUBLES_STEPS)
  .map(doubles => Object.values(POINT_STEPS)
    .map(point => getScore(point, doubles, true)));

const NON_DEALER_SCORE_MAP = Object.values(DOUBLES_STEPS)
  .map(doubles => Object.values(POINT_STEPS)
    .map(point => getScore(point, doubles, false)));

interface Props {
  isDealer?: boolean,
  targetPoint?: number,
  targetDoubles?: number,
}

//点数早見表コンポーネント
export const ScoreChartTable = memo(function ScoreChartTableContent({
  isDealer = false, //親かどうか
  targetPoint = -1, //ハイライトする符
  targetDoubles = -1, //ハイライトする飜(役満の場合は13を指定する)
}: Props) {
  const currentRowIndex = getDoublesRowIndex(targetDoubles);
  const score_map = isDealer ? DEALER_SCORE_MAP : NON_DEALER_SCORE_MAP;
  return (
    <table>
      <tbody className="text-center">
        <tr>
          {/* 表の隅 */}
          <th className='border border-black p-1 bg-[#F1F1F1]'>
            {isDealer ? "親" : "子"}
          </th>
          {/* 表の上部 */}
          {Object.values(POINT_STEPS).map((point, index) =>
            <th key={index}
              className={[
                "border border-black p-1",
                point === targetPoint ? "bg-[#E9967A]" : "bg-[#F1F1F1]"
              ].join(" ")}>
              {`${point}符`}
            </th>
          )}
        </tr>
        {/* 表の下部 */}
        {Object.values(DOUBLES_STEPS).map((doubles, rowIndex) =>
          <tr key={rowIndex}>
            {/* 表の左部 */}
            <th className={[
              "border border-black p-1",
              rowIndex === currentRowIndex ? "bg-[#E9967A]" : "bg-[#F1F1F1]",
            ].join(" ")}>
              {getDoublesRowText(rowIndex)}
            </th>
            {/* 表の中央部 */}
            {Object.values(POINT_STEPS).map((point, colIndex) => {
              const score = score_map[rowIndex][colIndex];
              const scoreTop = score_map[rowIndex - 1]?.[colIndex];
              const scoreLeft = score_map[rowIndex]?.[colIndex - 1];
              const scoreRight = score_map[rowIndex]?.[colIndex + 1];
              const scoreBottom = score_map[rowIndex + 1]?.[colIndex];
              const limitType = getLimitType(point, doubles);
              const isTarget = doubles >= 2 || point >= 30;
              const showLimit = limitType && rowIndex >= 4 && colIndex === 4;
              const showScore = !limitType || (rowIndex >= 4 && colIndex === 5);
              const text = showLimit ? limitType : showScore ? (isTarget ? score : "-") : ""
              return (
                <td key={colIndex}
                  className={[
                    "border-black p-1 bg-white w-14",
                    score !== scoreTop ? "border-t" : "",
                    score !== scoreLeft ? "border-l" : "",
                    score !== scoreRight ? "border-r" : "",
                    score !== scoreBottom ? "border-b" : "",
                  ].join(" ")}>
                  {text}
                </td>
              )
            })}
          </tr>
        )}
      </tbody>
    </table>
  )
})
