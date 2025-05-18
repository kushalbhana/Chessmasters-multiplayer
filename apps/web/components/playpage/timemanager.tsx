import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { playerTime, opponentTime } from "@/store/atoms/game";

export function TimeManager({ game, orientation }: any) {
    const [myTimeRemaining, setMyTimeRemaining] = useRecoilState(playerTime);
    const [oppTimeRemaining, setOppTimeRemaining] = useRecoilState(opponentTime);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (intervalRef.current) return; // Already set

        intervalRef.current = setInterval(() => {
            const turn = game.turn();
            const isMyTurn =
                (orientation === 'white' && turn === 'w') ||
                (orientation === 'black' && turn === 'b');

            if (isMyTurn) {
                setMyTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
            } else {
                setOppTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [orientation, game]);

    return null;
}
