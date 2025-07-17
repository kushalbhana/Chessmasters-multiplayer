"use client"
import Lobby from "@/components/computer/lobby";
import { useEffect, useState } from "react";

import { PlayPage } from "@/components/computer/playpage";
import { useRecoilValue } from "recoil";
import { isBotChoosen } from "@/store/atoms/bot";

export default function PlayWithComputer(){
    const [ingame, setInGame] = useState<boolean>(false);
    const renderGame = useRecoilValue(isBotChoosen);

    useEffect(() => {
        if(localStorage.getItem('fen') && localStorage.getItem('playerId') && localStorage.getItem('depth'))
            setInGame(true)
    },[])

    if(renderGame.gameStarted || ingame)
        return (
            <div className="flex justify-center items-center h-full lg:h-screen"><PlayPage/></div>
        )

    return (
         <div><Lobby/></div>
    )
}