"use client";

import { useEffect } from "react";
import WebSocketClient from "../../lib/WebSocketClient";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "../../components/ui/button";
import { useSession } from "next-auth/react";

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
            <div>
                <Button onClick={joinRandomRoom}>Join!!</Button>
            </div>
        </div>
    );
}
