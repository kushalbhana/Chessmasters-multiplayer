"use client"
import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
import { VideoSection } from "./videoSection"
import { MovesSection } from "./movesSection"
import { UtilitySection } from "./utilitysection"
export function GameLayout(){
    return(
        <div className="flex h-full w-full gap-1 flex-col lg:flex-row justify-center items-center">
            <div className=" w-full lg:w-6/12">
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
                    </div>
                </div>
            </div>

        </div>
    )
}