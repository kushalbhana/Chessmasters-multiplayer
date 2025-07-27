"use client";

import { moveAnalyticsData } from "@/store/atoms/analysis";
import React from "react";
import { useRecoilValue } from "recoil";

type ClassificationCounts = {
  brilliant: number;
  good: number;
  great: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
};

const colorMap: Record<keyof ClassificationCounts, string> = {
  brilliant: "bg-green-600/10",
  good: "bg-green-400/10",
  great: "bg-green-600/10",
  inaccuracy: "bg-yellow-400/10",
  mistake: "bg-orange-500/10",
  blunder: "bg-red-600/10",
};

const classificationOrder: (keyof ClassificationCounts)[] = [
  "blunder",
  "mistake",
  "inaccuracy",
  "good",
  "great",
  "brilliant",
];

export function MoveClassificationSummary() {
  const summary = useRecoilValue(moveAnalyticsData);

  // Explicitly assert the type to avoid TS errors
  const classifications = summary?.data?.classifications as Partial<ClassificationCounts> | undefined;

  if (!classifications) return null;

  return (
    <div className="flex flex-wrap justify-between gap-2 p-4 w-full">
      {classificationOrder.map((key) => (
        <div
          key={key}
          className={`flex-1 min-w-[90px] text-center py-3 rounded-md text-white font-medium ${colorMap[key]}`}
        >
          <div className="capitalize">{key}</div>
          <div className="text-xl">{classifications[key] ?? 0}</div>
        </div>
      ))}
    </div>
  );
}
