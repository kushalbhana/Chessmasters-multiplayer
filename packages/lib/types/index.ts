import WebSocket from "ws";
import { Chess } from "chess.js";
export type AuthorizationResponse = {
    status: number;
        user:{
            userId: string;  // Assuming userId is directly under data, if it's nested adjust accordingly
            email:string;
        }
}

export type NodeType = 'sender' | 'receiver';

export interface Room {
    senderSocket?: WebSocket | null;
    receiverSocket?: WebSocket | null;
    boardState: string | 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    sender?: any;
    reciever?: any;
    moves?: any;
    senderTime?: Date;
    recieverTime?: Date;
}

export type gameRoom = {
    whiteId: string,
    whiteName: string,
    whiteProfilePicture: string,
    blackId: string,
    blackName: string,
    blackProfilePicture: string,
    whiteSocket?: WebSocket | null,
    blackSocket?: WebSocket | null,
    game: Chess
}

export type playerInQueue = {
    playerSocket: WebSocket | null;
    playerId: string,
    playerName: string,
    profilePicture: string
}

export type joinLobbyMessage = {
    type: string,
    JWT_token: string,
    time?: number
}

export type userWebSocketServer = {
    userId: string,
    name: string,
    email: string,
    picture: string
}

export enum PlayerType {
    WHITE = "white",
    BLACK = "black",
}

// Define type for redisRoom
export interface RedisRoom {
    whiteId: string,
    whiteName: string,
    whiteProfilePicture: string,
    blackId: string,
    blackName: string,
    blackProfilePicture: string,
    whiteSocket: 'connected' | 'disconnected';
    blackSocket: 'connected' | 'disconnected';
    game: string; // Replace with actual type if boardState has a specific structure
}

// Define type for player hash
export interface PlayerHash {
    id: string | "";
    room: string;
    color: string;
}

export type clientSideRoom = {
    type: string,
    roomId: string,
    room: RedisRoom
}