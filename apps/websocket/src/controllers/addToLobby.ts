import { WebSocket } from "ws";
import { Chess } from "chess.js";
import crypto from "crypto";

import { webSocketManager } from "..";
import { playerType, STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { userWebSocketServer, gameRoom, RedisRoom, PlayerHash, clientSideRoom } from "@repo/lib/types";
import { authenticateUser } from "../utils/authorization";
import { CreateRoomCache } from "../utils/redisUtils";

export async function addToLobby(ws: WebSocket, message: any): Promise<void> {
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
    const isInRoom = await redis.exists(playerKey);

    if (isInRoom) {
      const playerRoom = await redis.hGet(playerKey, "room");
      if (playerRoom) {
        const roomData = await redis.hGetAll(`gameRoom:${playerRoom}`);
        roomData.roomId = playerRoom;
        console.log(`User ${user.userId} is already in room ${playerRoom}.`);
        ws.send(JSON.stringify({
          type: WebSocketMessageType.JOINROOM,
          room_info: roomData,
        }));
      }
      return;
    }

    // Matchmaking logic
    const currentQueuePlayer = webSocketManager.playerInRandomQueue;

    if (!currentQueuePlayer) {
      webSocketManager.playerInRandomQueue = {
        playerId: user.userId,
        playerName: user.name,
        profilePicture: user.picture,
        playerSocket: ws,
      };
      console.log(`User ${user.userId} added to matchmaking queue.`);
      return;
    }

    // Start game with matched players
    const roomId = crypto.randomUUID();
    const chess = new Chess();

    const newRoom: gameRoom = {
      whiteId: currentQueuePlayer.playerId,
      whiteName: currentQueuePlayer.playerName,
      whiteProfilePicture: currentQueuePlayer.profilePicture,
      whiteSocket: currentQueuePlayer.playerSocket,
      blackId: user.userId,
      blackName: user.name,
      blackProfilePicture: user.picture,
      blackSocket: ws,
      game: chess,
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
      game: JSON.stringify(chess),
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
      1200
    );

    const clientPayload: clientSideRoom = {
      type: WebSocketMessageType.JOINROOM,
      roomId,
      room: redisRoom,
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
