import { Meld, Tile, Wind } from "@/type"
import { memo } from "react"

const getWindText = (code: string): string => {
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

interface Props {
  handTiles: Tile[],
  openMelds: Meld[],
  winningTile: Tile,
  upperIndicators: Tile[],
  lowerIndicators: Tile[],
  roundWind?: Wind,
  seatWind?: Wind,
  isTsumo?: boolean,
  isReady?: boolean,
  isFirstAroundReady?: boolean,
  isFirstAroundWin?: boolean,
  isReadyAroundWin?: boolean,
  isLastTileWin?: boolean,
  isQuadTileWin?: boolean,
  isQuadTurnWin?: boolean,
}

export const HandViewer = memo(function HandViewerContent({
  handTiles,
  openMelds,
  winningTile,
  upperIndicators,
  lowerIndicators,
  roundWind = "EAST",
  seatWind = "EAST",
  isTsumo = false,
  isReady = false,
  isFirstAroundReady = false,
  isFirstAroundWin = false,
  isReadyAroundWin = false,
  isLastTileWin = false,
  isQuadTileWin = false,
  isQuadTurnWin = false,
}: Props) {
  const isDealer = seatWind === "EAST";
  const upperIndicatorWall = Array.from(Array(5).keys()).map((index) => upperIndicators[index] || "back");
  const lowerIndicatorWall = Array.from(Array(5).keys()).map((index) => lowerIndicators[index] || "back");

  const getOptions = () => {
    const options = [];
    if (isFirstAroundReady) options.push("ダブル立直");
    if (isReady && !isFirstAroundReady) options.push("立直");
    if (isFirstAroundWin && isTsumo && isDealer) options.push("天和");
    if (isFirstAroundWin && isTsumo && !isDealer) options.push("地和");
    if (isReadyAroundWin) options.push("一発");
    if (isQuadTileWin) options.push("槍槓");
    if (isQuadTurnWin) options.push("嶺上開花");
    if (isLastTileWin && isTsumo) options.push("海底摸月");
    if (isLastTileWin && !isTsumo) options.push("河底撈魚");
    return options;
  }

  return (
    <div>
      <ul className="flex-wrap space-x-1 space-y-1 mb-2">
        <li className="inline-block bg-white border border-[#696969] px-2">場風:{getWindText(roundWind)}</li>
        <li className="inline-block bg-white border border-[#696969] px-2">自風:{getWindText(seatWind)}</li>
        <li className="inline-block bg-white border border-[#696969] px-2">{isDealer ? "親" : "子"}</li>
        <li className="inline-block bg-white border border-[#696969] px-2">{isTsumo ? "ツモ" : "ロン"}</li>
        {getOptions().map((option, index) =>
          <li key={index} className="inline-block bg-white border border-[#696969] rounded-full px-2">{option}</li>
        )}
      </ul>
      <div className="flex-wrap md:flex gap-4">
        <ul className="flex-wrap">
          {[...handTiles, winningTile].map((handTile, index) =>
            <li key={index} className="inline-block last:ml-2">
              <img className="w-10" src={`tiles/${handTile}.jpg`} />
            </li>
          )}
        </ul>
        {openMelds.length > 0 &&
          <>
            <p className="md:hidden text-sm">副露</p>
            <div className="flex gap-1">
              {openMelds.map((meld, meldIndex) => {
                const isSelfQuad = meld.callFrom === "SELF" && meld.meldTiles.length === 4;
                const meldTiles = isSelfQuad ? ["back", meld.meldTiles[1], meld.meldTiles[2], "back"] : meld.meldTiles;
                return (
                  <ul key={meldIndex} className="flex">
                    {meldTiles.map((tile, tileIndex) =>
                      <li key={tileIndex}>
                        <img className="w-10" src={`tiles/${tile}.jpg`} />
                      </li>
                    )}
                  </ul>
                )
              })}
            </div>
          </>
        }
      </div>
      <p className="text-sm">ドラ表示牌</p>
      <div className="flex gap-2">
        <ul className="flex">
          {upperIndicatorWall.map((indicator, index) =>
            <li key={index}>
              <img className="w-10" src={`tiles/${indicator}.jpg`} />
            </li>
          )}
        </ul>
        <ul className="flex">
          {lowerIndicatorWall.map((indicator, index) =>
            <li key={index}>
              <img className="w-10" src={`tiles/${indicator}.jpg`} />
            </li>
          )}
        </ul>
      </div>
    </div>
  )
});
