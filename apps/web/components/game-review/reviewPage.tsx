"use client";
import React from "react";
import { useRecoilValue } from "recoil";
import { ChessboardGame } from "../game-review/chessboardGame";
import { MovesSection } from "./movesboard";
import { PeicesCategoryDropdown } from "../computer/selectpeices";
import { NextPrevUtility } from "./nextPrevMove";
import { MoveClassificationSummary } from "./movesClassification";
import { MoveClassificationText } from "./movesClassificationText";
import { ChartAreaGame } from "./game-chart";
import { useRouter } from "next/navigation";
import { moveAnalyticsData } from "@/store/atoms/analysis";

export function GameReviewPage() {
  const router = useRouter();
  const analyticalData = useRecoilValue(moveAnalyticsData);

  if (analyticalData.data.moves.length === 0) {
    router.push("/analysis/game-review");
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full gap-4 lg:gap-2 justify-center items-center px-4 lg:px-10 py-6 lg:py-10">
        
        {/* Show text on small */}
        <div className="lg:hidden mb-2">
          <MoveClassificationText />
        </div>

        {/* Chessboard Container */}
        <div className="w-full lg:w-6/12 flex justify-center px-2">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-full flex justify-center">
            <ChessboardGame />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-5/12 flex flex-col min-h-full px-2 sm:px-4">
          
          {/* Chart visible only on large */}
          <div className="w-full hidden lg:block mb-4">
            <ChartAreaGame />
          </div>

          {/* Controls Row */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3">
            <div className="flex-shrink-0 scale-90 sm:scale-95 md:scale-100">
              <NextPrevUtility />
            </div>
            <div className="flex-shrink-0 scale-90 sm:scale-95 md:scale-100">
              <PeicesCategoryDropdown />
            </div>
            <div className="hidden md:block text-xs">
              <MoveClassificationText />
            </div>
          </div>

          {/* Moves Board */}
          <div className="flex flex-col gap-3 w-full">
            <MovesSection />
          </div>

          {/* Moves Summary */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <MoveClassificationSummary />
          </div>

          {/* Chart on Small Devices */}
          <div className="mt-6 w-full block lg:hidden pb-20">
            <ChartAreaGame />
          </div>
        </div>
      </div>
    </div>
  );
}
