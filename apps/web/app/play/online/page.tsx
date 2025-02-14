"use client";
import { useEffect } from "react";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import JoinChessGame from "@/components/playpage/joinchessgame";
import { BackgroundLinesAnimation } from "@/components/shared/background-lines"
import { Chessboard } from "react-chessboard";
import { FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from "react-icons/fa";


export default function GameLobby() {
    useEffect(() => {
        const socket = WebSocketClient.getInstance();
        
    }, []);

    const { data: session, status } = useSession();
    
    function joinRandomRoom() {
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            // @ts-ignore
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY, JWT_token: session?.user.jwt})
        );
    }

    return (
        <div className="w-full lg:h-screen flex justify-center items-center">
            <div className="flex sm:flex-col md:flex-row w-11/12 bg-[#111114] p-10 rounded-xl shadow-2xl shadow-slate-700">
                <div className=" w-1/2">
                    <Chessboard id="BasicBoard"/>
                </div>
                <div className="w-1/2 flex justify-center items-center flex-col p-10">
                    <h1 className=" text-3xl font-extrabold text-center">Find an Opponent, Make Your Move!!</h1>
                    <h1 className=" text-lg font-medium text-center mt-3"> Jump into a real-time chess match against a random player and put your 
                        strategy to the test! Whether you're a beginner or a seasoned pro, every game is a new challenge. No sign-ups, no waiting—just 
                        quick matchmaking, intense battles, and the thrill of the game. Play now and outthink your opponent! 🚀 ♟️
                    </h1>
                    <div className="flex gap-10 mt-5">
                        <h1 className="text-4xl"> <FaChessRook /> </h1>
                        <h1 className="text-4xl"> <FaChessKnight /> </h1>
                        <h1 className="text-4xl"> <FaChessBishop /> </h1>
                        <h1 className="text-4xl"> <FaChessQueen /> </h1>
                        <h1 className="text-4xl"> <FaChessKing /> </h1>
                        <h1 className="text-4xl"> <FaChessBishop /> </h1>
                        <h1 className="text-4xl"> <FaChessKnight /> </h1>
                        <h1 className="text-4xl"> <FaChessRook /> </h1>
                    </div>
                    <div className="mt-10 w-full">
                        <Button className="w-full">Play a game</Button>
                    </div>
                </div>    
            </div>
        </div>
    );
}