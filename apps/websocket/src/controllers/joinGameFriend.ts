import { webSocketManager } from '..';
import crypto, { randomUUID } from 'crypto'
import { WebSocket } from 'ws';
import { userWebSocketServer, waitingGameRoom } from '@repo/lib/types';
import { authenticateUser } from '../utils/authorization';
import { STATUS_MESSAGES, WebSocketMessageType, playerType } from '@repo/lib/status';
import { Chess } from 'chess.js';
import { gameRoom, RedisRoom, PlayerHash, clientSideRoom } from "@repo/lib/types";
import { CreateRoomCache, subscribeToRoom } from "../utils/redisUtils";
import { schedulePlayerTimeout } from "../utils/bukllmqClient";

export function createInviteCode(ws: WebSocket, message: any){
    try {
        if (!message.JWT_token) {
              ws.send(JSON.stringify({
                code: '1007',
                message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
              }));
              return;
            }
        
            const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
        
            if (!user) {
              ws.send(JSON.stringify({
                code: '498',
                message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.',
              }));
              return;
            }
            
            if (webSocketManager.playerInRandomQueue?.playerId === user.userId) 
                  webSocketManager.playerInRandomQueue = null;
            
            const code = crypto.randomUUID();
            const newRoom: waitingGameRoom = {
                  whiteId: "",
                  whiteName: "",
                  whiteProfilePicture: "",
                  whiteSocket: null,
                  blackId: "",
                  blackName: "",
                  blackProfilePicture: "",
                  blackSocket: ws,
                  blackTime: 600,
                  whiteTime: 600,
                  lastMoveTime: new Date(),
                  game: new Chess(),
                  moves: [],
            };

            if(!message.color || message.color === 'white'){
                newRoom.whiteId = user.userId;
                newRoom.whiteName = user.name;
                newRoom.whiteProfilePicture = user.picture;
                newRoom.whiteSocket = ws;
            }else{
                newRoom.blackId = user.userId;
                newRoom.whiteName = user.name;
                newRoom.blackProfilePicture = user.picture;
                newRoom.blackSocket = ws;
            }

            webSocketManager.waitingRoom[code] = newRoom;
            ws.send(JSON.stringify({type: WebSocketMessageType.CREATE_INVITE_LINK, code: code}));  
            console.log('Friend Code: ', code)
            console.log('Friend Room: ', newRoom)
    } catch (error) {
        console.log(error)
    }
}

export async function JoinFriendRoom(ws: WebSocket, message: any): Promise<void> {
  try {
    if (!message.JWT_token) {
      ws.send(JSON.stringify({
        code: '1007',
        message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
      }));
      return;
    }

    const user: userWebSocketServer | null = authenticateUser(message.JWT_token);

    if (!user) {
      ws.send(JSON.stringify({
        code: '498',
        message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.',
      }));
      return;
    }

    console.log("User authenticated:", user.userId);

    // Prevent rejoining same room
    if (
      webSocketManager.playerInRandomQueue?.playerId === user.userId
    ) {
      console.log(`User ${user.userId} attempted to rejoin their own matchmaking queue.`);
      return;
    }

    // Check if user is already in a room
    const redis = webSocketManager.redisClient;
    const playerKey = `player:${user.userId}`;
    const RoomCode = message.roomId;

    if(!webSocketManager.waitingRoom[RoomCode]){
      ws.send(JSON.stringify({
        code: '1007',
        message: 'Room ID you are entering is not valid'
      }))
      return;
    }

    const waitingRoom = webSocketManager.waitingRoom[RoomCode];
    const chess = new Chess();

    const newRoom: gameRoom = {
      whiteId: waitingRoom.whiteId != "" ? waitingRoom.whiteId || "" : user.userId,
      whiteName: waitingRoom.whiteName != "" ? waitingRoom.whiteName || "" : user.name!,
      whiteProfilePicture: waitingRoom.whiteProfilePicture != "" ? waitingRoom.whiteProfilePicture || "" : user.picture!,
      whiteSocket: waitingRoom.whiteSocket != null ? waitingRoom.whiteSocket : ws,
      blackId: waitingRoom.blackId != "" ? waitingRoom.blackId || "" : user.userId,
      blackName: waitingRoom.blackName != "" ? waitingRoom.blackName || "" : user.name,
      blackProfilePicture: waitingRoom.blackProfilePicture != "" ? waitingRoom.blackProfilePicture || "" : user.picture!,
      blackSocket: waitingRoom.blackSocket != null ? waitingRoom.blackSocket : ws,
      blackTime: 600,
      whiteTime: 600,
      lastMoveTime: new Date(),
      game: chess,
      moves: [],
    };

    webSocketManager.gameRoom[RoomCode] = newRoom;
    delete webSocketManager.waitingRoom[RoomCode]

    const redisRoom: RedisRoom = {
      whiteId: newRoom.whiteId,
      whiteName: newRoom.whiteName,
      whiteProfilePicture: newRoom.whiteProfilePicture,
      blackId: newRoom.blackId,
      blackName: newRoom.blackName,
      blackProfilePicture: newRoom.blackProfilePicture,
      whiteSocket: 'connected',
      blackSocket: 'connected',
      blackTime: 600,
      whiteTime: 600,
      lastMoveTime: JSON.stringify(new Date()),
      game: chess.fen(),
      moves: JSON.stringify(JSON.stringify([])),
    };

    const whitePlayer: PlayerHash = {
      id: newRoom.whiteId,
      room: RoomCode,
      color: playerType.WHITE,
    };

    const blackPlayer: PlayerHash = {
      id: newRoom.blackId,
      room: RoomCode,
      color: playerType.BLACK,
    };

    await CreateRoomCache(
      `gameRoom:${RoomCode}`,
      redisRoom,
      `player:${whitePlayer.id}`,
      whitePlayer,
      `player:${blackPlayer.id}`,
      blackPlayer,
      3600
    );
    
    // Schedule player timeout
    await schedulePlayerTimeout(RoomCode, newRoom.whiteId, newRoom.whiteTime);
    // subscribe to the room
    subscribeToRoom(RoomCode);
    const clientPayload: clientSideRoom = {
      type: WebSocketMessageType.JOINROOM,
      roomId: RoomCode,
      room: redisRoom
    };

    ws.send(JSON.stringify(clientPayload));
    newRoom.whiteSocket?.send(JSON.stringify(clientPayload));

    webSocketManager.playerInRandomQueue = null;

    console.log(`Game room ${RoomCode} created and stored in Redis.`);
  } catch (err) {
    console.error("Error in addToLobby:", err);
    ws.send(JSON.stringify({
      code: '500',
      message: 'Internal server error during matchmaking.',
    }));
  }
}
