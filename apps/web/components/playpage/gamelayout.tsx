import { ChessboardAndUtility } from "@/components/playpage/chessboardAndUtility"
export function GameLayout(){
    return(
        <div className="flex h-full w-full p-3 gap-2 flex-col lg:flex-row justify-center items-center">
            <div className=" w-full lg:w-7/12">
                <ChessboardAndUtility />
            </div>
            <div className="w-full lg:w-5/12 bg-slate-500">
                <div className=" w-40 bg-slate-400">
                    Hiiii
                </div>
            </div>

        </div>
    )
}