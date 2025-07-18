import { WebSocket } from "ws";
import { authenticateUser } from "../utils/authorization";
import { STATUS_MESSAGES } from "@repo/lib/status";
import { userWebSocketServer } from "@repo/lib/types";
import { webSocketManager } from "..";
import { handleWebRTCRequestsForPubSub } from "../utils/redisUtils";

export function handleWebRTCOffer(ws: WebSocket | null, message: any){
    try {
        if (!message.JWT_token) {
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            return;
        }

        const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
        if(!user){
            console.log('User Not authenticated while sending WebRTC Request');
            return;
        }

        if(!message.data.roomId){
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            console.log('No roomId found!!')
            return;
        
        }

        const room = webSocketManager.gameRoom[message.data.roomId];
        if(room?.blackSocket){
            delete message.JWT_token;
            room.blackSocket.send(JSON.stringify(message));
        }
        else
            handleWebRTCRequestsForPubSub(message, message.data.roomId);
        console.log('Offer Sent')
    } catch (error) {
        console.log(error);
    }
}


export function handleWebRTCAnswer(ws: WebSocket | null, message: any){
    try {
        if (!message.JWT_token) {
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            return;
        }

        const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
        if(!user){
            console.log('User Not authenticated while sending WebRTC Request');
            return;
        }

        if(!message.data.roomId){
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            console.log('No roomId found!!')
            return;
        
        }

        const room = webSocketManager.gameRoom[message.data.roomId];
        
        if(room?.whiteSocket){
            delete message.JWT_token;
            room.whiteSocket.send(JSON.stringify(message));
        }
        else
            handleWebRTCRequestsForPubSub(message, message.data.roomId);
        console.log('Offer Sent')
    } catch (error) {
        console.log(error);
    }
}

export function handleICECandidate(ws: WebSocket | null, message: any){
    try {
        if (!message.JWT_token) {
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            return;
        }

        const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
        if(!user){
            console.log('User Not authenticated while sending WebRTC Request');
            return;
        }

        if(!message.data.roomId){
            ws?.send(JSON.stringify({
            code: '1007',
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            console.log('No roomId found!!')
            return;
        
        }

        const room = webSocketManager.gameRoom[message.data.roomId];
        
        if(room?.whiteId === user.userId && room?.blackSocket){
            delete message.JWT_token;
            room.blackSocket?.send(JSON.stringify(message));
            console.log('Sent iceCandidates to black');
        }
        else if(room?.blackId === user.userId && room.whiteSocket){
            delete message.JWT_token;
            room.whiteSocket.send(JSON.stringify(message));
            console.log('Ice Candidate sent to black');
        }else
            handleWebRTCRequestsForPubSub(message, message.data.roomId);

    } catch (error) {
        console.log(error);
    }
}