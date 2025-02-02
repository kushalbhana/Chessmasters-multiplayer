"use client";
import { useEffect } from "react";
import WebSocketClient from "@/lib/websocket/websocket-client";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import JoinChessGame from "@/components/playpage/joinchessgame";
import { BackgroundLinesAnimation } from "@/components/shared/background-lines"
import { Chessboard } from "react-chessboard";

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
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-1/2 -z-10">
                <Chessboard id="BasicBoard"/>
            </div>
            <div className="w-1/2">
                <Button onClick={joinRandomRoom}>Join!!</Button>
                <BackgroundLinesAnimation/>
            </div>
        </div>
    );
}