import axios, { AxiosResponse } from 'axios';
import WebSocket from 'ws';
import { Room } from '..';
import { STATUS_MESSAGES } from '@repo/lib/status';

// Constants for status codes and messages


type AuthorizationResponse = {
    status: number;
    data: {
        userId: string;  // Assuming userId is directly under data, if it's nested adjust accordingly
    };
}

type NodeType = 'sender' | 'receiver';

// Utility function to send a structured message via WebSocket
const sendWsMessage = (ws: WebSocket, type: string, status: string, message: string) => {
    ws.send(JSON.stringify({ type, status, message }));
};

// Utility function to update the room with sender/receiver user ID
const updateRoomUser = (room: Room, node: NodeType, userId: string) => {
    if (node === 'sender') {
        room.sender = userId;
    } else if (node === 'receiver') {
        room.reciever = userId;
    }
};

// Function to verify the token by calling the verification API
const verifyToken = async (token: string): Promise<AxiosResponse<AuthorizationResponse>> => {
    return await axios.post(
        'http://localhost:3000/api/verifyJWT',
        { token },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

// Function to process the response from the token verification API
const processAuthorizationResponse = (response: AxiosResponse<AuthorizationResponse>, ws: WebSocket, room: Room, node: NodeType): boolean => {
    const { status, data } = response;

    // If successful, update the room and return true
    if (status === 200) {
        sendWsMessage(ws, 'authorization', '200', STATUS_MESSAGES[200]);
        updateRoomUser(room, node, data.data.userId);  // Use userId directly here
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
export const handleAuthorization = async (message: any, room: Room, ws: WebSocket, node: NodeType): Promise<boolean> => {
    try {
        const response = await verifyToken(message.token);
        return processAuthorizationResponse(response, ws, room, node);
    } catch (error: any) {
        console.error('Authorization error:', error?.response?.data || error.message);
        sendWsMessage(ws, 'authorization', '401', STATUS_MESSAGES[401]);
        return false;
    }
};
