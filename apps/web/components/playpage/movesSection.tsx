import * as React from "react"
import { useRecoilValue } from "recoil"
import { ScrollArea } from "@/components/ui/scroll-area"
import { gameMoves } from "@/store/atoms/moves" // Adjust path as needed

export function MovesSection() {
  const rawMoves = useRecoilValue(gameMoves);
  const moves = Array.isArray(rawMoves) ? rawMoves : [];
  
  const formattedMoves = moves.reduce((acc, move, i) => {
    const moveIndex = Math.floor(i / 2);
    if (!acc[moveIndex]) acc[moveIndex] = { number: moveIndex + 1 };
    i % 2 === 0 ? acc[moveIndex].white = move : acc[moveIndex].black = move;
    return acc;
  }, [] as { number: number; white?: string; black?: string }[]);

  return (
    <ScrollArea className="h-full w-48 lg:w-72 rounded-md border bg-[#111114]">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Moves</h4>
        {formattedMoves.map(({ number, white, black }, index) => (
          <React.Fragment key={number}>
            <div
              className={`text-sm flex justify-between px-2 py-1 rounded-md ${
                index % 2 === 0 ? "bg-[#1a1a1f]" : "bg-[#111114]"
              }`}
            >
              <span className="font-semibold">{number}.</span>
              <span className="ml-2">{white || '-'}</span>
              <span className="ml-4">{black || '-'}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
