"use client";
import React from "react";
import { ChessboardGame } from "../game-review/chessboardGame";
import { useRecoilState } from "recoil";
// import { PlayerScreen } from "./playerScreen";
// import { MovesSection } from "./movesboard";
// import { MoveClassificationSummary } from "./moveclassificationboard";
// import { PeicesCategoryDropdown } from "./selectpeices";
// import DownloadPGNButton from "./downloadPGN";
import { VictoryDialog } from "../shared/victoryDialog";
import { useSession } from "next-auth/react";
import { gameResult } from "@/store/atoms/sharedGame";
import { GameGraph } from "./graph";
import { MovesSection } from "./movesboard";
import { PeicesCategoryDropdown } from "../computer/selectpeices";
import { NextPrevUtility } from "./nextPrevMove";
import { MoveClassificationSummary } from "./movesClassification";

export function GameReviewPage() {
  const {data: session, status} = useSession();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 ml-18"
        style={{
          backgroundImage: `url('/images/chess-background.png')`, // Make sure this path is correct and inside `public/`
        }}
      />

      <div className="absolute inset-0 bg-black/60 z-10 ml-10" />

      {/* ✅ Main content on top */}
      <div className="relative z-20 flex h-full w-full gap-2 flex-col lg:flex-row justify-center items-center lg:ml-10">
        <div className="w-full lg:w-6/12">
          <div className=" absolute z-20 h-full w-full bg-gradient-to-b from-[#111114] to-[#1c1c1f] rounded-2xl hidden">
              
          </div>
          <ChessboardGame />
        </div>
        <div className="w-full lg:w-5/12 h-5/6 flex flex-col px-4">
          <div className="w-full hidden lg:block">
            <GameGraph/>
          </div>
          <div className="p-4 flex gap-4" >
            <PeicesCategoryDropdown/>
            {/* <DownloadPGNButton/> */}
          </div>
          <div className="flex flex-col gap-2 h-full w-full">
            {/* <MovesSection /> */}
            <MovesSection/>
            <NextPrevUtility/>
          </div><div className="flex gap-2 h-full w-full">
            <MoveClassificationSummary/>
          </div>
        </div>
      </div>
    </div>
  );
}
