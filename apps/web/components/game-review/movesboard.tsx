"use client";

import * as React from "react";
import { useRecoilValue } from "recoil";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moveAnalyticsData } from "@/store/atoms/analysis";
import {
  BsQuestionOctagonFill, // blunder
  BsBookFill,             // book
  BsStars,                // brilliant
  BsCheckLg,              // good
  BsTrophyFill,           // great
  BsExclamationCircle,    // inaccuracy
  BsExclamationTriangleFill // mistake
} from "react-icons/bs";

export function MovesSection() {
  const { data, currentMoveIndex } = useRecoilValue(moveAnalyticsData);
  const moves = Array.isArray(data?.moves) ? data.moves : [];

  // Group by moveNumber and track original move indices
  const groupedMoves = React.useMemo(() => {
    const grouped: {
      number: number;
      white?: typeof moves[0] & { index: number };
      black?: typeof moves[0] & { index: number };
    }[] = [];

    moves.forEach((move, index) => {
      const existing = grouped.find((m) => m.number === move.moveNumber);
      const moveWithIndex = { ...move, index };

      if (existing) {
        if (move.isWhite) existing.white = moveWithIndex;
        else existing.black = moveWithIndex;
      } else {
        grouped.push({
          number: move.moveNumber,
          [move.isWhite ? "white" : "black"]: moveWithIndex,
        });
      }
    });

    return grouped;
  }, [moves]);

  const moveTypeIcon: Record<string, JSX.Element> = {
    blunder: <BsQuestionOctagonFill className="text-red-600" />,
    book: <BsBookFill className="text-blue-500" />,
    brilliant: <BsStars className="text-yellow-400" />,
    good: <BsCheckLg className="text-green-500" />,
    great: <BsTrophyFill className="text-purple-500" />,
    inaccuracy: <BsExclamationCircle className="text-orange-400" />,
    mistake: <BsExclamationTriangleFill className="text-yellow-500" />,
  };

  return (
    <ScrollArea className="h-[400px] w-48 lg:w-full rounded-md border bg-[#111114]/20">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Moves</h4>
        {groupedMoves.map(({ number, white, black }, index) => (
          <div
            key={index}
            className={`text-sm flex justify-between px-2 py-2 rounded-md ${
              index % 2 === 0 ? "bg-[#1a1a1f]/40" : "bg-[#111114]/20"
            }`}
          >
            <span className="font-semibold mr-10">{number}.</span>

            <div className="flex-1 flex items-center gap-1">
              {white?.classification && moveTypeIcon[white.classification]}
              <span
                className={`px-1 rounded ${
                  currentMoveIndex !== -1 && currentMoveIndex === white?.index
                    ? "bg-white text-black"
                    : ""
                }`}
              >
                {white?.move || "-"}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-1">
              {black?.classification && moveTypeIcon[black.classification]}
              <span
                className={`px-1 rounded ${
                  currentMoveIndex !== -1 && currentMoveIndex === black?.index
                    ? "bg-white text-black"
                    : ""
                }`}
              >
                {black?.move || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 w-5 justify-end items-end ml-2">
              <div
                className="bg-white/80 h-2 rounded-l-sm p-1"
                style={{ width: `${white?.accuracy ?? 0}%` }}
              />
              <div
                className="bg-red-900/80 h-2 rounded-l-sm"
                style={{ width: `${black?.accuracy ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
