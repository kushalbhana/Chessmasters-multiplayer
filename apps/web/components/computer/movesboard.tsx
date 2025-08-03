import * as React from "react";
import { useRecoilValue } from "recoil";
import { ScrollArea } from "@/components/ui/scroll-area";
import { movesAtom } from "@/store/atoms/bot";

export function MovesSection() {
  const rawMoves = useRecoilValue(movesAtom);
  const moves = Array.isArray(rawMoves) ? rawMoves : [];

  const formattedMoves = moves.reduce((acc, move, i) => {
    const moveIndex = Math.floor(i / 2);
    if (!acc[moveIndex]) acc[moveIndex] = { number: moveIndex + 1 };
    if (i % 2 === 0) {
      acc[moveIndex].white = move.moveSan;
      acc[moveIndex].whiteScore = move.score;
    } else {
      acc[moveIndex].black = move.moveSan;
      acc[moveIndex].blackScore = move.score;
    }
    return acc;
  }, [] as { number: number; white?: string; black?: string; whiteScore?: number; blackScore?: number }[]);

  return (
    <ScrollArea className="h-full w-full lg:w-full rounded-md border bg-[#111114]/20">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Moves</h4>
        {formattedMoves.map(({ number, white, black, whiteScore, blackScore }, index) => (
          <React.Fragment key={number}>
            <div
              className={`text-sm flex justify-between px-2 py-2 rounded-md ${
                index % 2 === 0 ? "bg-[#1a1a1f]/40" : "bg-[#111114]/20"
              }`}
            >
              <span className="font-semibold">{number}.</span>
              <span className="ml-2">{white || "-"}</span>
              <span className="ml-4">{black || "-"}</span>
              <span className="ml-4">{blackScore !== undefined ? blackScore/10 : whiteScore !== undefined ? whiteScore/10 : "-"}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
