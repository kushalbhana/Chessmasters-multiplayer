import WebSocket from "ws";

import { STATUS_MESSAGES } from "@repo/lib/status";
import { gameRoom, userWebSocketServer } from "@repo/lib/types";
import { WebSocketMessageType } from "@repo/lib/status";
import { authenticateUser } from "../utils/authorization";
import { webSocketManager } from "..";
import { Chess } from "chess.js";
import { subscribeToRoom } from "../utils/redisUtils";

export async function checkRoomExist(ws: WebSocket, message: any){
    try {
      console.log('In Check room Exists');
        if (!message.JWT_token) {
            ws.send(JSON.stringify({
              code: '1007',
              message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token.',
            }));
            return;
          }

          console.log('Auth Done');
           const user: userWebSocketServer | null = authenticateUser(message.JWT_token);
          
              if (!user) {
                ws.send(JSON.stringify({
                  code: '498',
                  message: STATUS_MESSAGES[498] || 'Invalid or Expired Token.',
                }));
                return;
              }

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
                     const data = {
                      type: WebSocketMessageType.JOINROOM,
                      roomId: playerRoom,
                      room: roomData,
                    }
                    

                    // If the room is already created, then store the room locally
                    if(!webSocketManager.gameRoom[roomData.roomId]){
                      const localRoomData : gameRoom = {
                        whiteId: roomData.whiteId ?? "",
                        whiteName: roomData.whiteName ?? "",
                        whiteProfilePicture: roomData.whiteProfilePicture ?? "",
                        blackId: roomData.blackId ?? "",
                        blackName: roomData.blackName ?? "",
                        blackProfilePicture: roomData.blackProfilePicture ?? "",
                        whiteSocket: user.userId === roomData.whiteId ? ws : null,
                        blackSocket: user.userId === roomData.blackId ? ws : null,
                        blackTime: roomData.blackTime ? parseInt(roomData.blackTime) : 600,
                        whiteTime: roomData.whiteTime ? parseInt(roomData.whiteTime) : 600,
                        lastMoveTime: roomData.lastMoveTime ? new Date(roomData.lastMoveTime) : new Date(),
                        game: new Chess(roomData.game) ?? new Chess,
                        moves: roomData.moves ? roomData.moves.split(',') : [],
                      };
                      webSocketManager.gameRoom[roomData.roomId] = localRoomData; 
                    }else{
                        const localRoomData : gameRoom = webSocketManager.gameRoom[roomData.roomId]!;
                        if(user.userId === roomData.whiteId){
                          localRoomData.whiteSocket = ws;
                        }else{
                          localRoomData.blackSocket = ws;
                        }
                    }
                    subscribeToRoom(playerRoom);
                    ws.send(JSON.stringify(data));
                  }
                    return;
                  }
    } catch (error) {
        console.log('Error at checking room exist: ',error)
        return;
    }
}