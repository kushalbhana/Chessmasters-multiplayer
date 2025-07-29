import WebSocket from "ws";
import { STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { userWebSocketServer } from "@repo/lib/types";
import { authenticateUser } from "../utils/authorization";
import { webSocketManager } from "..";
import { sendTextMessageToPubSub } from "../utils/redisUtils";


export async function handleTextMessage(ws: WebSocket | null, message: any){
    try {
        if (!message.JWT_token || !message.roomId) {
              ws?.send(JSON.stringify({
                code: '1007',
                message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token or room id.',
              }));
              return;
            }
        
            const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
            console.log('User authenticated for message');
            
        if (!user) {
            ws?.send(JSON.stringify({
            code: '498',
            message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.',
            }));
            return;
        }
        const roomId = message.roomId;
        if (!webSocketManager.gameRoom[roomId]) {
            ws?.send(JSON.stringify({
            code: '404',
            message: 'Room not found.',
            }));
            return;
        }
            
        const room = webSocketManager.gameRoom[roomId]!;
                
        // Check if the sender is the correct player
        if(room?.blackId !== user.userId && room?.whiteId !== user.userId){
            console.log('not a user')
            ws?.send(JSON.stringify({
            code: '403',
            message: 'Unauthorized player.',
            }));
            return;
        }

        // Send Message
        if(room?.blackId == user.userId){
            webSocketManager?.gameRoom[roomId]?.whiteSocket?.send(JSON.stringify({type: WebSocketMessageType.TEXTMESSAGE, message}));
        }else{
            webSocketManager?.gameRoom[roomId]?.blackSocket?.send(JSON.stringify({type: WebSocketMessageType.TEXTMESSAGE, message}));
        }
        sendTextMessageToPubSub(roomId, message, user.userId);  
    } catch (error) {
        console.log(error)
    }
}