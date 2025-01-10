import axios, { AxiosResponse } from 'axios';
import WebSocket from 'ws';
import { STATUS_MESSAGES } from '@repo/lib/status';
import { webSocketManager } from '..';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { AuthorizationResponse } from "@repo/lib/types"
import { NodeType, userWebSocketServer } from "@repo/lib/types"


// Utility function to send a structured message via WebSocket
const sendWsMessage = (ws: WebSocket, type: string, status: string, message: string) => {
    ws.send(JSON.stringify({ type, status, message }));
};

// Utility function to update the room with sender/receiver user ID
const updateRoomUser = (roomId: string, node: NodeType, userId: string) => {
    const room = webSocketManager.rooms[roomId];
    if (!room) {
        throw new Error(`Room with ID ${roomId} not found`);
    }

    if (node === 'sender') {
        room.sender = userId;
    } else if (node === 'receiver') {
        room.reciever = userId;
    }
};

// Function to verify the token by calling the verification API
const verifyToken = async (token: string): Promise<AxiosResponse<AuthorizationResponse>> => {
    return await axios.post(
        `http://localhost:3000/api/verifyJWT`,
        { token },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

// Function to process the response from the token verification API
const processAuthorizationResponse = (response: AxiosResponse<AuthorizationResponse>, ws: WebSocket, roomId: string, node: NodeType): boolean => {
    const { status, data } = response;

    // If successful, update the room and return true
    if (status === 200) {
        sendWsMessage(ws, 'authorization', '200', STATUS_MESSAGES[200]);
        console.log('Data: ', data.user.userId)
        updateRoomUser(roomId, node, data.user.userId);  // Use userId directly here
        return true;
    }

    // Handle other statuses
    const message = STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] !== undefined 
        ? STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] 
        : STATUS_MESSAGES.UNKNOWN;  // Default to 'UNKNOWN' if not found
    sendWsMessage(ws, 'authorization', status.toString(), message);
    return false;
};

// Main function to handle the authorization process
export const handleAuthorization = async (message: any, roomId: string, ws: WebSocket, node: NodeType): Promise<boolean> => {
    try {
        const response = await verifyToken(message.token);
        console.log('handleAuthorization: ', response.data)
        return processAuthorizationResponse(response, ws, roomId, node);
    } catch (error: any) {
        console.error('Authorization error:', error?.response?.data || error.message);
        sendWsMessage(ws, 'authorization', '401', STATUS_MESSAGES[401]);
        return false;
    }
};


export function authenticateUser(token: string): userWebSocketServer | null {
    try {
        console.log('Reached here: ', token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('Decoded ',decoded);
        
        if (decoded && typeof decoded === 'object' && decoded.userId) {
            return {
                userId: decoded.userId as string,
                email: decoded.email
            };
        }
        return null;
    } catch (error) {
        console.log(error)
        return null;
    }
}
