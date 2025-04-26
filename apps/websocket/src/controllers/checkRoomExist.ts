import WebSocket from "ws";

import { STATUS_MESSAGES } from "@repo/lib/status";
import { userWebSocketServer } from "@repo/lib/types";
import { WebSocketMessageType } from "@repo/lib/status";
import { authenticateUser } from "../utils/authorization";
import { webSocketManager } from "..";

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
          
              console.log("User authenticated:", user.userId);

              // Check if user is already in a room
                const redis = webSocketManager.redisClient;
                const playerKey = `player:${user.userId}`;
                const isInRoom = await redis.exists(playerKey);
                console.log('isInRoom: ',isInRoom)
              
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
                    ws.send(JSON.stringify(data));
                    console.log('roomData: ', roomData)
                  }
                    return;
                  }
    } catch (error) {
        console.log('Error at checking room exist: ',error)
        return;
    }
}