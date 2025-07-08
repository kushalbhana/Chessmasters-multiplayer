"use client"
import Lobby from "@/components/computer/lobby";

export default function PlayWithComputer(){
    if(localStorage.getItem('fen') && localStorage.getItem('playerId') && localStorage.getItem('depth'))
        return <div></div>

    return (
         <div><Lobby/></div>
    )
}