import WebSocketClient from "../websocket/websocket-client";
import { playerType, WebSocketMessageType } from "@repo/lib/status"

export function sendMove(jwt: string, roomId: string, playerType: string, move: any) {
    const socket = WebSocketClient.getInstance();
    if (socket) {
        socket.sendMessage(JSON.stringify({
            type: WebSocketMessageType.INGAMEMOVE,
            JWT_token : jwt,
            data: {
                roomId: roomId,
                playerType: playerType,
                move: move
            }
        }));
    } else {
        console.error("WebSocket client is not initialized");
    }
}