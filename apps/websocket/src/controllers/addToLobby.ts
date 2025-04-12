import { WebSocket } from "ws";
import { Chess } from 'chess.js';
import crypto from "crypto";

import { webSocketManager } from "..";
import { playerType, STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { userWebSocketServer, gameRoom, RedisRoom, PlayerHash } from "@repo/lib/types";
import { authenticateUser } from "../utils/authorization";
import { CreateRoomCache } from "../utils/redisUtils";


export async function addToLobby(ws: WebSocket, message: any){
    if (!message.JWT_token) {
        ws.send(JSON.stringify({ 
            code: '1007', 
            message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.' 
        }));
        return;
    }
    // Authenticate user using the JWT token
    const user: userWebSocketServer | null = authenticateUser(message.JWT_token); 
    console.log('User Retrieved form JWT: ', user);
    if (user === null) {
        ws.send(JSON.stringify({ 
            code: '498', 
            message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.' 
        }));
        return;
    }

    // ### Handle same user can't join same room
    if(webSocketManager.playerInRandomQueue != null && webSocketManager.playerInRandomQueue.playerId == user.userId){
        console.log('Same player tring to join the same room');
        return;
    }

    // Id user is already part of a game
    const roomExists = await webSocketManager.redisClient.exists(`player:${user.userId}`);
    if(roomExists == 1){
        console.log('Room already exists....');
        const playerRoom: string | undefined = await webSocketManager.redisClient.hGet(`player:${user.userId}`, 'room');
        if(playerRoom){
            const roomInfo = await webSocketManager.redisClient.hGetAll(`gameRoom:${playerRoom}` || "");
            roomInfo.roomId = playerRoom
            console.log(roomInfo);
            ws.send(JSON.stringify({type: WebSocketMessageType.JOINROOM, room_info: roomInfo}));
        }
        return;
    }

    // Add player to the random queue if not already present
    if (!webSocketManager.playerInRandomQueue) {  
        webSocketManager.playerInRandomQueue = {
            playerId: user.userId!, 
            playerName: user.name,
            profilePicture: user.picture,
            playerSocket: ws
        };
        console.log(`Player ${user.userId} added to the random queue.`);
    } else {
        console.log('A player is already in the random queue.');
        const uniqueKey = crypto.randomUUID();
        const chess: Chess  = new Chess();

        const newRoom: gameRoom = {
            whiteId: webSocketManager.playerInRandomQueue.playerId,
            whiteName: webSocketManager.playerInRandomQueue.playerName,
            whiteProfilePicture: webSocketManager.playerInRandomQueue.profilePicture,
            whiteSocket: webSocketManager.playerInRandomQueue.playerSocket,
            blackId: user.userId,
            blackName: user.name,
            blackProfilePicture: user.picture,
            blackSocket: ws,
            game: chess,
        };

        // Save the room locally
        webSocketManager.gameRoom[uniqueKey] = newRoom;

        // Serialize `newRoom` for Redis storage
        const redisRoom: RedisRoom = {
            whiteId: webSocketManager.playerInRandomQueue.playerId,
            whiteName: webSocketManager.playerInRandomQueue.playerName,
            whiteProfilePicture: webSocketManager.playerInRandomQueue.profilePicture,
            blackId: user.userId,
            blackName: user.name,
            blackProfilePicture: user.picture,
            whiteSocket: newRoom.whiteSocket ? 'connected' : 'disconnected',
            blackSocket: newRoom.blackSocket ? 'connected' : 'disconnected',
            game: JSON.stringify(newRoom.game),
        };

        const whiteHash: PlayerHash = {
            id: newRoom.whiteId || '',
            room: uniqueKey,
            color: playerType.WHITE
        }
        const blackHash: PlayerHash = {
            id: newRoom.blackId || '',
            room: uniqueKey,
            color: playerType.BLACK
        }    

        // Save the serialized room in Redis            
        await CreateRoomCache(
            `gameRoom:${uniqueKey}`, 
            redisRoom,  // Serialize before storing
            `player:${newRoom.whiteId}`, 
            whiteHash,  // Serialize before storing
            `player:${newRoom.blackId}`, 
            blackHash,  // Serialize before storing
            1200
          );          
        ws.send(JSON.stringify({type: WebSocketMessageType.JOINROOM, RoomId: uniqueKey, room: redisRoom}));
        newRoom.whiteSocket?.send(JSON.stringify({type: WebSocketMessageType.JOINROOM, RoomId: uniqueKey, room: redisRoom}));
        webSocketManager.playerInRandomQueue = null;
        console.log(`Game room with key ${uniqueKey} saved to Redis.`); 
    }
}