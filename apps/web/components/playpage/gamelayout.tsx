"use client"
import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
import { VideoSection } from "./videoSection"
import { MovesSection } from "./movesSection"
import { UtilitySection } from "./utilitysection"
import { useRecoilState } from "recoil"
import { gameStatus } from "@/store/atoms/game"
import { MessageBox } from "./messagebox"
import { GameOverDialog } from "../shared/gameOverDialogBox"

export function GameLayout() {
    const [gameStat, setGameStat] = useRecoilState(gameStatus);

    return (
        <div className="flex h-full w-full gap-1 flex-col lg:flex-row justify-center items-center">
            {/* Chessboard and Victory Dialog */}
            <div className="w-full lg:w-6/12 relative">
                <div className="absolute z-20 h-full w-full bg-gradient-to-b from-[#111114] to-[#1c1c1f] rounded-2xl hidden">
                        <GameOverDialog/>               
                </div>
                <ChessboardAndUtility />
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-5/12 h-max lg:h-5/6 flex flex-col bg-slate-500 bg-opacity-20">
                {/* Video Section always on top */}
                <div className="w-full order-1 lg:order-1">
                    <VideoSection />
                </div>

                {/* MessageBox & Utility below on mobile */}
                <div className="flex flex-col lg:flex-row order-2 gap-2 h-full w-full">
                    {/* MessageBox first on mobile, Moves first on large */}
                    <div className="order-2 lg:order-2 p-3 flex flex-col justify-center w-full lg:w-1/2">
                        <UtilitySection />
                        <MessageBox />
                    </div>

                    <div className="order-3 lg:order-1 w-full lg:w-1/2">
                        <MovesSection />
                    </div>
                </div>
            </div>
        </div>
    )
}
