"use client";

import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { movesAtom, MoveAnalytics } from "@/store/atoms/bot";

function getMoveQualityLabel(score?: number): string {
  if (score === undefined) return "";
  const cp = Math.abs(score);
  if (cp <= 20) return "Best";
  if (cp <= 50) return "Excellent";
  if (cp <= 100) return "Good";
  if (cp <= 300) return "Mistake";
  return "Blunder";
}

function getQualityColor(score?: number): string {
  if (score === undefined) return "text-gray-400";
  const cp = Math.abs(score);
  if (cp <= 20) return "text-green-500";
  if (cp <= 50) return "text-emerald-500";
  if (cp <= 100) return "text-yellow-500";
  if (cp <= 300) return "text-orange-500";
  return "text-red-500";
}

export function MoveScrollColumn() {
  const moves = useRecoilValue(movesAtom);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className="w-full h-full overflow-y-auto p-4" ref={scrollRef}>
      <div className="flex flex-col space-y-4">
        {moves.map((m, idx) => (
          <div key={idx} className="flex flex-col border-b pb-2">
            <div className="text-sm text-gray-500">Move {idx + 1}</div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{m.move}</span>
              <span className={`text-xs ${getQualityColor(m.score)}`}>
                {getMoveQualityLabel(m.score)}
                {m.score !== undefined && (
                  <span className="ml-1 text-gray-400">
                    ({(m.score / 100).toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
