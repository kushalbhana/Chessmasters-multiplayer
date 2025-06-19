// signaling.ts
import { WebSocket } from "ws";
import { authenticateUser } from "../utils/authorization";
import { STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { userWebSocketServer } from "@repo/lib/types";
import { webSocketManager } from "..";

type PlayerType = "white" | "black";

type Client = {
  socket: WebSocket;
  playerType: PlayerType;
  userId: string;
};

const rooms = new Map<string, Client[]>();

/**
 * Utility to send an error message to a socket.
 */
function sendError(socket: WebSocket, code: string, message: string) {
  socket.send(
    JSON.stringify({
      type: WebSocketMessageType.ERROR,
      code,
    //   @ts-ignore
      message: STATUS_MESSAGES[+code] || message,
    })
  );
}

/**
 * Handler when a user tries to join a video call room.
 */
export function handleJoinCall(socket: WebSocket, data: any) {
  const { JWT_token, roomId } = data;

  // Validate token and roomId
  if (!JWT_token || !roomId) {
    sendError(socket, "1007", "Missing JWT token or roomId");
    return;
  }

  const user: userWebSocketServer | null = authenticateUser(JWT_token);
  if (!user) {
    sendError(socket, "1008", "Authentication failed");
    return;
  }

  const gameRoom = webSocketManager.gameRoom[roomId];
  if (!gameRoom) {
    sendError(socket, "1009", "Room not found");
    return;
  }

  // Identify playerType
  let playerType: PlayerType;
  if (user.userId === gameRoom.whiteId) {
    playerType = "white";
    gameRoom.whiteSocket = socket;
  } else if (user.userId === gameRoom.blackId) {
    playerType = "black";
    gameRoom.blackSocket = socket;
  } else {
    sendError(socket, "1010", "User is not a participant in this room");
    return;
  }

  // Register the room if it doesn't exist
  if (!rooms.has(roomId)) rooms.set(roomId, []);
  const clients = rooms.get(roomId)!;

  // Prevent duplicate entries
  if (clients.find((c) => c.userId === user.userId)) return;

  clients.push({ socket, playerType, userId: user.userId });

  // Notify the other peer
  clients.forEach((client) => {
    if (client.userId !== user.userId) {
      client.socket.send(
        JSON.stringify({
          type: WebSocketMessageType.NEW_PEER,
          data: { roomId, sender: playerType },
        })
      );
    }
  });
}

/**
 * Handles SDP and ICE candidate messages with authentication.
 */
export function handleWebRTC(socket: WebSocket, data: any) {
  const { JWT_token, roomId, sdp, candidate, sender } = data;

  if (!JWT_token || !roomId) {
    sendError(socket, "1007", "Missing JWT token or roomId");
    return;
  }

  const user: userWebSocketServer | null = authenticateUser(JWT_token);
  if (!user) {
    sendError(socket, "1008", "Authentication failed");
    return;
  }

  const clients = rooms.get(roomId);
  if (!clients || clients.length < 2) return;

  const senderClient = clients.find((c) => c.userId === user.userId);
  if (!senderClient) {
    sendError(socket, "1011", "Sender not found in room");
    return;
  }

  clients.forEach((client) => {
    if (client.userId !== user.userId) {
      client.socket.send(
        JSON.stringify({
          type: WebSocketMessageType.WEBRTCOFFER,
          data: { roomId, sdp, candidate, sender },
        })
      );
    }
  });
}

/**
 * Handles client disconnection and notifies peers.
 */
export function handleDisconnect(socket: WebSocket) {
  for (const [roomId, clients] of rooms.entries()) {
    const disconnectedClient = clients.find((c) => c.socket === socket);
    if (!disconnectedClient) continue;

    const updated = clients.filter((c) => c.socket !== socket);

    if (updated.length === 0) {
      rooms.delete(roomId);
    } else {
      rooms.set(roomId, updated);

      // Notify the remaining peer
      updated.forEach((client) => {
        client.socket.send(
          JSON.stringify({
            type: WebSocketMessageType.PEER_LEFT,
            data: { roomId, userId: disconnectedClient.userId },
          })
        );
      });
    }

    // Clean up from the game room state
    const room = webSocketManager.gameRoom[roomId];
    if (room) {
      if (room.whiteSocket === socket) room.whiteSocket = null;
      if (room.blackSocket === socket) room.blackSocket = null;
    }
  }
}
