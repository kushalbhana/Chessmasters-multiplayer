"use client"
import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
import { VideoSection } from "./videoSection"
import { MovesSection } from "./movesSection"
import { ChatBox } from "./chatUI"
export function GameLayout(){
    return(
        <div className="flex h-full w-full gap-1 flex-col lg:flex-row justify-center items-center">
            <div className=" w-full lg:w-6/12">
                <ChessboardAndUtility />
            </div>
            <div className="w-full lg:w-5/12 flex flex-col">
                <div className="w-full">
                    <VideoSection/>
                </div>
                <div>
                    <MovesSection/>
                </div>
                <div className=" w-full bg-slate-400">
                    <ChatBox/>
                </div>
            </div>

        </div>
    )
}