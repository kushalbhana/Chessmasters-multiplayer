"use client";
import React, { useState } from "react";
import { ChessboardGame } from "./chessboard-game";
import { useRecoilState } from "recoil";
import { gameStatus } from "@/store/atoms/game";
import { PlayerScreen } from "./playerScreen";
import { MovesSection } from "./movesboard";

export function PlayPage() {
  const [gameWon, setGameWon] = useState(true);
  const [gameStat, setGameStat] = useRecoilState(gameStatus);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ✅ Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 ml-14"
        style={{
          backgroundImage: `url('/images/chess-background.png')`, // Make sure this path is correct and inside `public/`
        }}
      />

      {/* ✅ Optional overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30 z-10 ml-10" />

      {/* ✅ Main content on top */}
      <div className="relative z-20 flex h-full w-full gap-2 flex-col lg:flex-row justify-center items-center lg:ml-10">
        <div className="w-full lg:w-6/12">
          <ChessboardGame />
        </div>
        <div className="w-full lg:w-5/12 h-5/6 flex flex-col px-4">
          <div className="w-full hidden lg:block">
            <PlayerScreen />
          </div>
          <div className="flex gap-2 h-full w-full">
            <MovesSection />
          </div>
        </div>
      </div>
    </div>
  );
}
