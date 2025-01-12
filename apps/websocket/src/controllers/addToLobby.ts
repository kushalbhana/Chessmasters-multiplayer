import { WebSocket } from "ws";
import { webSocketManager } from "..";
import { playerType, STATUS_MESSAGES } from "@repo/lib/status";
import { userWebSocketServer, gameRoom } from "@repo/lib/types";
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
    const user: userWebSocketServer | null = authenticateUser(message.JWT_token); // Authenticate user using the JWT token
    
    if (user === null) {
        ws.send(JSON.stringify({ 
            code: '498', 
            message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.' 
        }));
        return;
    }

    // Id user is already part of a game
    const roomExists = await webSocketManager.redisClient.exists(`player:${user.userId}`);
    if(roomExists == 1){
        console.log('Room already exists....');
        return;
    }

    if (!webSocketManager.playerInRandomQueue) {  // Add player to the random queue if not already present
        webSocketManager.playerInRandomQueue = {
            playerId: user.userId!, 
            playerSocket: ws
        };
        console.log(`Player ${user.userId} added to the random queue.`);
    } else {
        console.log('A player is already in the random queue.');
        const uniqueKey = crypto.randomUUID();

        const newRoom: gameRoom = {
            whiteId: webSocketManager.playerInRandomQueue.playerId,
            blackId: user.userId,
            whiteSocket: webSocketManager.playerInRandomQueue.playerSocket,
            blackSocket: ws,
            boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        };

        // Save the room locally
        webSocketManager.gameRoom[uniqueKey] = newRoom;

        // Serialize `newRoom` for Redis storage
        const redisRoom = {
            whiteId: newRoom.whiteId || '',
            blackId: newRoom.blackId || '',
            whiteSocket: newRoom.whiteSocket ? 'connected' : 'disconnected',
            blackSocket: newRoom.blackSocket ? 'connected' : 'disconnected',
            boardState: newRoom.boardState,
        };

        const whiteHash = {
            id: newRoom.whiteId,
            room: uniqueKey,
            color: playerType.WHITE
        }
        const blackHash = {
            id: newRoom.blackId,
            room: uniqueKey,
            color: playerType.BLACK
        }

        // Save the serialized room in Redis            ### Handle same user can't join same room
        await CreateRoomCache(`gameRoom:${uniqueKey}`, redisRoom, `player:${newRoom.whiteId}`, whiteHash, `player:${newRoom.blackId}`, blackHash, 1200);
        console.log(`Game room with key ${uniqueKey} saved to Redis.`); 
    }
}