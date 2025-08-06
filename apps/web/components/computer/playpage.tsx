"use client";
import React from "react";
import { ChessboardGame } from "./chessboard-game";
import { useRecoilState } from "recoil";
import { PlayerScreen } from "./playerScreen";
import { MovesSection } from "./movesboard";
import { PeicesCategoryDropdown } from "./selectpeices";
import DownloadPGNButton from "./downloadPGN";
import { VictoryDialog } from "../shared/victoryDialog";
import { useSession } from "next-auth/react";
import { gameResult } from "@/store/atoms/sharedGame";
import { PrevUtility } from "./prevMoveAndresign";

export function PlayPage() {
  const [gameStat, setGameStat] = useRecoilState(gameResult);
  const { data: session } = useSession();

  return (
    <div className="relative w-full min-h-[100dvh] overflow-auto">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
      />
      {/* Main Content */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full min-h-[100dvh] lg:gap-4 justify-center items-center px-2 sm:px-4 lg:px-10 py-4 lg:py-8">
        
        {/* Chessboard Section */}
        <div className="w-full lg:w-6/12 flex justify-center items-center">
          <div className="relative w-full flex justify-center items-center">
            {/* Wrapper to maintain full size */}
            <div className="w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <VictoryDialog
                open={gameStat.isGameOver}
                onClose={() =>
                  setGameStat((prev) => ({ ...prev, isGameOver: false }))
                }
                myImg={session?.user?.image || ""}
                oppositeImg="/images/bot.gif"
              />
              <ChessboardGame />
            </div>
          </div>
        </div>

        {/* Right Panel for Large Devices */}
        <div className="hidden lg:flex w-full lg:w-5/12 flex-col h-[90vh] px-4">
          <div className="w-full mb-4">
            <PlayerScreen />
          </div>

          <div className="flex gap-4 mb-4">
            <PeicesCategoryDropdown />
            <DownloadPGNButton />
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            <MovesSection />
          </div>

          <div className="w-full">
            <PrevUtility />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:hidden flex-col w-full mt-6 space-y-4 pb-28">
          <PrevUtility />
          <MovesSection />
          <PeicesCategoryDropdown />
          <DownloadPGNButton />
        </div>
      </div>
    </div>
  );
}
