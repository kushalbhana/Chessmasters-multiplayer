"use client"
import React, { useState } from "react"

import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
import { VideoSection } from "./videoSection"
import { MovesSection } from "./movesSection"
import { UtilitySection } from "./utilitysection"
import { VictoryDialog } from "./victorydialog"
import { useRecoilState } from "recoil"
import { gameStatus } from "@/store/atoms/game"
import { MessageBox } from "./messagebox"

export function GameLayout(){
    const [gameWon, setGameWon] = useState(true);
    const [gameStat, setGameStat] = useRecoilState(gameStatus);

    return(
        <div className="flex h-full w-full gap-1 flex-col lg:flex-row justify-center items-center">
            <div className=" w-full lg:w-6/12">
                <div className=" absolute z-20 h-full w-full bg-gradient-to-b from-[#111114] to-[#1c1c1f] rounded-2xl hidden">
                <VictoryDialog
                    open={gameStat.isGameOver}
                    onClose={() =>
                        setGameStat(prev => ({
                        ...prev,
                        isGameOver: false,
                        }))
                    }
                    playerName="Kushal"
                    />
                </div>
                <ChessboardAndUtility />
            </div>
            <div className="w-full lg:w-5/12 h-5/6 flex flex-col bg-slate-500 bg-opacity-20">
                <div className="w-full">
                    <VideoSection/>
                </div>
                <div className="flex gap-2 h-full w-full">
                    <div>
                        <MovesSection/>
                    </div>
                    <div className="p-3 flex justify-center w-full">
                        <UtilitySection/>
                        <MessageBox/>
                    </div>
                </div>
            </div>

        </div>
    )
}