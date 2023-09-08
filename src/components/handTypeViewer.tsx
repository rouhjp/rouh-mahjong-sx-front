import { HandType, PointType } from "@/type";
import { memo } from "react";

const getGradeText = (code: string): string => {
  switch (code) {
    case "S":
      return "役満";
    case "W":
      return "ダブル役満";
    default:
      return `${code}飜`
  }
}

interface Props {
  handTypes: HandType[]
  pointTypes: PointType[]
}

export const HandTypeViewer = memo(function HandTypeViewerContent({
  handTypes,
  pointTypes,
}: Props) {
  return (
    <div className="grid gap-2 grid-cols-2">
      <ul className="bg-white rounded-1 p-2 h-fit">
        {Object.values(handTypes).map((handType, index) =>
          <li key={index}
            className="flex border-b border-black border-dotted">
            <div className="w-4/5">{handType.name}</div>
            <div className="w-1/5">{getGradeText(handType.grade)}</div>
          </li>
        )}
      </ul>
      <ul className="bg-white rounded-1 p-2 h-fit">
        {Object.values(pointTypes).map((pointType, index)=>
          <li key={index}
            className="flex border-b border-black border-dotted">
            <div className="w-4/5">{pointType.name}</div>
            <div className="w-1/5">{pointType.point}</div>
          </li>
        )}
      </ul>
    </div>
  )
});
