import { WebSocket } from "ws";
import { webSocketManager } from "..";
import { authenticateUser } from "../utils/authorization";
import { WebSocketMessageType } from "@repo/lib/status";
import { sendMoveToRedis } from "../utils/redisUtils";

export async function makeMove(ws: WebSocket, message: any) {
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
        console.log('Fen Before changes: ',webSocketManager.gameRoom[roomId]?.game.fen());
        const newMove = webSocketManager?.gameRoom[roomId]?.game.move(move)!;
        console.log('Fen After changes: ',webSocketManager.gameRoom[roomId]?.game.fen());
        console.log("Move made:", newMove);
        if (!newMove) {
            ws.send(JSON.stringify({
                code: '400',
                message: 'Invalid move.',
            }));
            return;
        }
        if(room?.whiteId === user.userId){
            if(room.blackSocket){
                room.blackSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
            }
        }else if(room?.blackId === user.userId){
            if(room.whiteSocket){
                room.whiteSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
            }
        }

        // Setting value in redis
        await sendMoveToRedis(roomId, room.game.fen(), move, user.userId);
    } catch (error) {
        console.error("Error in makeMove:", error);
        ws.send(JSON.stringify({
            code: '500',
            message: 'Internal Server Error.',
        }));
        return;
        
    }
    
}