"use client"
import React, { useState } from "react"

import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
import { ChessboardGame } from "./chessboard-game"
import { useRecoilState } from "recoil"
import { gameStatus } from "@/store/atoms/game"
import { PlayerScreen } from "./playerScreen"


export function PlayPage(){
    const [gameWon, setGameWon] = useState(true);
    const [gameStat, setGameStat] = useRecoilState(gameStatus);

    return(
        <div className="flex h-full w-full gap-1 flex-col lg:flex-row justify-center items-center">
            <div className=" w-full lg:w-6/12">
                <div className=" absolute z-20 h-full w-full bg-gradient-to-b from-[#111114] to-[#1c1c1f] rounded-2xl hidden">
                </div>
                    <ChessboardGame />
                </div>
                <div className="w-full lg:w-5/12 h-5/6 flex flex-col bg-slate-500 bg-opacity-20">
                    <div className="w-full hidden lg:block">
                        <PlayerScreen/>
                    </div>
                    <div className="flex gap-2 h-full w-full">
                        <div>
                            {/* <MovesSection/> */}
                        </div>
                    <div className="p-3 flex flex-col justify-center w-full">
                        {/* <UtilitySection/>
                        <MessageBox/> */}
                    </div>
                </div>
            </div>

        </div>
    )
}