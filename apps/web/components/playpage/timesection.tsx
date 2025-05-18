import { FaStopwatch } from "react-icons/fa";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { playerTime, opponentTime } from "@/store/atoms/game";

function timeLayout(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function TimeSection({ playerType, orientation, game }: any) {
    const [myTimeRemaining, setMyTimeRemaining] = useRecoilState(playerTime);
    const [oppTimeRemaining, setOppTimeRemaining] = useRecoilState(opponentTime);

    return (
        <div className="flex h-10 w-32">
            <div className="bg-orange-700 w-4/12 flex justify-center items-center">
                <FaStopwatch />
            </div>
            <div className="bg-slate-300 w-8/12 flex justify-center items-center text-black font-bold text-xl">
                {playerType === "player" ?  timeLayout(Math.ceil(myTimeRemaining/2)) : timeLayout(Math.ceil(oppTimeRemaining/2))}
            </div>
        </div>
    );
}
