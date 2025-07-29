import { FaStopwatch } from "react-icons/fa";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { playerTime, opponentTime, gameStatus } from "@/store/atoms/game";
import { gameStatusObj } from "@repo/lib/status";

function timeLayout(time: number, gameOver: any) {
    if (gameOver.isGameOver) {
        return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
// @ts-expect-error
export function TimeSection({ playerType}) {
    const myTimeRemaining = useRecoilValue(playerTime);
    const oppTimeRemaining = useRecoilValue(opponentTime);
    const [gameOver, setGameOver] = useRecoilState(gameStatus);
    const [showDialog, setShowDialog] = useState(true)

    if(showDialog && myTimeRemaining <=0 && gameOver.isGameOver === false){
        setShowDialog(false);
        setGameOver((prev) => ({
            ...prev,
            isGameOver: true,
            overType: gameStatusObj.TIMEOUT,
            status: "Lost",
        }));
    }else if(showDialog && oppTimeRemaining <=0 && gameOver.isGameOver === false){
        setShowDialog(false);
        setGameOver((prev) => ({
            ...prev,
            isGameOver: true,
            overType: gameStatusObj.TIMEOUT,
            status: "Win",
        }));
    }

    return (
        <div className="flex h-10 w-32">
            <div className="bg-orange-700 w-4/12 flex justify-center items-center">
                <FaStopwatch />
            </div>
            <div className="bg-slate-300 w-8/12 flex justify-center items-center text-black font-bold text-xl">
                {playerType === "player" ?  timeLayout(Math.ceil(myTimeRemaining/2), gameOver) : timeLayout(Math.ceil(oppTimeRemaining/2), gameOver)}
            </div>
        </div>
    );
}
