import { WebSocket } from "ws";
import { webSocketManager } from "..";
import { authenticateUser } from "../utils/authorization";
import { WebSocketMessageType } from "@repo/lib/status";
import { sendMoveToRedis, saveMovesArrayToRedis } from "../utils/redisUtils";
import { postGameOverCleanup } from "../utils/gameUtils";
import { calculateUpdatedRemainingTime } from "../utils/gameUtils";
import { clearPlayerTimeout, schedulePlayerTimeout } from "../utils/bukllmqClient";

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
    
        const roomId = message.data.roomId;
        const move = message.data.move;
    
        // Check if the room exists
        if (!webSocketManager.gameRoom[roomId]) {
            ws.send(JSON.stringify({
                code: '404',
                message: 'Room not found.',
            }));
            return;
        }
    
        const room = webSocketManager.gameRoom[roomId]!;
        
        // Check if the sender is the correct player
        if(room?.blackId !== user.userId && room?.whiteId !== user.userId){
            ws.send(JSON.stringify({
                code: '403',
                message: 'Unauthorized player.',
            }));
            return;
        }
        
        // Clear any existing timeout for the player
        if (webSocketManager.gameRoom[roomId]!.game.turn() === 'w') {
            await clearPlayerTimeout(roomId, webSocketManager.gameRoom[roomId]!.whiteId);
        }
        if (room.blackId === user.userId) {
            await clearPlayerTimeout(roomId, webSocketManager.gameRoom[roomId]!.blackId);
        }
        // Check if the move is valid
        const newMove = webSocketManager?.gameRoom[roomId]?.game.move(move)!;
        if (!newMove) {
            ws.send(JSON.stringify({
                code: '400',
                message: 'Invalid move.',
            }));
            return;
        }
        
            webSocketManager?.gameRoom[roomId]?.moves.push(newMove.san);
            calculateUpdatedRemainingTime(roomId)
            saveMovesArrayToRedis(roomId, JSON.stringify(webSocketManager?.gameRoom[roomId]?.moves));
            
            if(room?.whiteId === user.userId){
                if(room.blackSocket){
                    room.blackSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen(), 
                        whiteTime: webSocketManager.gameRoom[roomId]!.whiteTime, blackTime: webSocketManager.gameRoom[roomId]!.blackTime }));
                }
            }else if(room?.blackId === user.userId){
                if(room.whiteSocket){
                    room.whiteSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen(),
                        whiteTime: webSocketManager.gameRoom[roomId]!.whiteTime, blackTime: webSocketManager.gameRoom[roomId]!.blackTime
                    }));
                }
            }
            
            if (webSocketManager.gameRoom[roomId]!.game.turn() === 'w') {
                await schedulePlayerTimeout(roomId, webSocketManager.gameRoom[roomId]!.whiteId, webSocketManager.gameRoom[roomId]!.whiteTime);
            }
            if (room.blackId === user.userId) {
                await schedulePlayerTimeout(roomId, webSocketManager.gameRoom[roomId]!.blackId, webSocketManager.gameRoom[roomId]!.blackTime);
            }

            // Setting value in redis
            await sendMoveToRedis(roomId, room.game.fen(), move, user.userId);
            postGameOverCleanup(roomId);
    } catch (error) {
        console.error("Error in makeMove:", error);
        ws.send(JSON.stringify({
            code: '500',
            message: 'Internal Server Error.',
        }));
        return;
        
    }
    
}