"use client";
import { classificationAtom } from "@/store/atoms/bot";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";


type ClassificationCounts = {
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
};

const defaultCounts: ClassificationCounts = {
  excellent: 0,
  good: 0,
  inaccuracy: 0,
  mistake: 0,
  blunder: 0,
};

const colorMap: Record<keyof ClassificationCounts, string> = {
  excellent: "bg-green-600/10",
  good: "bg-green-400/10",
  inaccuracy: "bg-yellow-400/10",
  mistake: "bg-orange-500/10",
  blunder: "bg-red-600/10",
};

export function MoveClassificationSummary() {
  const [, setCounts] = useState<ClassificationCounts>(defaultCounts);
  const summary = useRecoilValue(classificationAtom);

  useEffect(() => {
    const saved = localStorage.getItem("moveClassificationSummary");
    if (saved) {
      try {
        setCounts(JSON.parse(saved));
      } catch {
        setCounts(defaultCounts);
      }
    }
  }, []);

  return (
    <div className="flex flex-wrap justify-between gap-2 p-4 w-full">
      {Object.entries(summary).map(([key, value]) => (
        <div
          key={key}
          className={`flex-1 min-w-[90px] text-center py-3 rounded-md text-white font-medium ${colorMap[key as keyof ClassificationCounts]}`}
        >
          <div className="capitalize">{key}</div>
          <div className="text-xl">{value}</div>
        </div>
      ))}
    </div>
  );
}
