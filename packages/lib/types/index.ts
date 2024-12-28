import WebSocket from "ws";
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