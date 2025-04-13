import { Chessboard } from "react-chessboard";
import { TimeAndUser } from "./timeAndUser";

export function ChessboardAndUtility(){
    return( 
        <div className="flex flex-col gap-1">
            <div>
                <TimeAndUser/>
            </div>
            <div className="p-2">
                <Chessboard id="BasicBoard"/>
            </div>
            <div>
                <TimeAndUser/>
            </div>
        </div>
    )
}