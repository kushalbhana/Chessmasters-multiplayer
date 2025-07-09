"use client"
import Lobby from "@/components/computer/lobby";
import { useEffect, useState } from "react";

import { PlayPage } from "@/components/computer/playpage";

export default function PlayWithComputer(){
    const [ingame, setInGame] = useState<boolean>(false);

    useEffect(() => {
        if(localStorage.getItem('fen') && localStorage.getItem('playerId') && localStorage.getItem('depth'))
            setInGame(true)
    },[])

    if(ingame)
        return (
            <div className="flex justify-center items-center h-full lg:h-screen"><PlayPage/></div>
        )

    return (
         <div><Lobby/></div>
    )
}