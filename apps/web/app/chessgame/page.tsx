"use client";

import { useEffect } from "react";
import WebSocketClient from "../../lib/WebSocketClient";
import { WebSocketMessageType } from "@repo/lib/status";
import { Button } from "../../components/ui/button";

export default function GameLobby() {
    useEffect(() => {
        const socket = WebSocketClient.getInstance();
        
    }, []);
    
    function joinRandomRoom() {
        const socket = WebSocketClient.getInstance();
        socket.sendMessage(
            JSON.stringify({ type: WebSocketMessageType.JOINLOBBY })
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
