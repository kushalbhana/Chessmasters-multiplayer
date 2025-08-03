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

  const moveTypeIcon: Record<string, { icon: JSX.Element; bgColor: string; textColor: string }> = {
    blunder: { 
      icon: <BsQuestionOctagonFill className="w-3 h-3" />, 
      bgColor: "bg-red-600", 
      textColor: "text-white" 
    },
    book: { 
      icon: <BsBookFill className="w-3 h-3" />, 
      bgColor: "bg-blue-500", 
      textColor: "text-white" 
    },
    brilliant: { 
      icon: <BsStars className="w-3 h-3" />, 
      bgColor: "bg-green-500", 
      textColor: "text-white" 
    },
    good: { 
      icon: <BsCheckLg className="w-3 h-3" />, 
      bgColor: "bg-green-500", 
      textColor: "text-white" 
    },
    great: { 
      icon: <BsTrophyFill className="w-3 h-3" />, 
      bgColor: "bg-purple-500", 
      textColor: "text-white" 
    },
    inaccuracy: { 
      icon: <BsExclamationCircle className="w-3 h-3" />, 
      bgColor: "bg-orange-400", 
      textColor: "text-white" 
    },
    mistake: { 
      icon: <BsExclamationTriangleFill className="w-3 h-3" />, 
      bgColor: "bg-yellow-400", 
      textColor: "text-black" 
    },
  };

  const renderMoveIcon = (classification?: string) => {
    if (!classification || !moveTypeIcon[classification]) return null;
    
    const { icon, bgColor, textColor } = moveTypeIcon[classification];
    
    return (
      <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${bgColor} ${textColor} flex-shrink-0`}>
        {icon}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[400px] w-full lg:w-full rounded-md border bg-[#111114]/20">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Moves</h4>
        {groupedMoves.map(({ number, white, black }, index) => (
          <div
            key={index}
            className={`text-sm flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1a1a1f]/60 transition-colors ${
              index % 2 === 0 ? "bg-[#1a1a1f]/40" : "bg-[#111114]/20"
            }`}
          >
            {/* Move number */}
            <span className="font-semibold text-gray-400 w-6 text-right flex-shrink-0">
              {number}.
            </span>

            {/* White move */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {renderMoveIcon(white?.classification)}
              <span
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer hover:bg-white/10 ${
                  currentMoveIndex !== -1 && currentMoveIndex === white?.index
                    ? "bg-white/80 text-black"
                    : "text-white/90"
                }`}
              >
                {white?.move || "-"}
              </span>
            </div>

            {/* Black move */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {renderMoveIcon(black?.classification)}
              <span
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer hover:bg-white/10 ${
                  currentMoveIndex !== -1 && currentMoveIndex === black?.index
                    ? "bg-white/80 text-black"
                    : "text-white/90"
                }`}
              >
                {black?.move || "-"}
              </span>
            </div>

            {/* Accuracy bars */}
            <div className="flex flex-col gap-1 w-12 flex-shrink-0">
              <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-white/80 rounded-full transition-all duration-300"
                  style={{ width: `${white?.accuracy ?? 0}%` }}
                />
              </div>
              <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-red-600/60 rounded-full transition-all duration-300"
                  style={{ width: `${black?.accuracy ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 mb-2">Move Classifications:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(moveTypeIcon).map(([type, { icon, bgColor, textColor }]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${bgColor} ${textColor}`}>
                  {React.cloneElement(icon, { className: "w-2.5 h-2.5" })}
                </div>
                <span className="text-gray-400 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}