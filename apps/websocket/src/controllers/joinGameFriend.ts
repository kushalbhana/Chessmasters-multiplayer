import { webSocketManager } from '..';
import { WebSocket } from 'ws';
import { userWebSocketServer, waitingGameRoom, clientSideRoom } from '@repo/lib/types';
import { authenticateUser } from '../utils/authorization';
import { STATUS_MESSAGES, WebSocketMessageType, playerType } from '@repo/lib/status';
import { Chess } from 'chess.js';
import { gameRoom, RedisRoom, PlayerHash } from '@repo/lib/types';

import crypto from "crypto";
import { CreateRoomCache, subscribeToRoom } from "../utils/redisUtils";
import { schedulePlayerTimeout } from "../utils/bukllmqClient";

function generateRoomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking chars like I, 1, O, 0
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
            
            let code ="";
            while(true){
              code = generateRoomCode();
              if(!webSocketManager.waitingRoom[code])
                break;
            }
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

export async function addToFriendGame(ws: WebSocket, message: any): Promise<void> {
  try {
    if (!message.JWT_token) {
      ws.send(JSON.stringify({
        code: '1007',
        message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
      }));
      return;
    }
    if (!message.code) {
      ws.send(JSON.stringify({
        code: '1007',
        message: STATUS_MESSAGES[1007] || 'Invalid Payload: Game Code Missing',
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
    if (webSocketManager.playerInRandomQueue?.playerId === user.userId) 
      webSocketManager.playerInRandomQueue = null;
    

    // Check if user is already in a room
    const redis = webSocketManager.redisClient;
    const playerKey = `player:${user.userId}`;
    const isInRoom = await redis.exists(playerKey);

    if (isInRoom) {
      const playerRoom = await redis.hGet(playerKey, "room");
      if (playerRoom) {
        const roomData = await redis.hGetAll(`gameRoom:${playerRoom}`);
        roomData.roomId = playerRoom;
        console.log(`User ${user.userId} is already in room ${playerRoom}.`);
        ws.send(JSON.stringify({
          type: WebSocketMessageType.JOINROOM,
          roomId: playerRoom,
          room: roomData,
        }));
        console.log('room Exist: ', JSON.stringify({
          type: WebSocketMessageType.JOINROOM,
          roomId: playerRoom,
          room: roomData,
        }))
      }
      return;
    }
    const code = message.code;
    // Matchmaking logic
    
    const tempRoom = webSocketManager.waitingRoom[code];
    if(!tempRoom){
      ws.send(JSON.stringify({
        type: 'Error',
        code: '1007',
        message: 'The game code is not valid or got discarded',
      }));
      return;
    }
    delete webSocketManager.waitingRoom[code];
    
    // Start game with matched players
    const roomId = crypto.randomUUID();
    const chess = new Chess();

    const newRoom: gameRoom = {
      whiteId: tempRoom.whiteId ? tempRoom.whiteId : user.userId,
      whiteName: tempRoom.whiteName ? tempRoom.whiteName : user.name,
      whiteProfilePicture: tempRoom.whiteProfilePicture ? tempRoom.whiteProfilePicture : user.picture!,
      whiteSocket: tempRoom.whiteSocket ? tempRoom.whiteSocket : ws,
      blackId: tempRoom.blackId ? tempRoom.blackId : user.userId,
      blackName: tempRoom.blackName ? tempRoom.blackName : user.name,
      blackProfilePicture: tempRoom.blackProfilePicture ? tempRoom.blackProfilePicture : user.picture,
      blackSocket: tempRoom.blackSocket ? tempRoom.blackSocket : ws,
      blackTime: 600,
      whiteTime: 600,
      lastMoveTime: new Date(),
      game: chess,
      moves: [],
    };

    webSocketManager.gameRoom[roomId] = newRoom;

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
      room: roomId,
      color: playerType.WHITE,
    };

    const blackPlayer: PlayerHash = {
      id: newRoom.blackId,
      room: roomId,
      color: playerType.BLACK,
    };

    await CreateRoomCache(
      `gameRoom:${roomId}`,
      redisRoom,
      `player:${whitePlayer.id}`,
      whitePlayer,
      `player:${blackPlayer.id}`,
      blackPlayer,
      3600
    );
    
    // Schedule player timeout
    await schedulePlayerTimeout(roomId, newRoom.whiteId, newRoom.whiteTime);
    // subscribe to the room
    subscribeToRoom(roomId);
    const clientPayload: clientSideRoom = {
      type: WebSocketMessageType.JOINROOM,
      roomId,
      room: redisRoom
    };

    ws.send(JSON.stringify(clientPayload));
    newRoom.whiteSocket?.send(JSON.stringify(clientPayload));

    webSocketManager.playerInRandomQueue = null;

    console.log(`Game room ${roomId} created and stored in Redis.`);
  } catch (err) {
    console.error("Error in addToLobby:", err);
    ws.send(JSON.stringify({
      code: '500',
      message: 'Internal server error during matchmaking.',
    }));
  }
}