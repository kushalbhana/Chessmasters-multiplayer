import { WebSocket } from "ws";
import { webSocketManager } from "..";
import { playerType, STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { userWebSocketServer, gameRoom, RedisRoom, PlayerHash } from "@repo/lib/types";
import { authenticateUser } from "../utils/authorization";
import { CreateRoomCache } from "../utils/redisUtils";
import prisma from "@repo/db/client"

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
        const redisRoom: RedisRoom = {
            whiteId: newRoom.whiteId || '',
            blackId: newRoom.blackId || '',
            whiteSocket: newRoom.whiteSocket ? 'connected' : 'disconnected',
            blackSocket: newRoom.blackSocket ? 'connected' : 'disconnected',
            boardState: newRoom.boardState,
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

        const whiteUseData = prisma.user.findUnique({
            where: {
                id: whiteHash.id
            },
            select: {
                id: true,
                name: true, 
                picture: true
            }
        })

        // Save the serialized room in Redis            
        await CreateRoomCache(`gameRoom:${uniqueKey}`, redisRoom, `player:${newRoom.whiteId}`, whiteHash, `player:${newRoom.blackId}`, blackHash, 1200);
        ws.send(JSON.stringify({type: WebSocketMessageType.JOINROOM, RoomId: uniqueKey}));
        webSocketManager.playerInRandomQueue = null;
        console.log(`Game room with key ${uniqueKey} saved to Redis.`); 
    }
}