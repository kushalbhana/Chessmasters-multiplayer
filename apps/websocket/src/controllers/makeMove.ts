import { WebSocket } from "ws";
import { webSocketManager } from "..";
import { authenticateUser } from "../utils/authorization";
import { WebSocketMessageType } from "@repo/lib/status";

export function makeMove(ws: WebSocket, message: any): void {
    try {
        if (!message.JWT_token && !message.data.roomId) {
            ws.send(JSON.stringify({
                code: '1007',
                message: 'Invalid Payload: Missing JWT token or.',
            }));
            return;
        }
    
        const user = authenticateUser(message.JWT_token);
        if (!user) {
            ws.send(JSON.stringify({
                code: '498',
                message: 'Invalid or Expired Token.',
            }));
            return;
        }
    
        console.log("User authenticated:", user.userId);
    
        const roomId = message.data.roomId;
        const move = message.data.move;

        console.log("Move received:", move);
        console.log("Move received:", move.from.to);
    
        // Check if the room exists
        if (!webSocketManager.gameRoom[roomId]) {
            ws.send(JSON.stringify({
                code: '404',
                message: 'Room not found.',
            }));
            return;
        }
    
        const room = webSocketManager.gameRoom[roomId]!;
        console.log("current fen:", room?.game.fen());
        
        // Check if the sender is the correct player
        if(room?.blackId !== user.userId && room?.whiteId !== user.userId){
            ws.send(JSON.stringify({
                code: '403',
                message: 'Unauthorized player.',
            }));
            return;
        }
        
        // Check if the move is valid
        if(room?.whiteId === user.userId){
            const newMove = room.game.move(move);
            if (!newMove) {
                ws.send(JSON.stringify({
                    code: '400',
                    message: 'Invalid move.',
                }));
                return;
            }
            if(room.blackSocket){
                room.blackSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
            }
            console.log("Move made:", newMove);
        }else if(room?.blackId === user.userId){
            const newMove = room.game.move(move);
            if (!newMove) {
                ws.send(JSON.stringify({
                    code: '400',
                    message: 'Invalid move.',
                }));
                return;
            }
            if(room.whiteSocket){
                room.whiteSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
            }
            console.log("Move made:", newMove);
        }
    } catch (error) {
        console.error("Error in makeMove:", error);
        ws.send(JSON.stringify({
            code: '500',
            message: 'Internal Server Error.',
        }));
        return;
        
    }
    
}