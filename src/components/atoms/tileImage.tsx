import { Tile } from "@/type";
import { memo } from "react";

interface Props {
  tile: Tile | "back",
}

export const TileImage = memo(function TileImageContent({
  tile,
}: Props) {
  return (
    <img className="w-10" src={`tiles/${tile}.jpg`} />
  );
});
