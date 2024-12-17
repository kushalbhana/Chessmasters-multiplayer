import { WebSocket } from 'ws';
import { postVerifyJWT } from '../utils/axiosUtils';
import { Room } from '../interfaces/Room';

export async function handleAuthorization(message: any, room: Room, ws: WebSocket, node: string) {
    try {
        const response = await postVerifyJWT(message.token);
        
        switch(response.status) {
            case 200:
                ws.send(JSON.stringify({ type: 'authorization', status: '200', message: 'Authorized token' }));
                if (node === 'sender') room.sender = response.data.user.userId;
                if (node === 'reciever') room.reciever = response.data.user.userId;
                return true;
            case 498:
                ws.send(JSON.stringify({ type: 'authorization', status: '498', message: 'Invalid Token' }));
                break;
            case 403:
                ws.send(JSON.stringify({ type: 'authorization', status: '403', message: 'Web Token Error' }));
                break;
            case 500:
                ws.send(JSON.stringify({ type: 'authorization', status: '500', message: 'Token expired' }));
                break;
            default:
                ws.send(JSON.stringify({ type: 'authorization', status: '500', message: 'Unknown error occurred' }));
        }
        return false;
    } catch (error) {
        console.error('Error in handleAuthorization:', error);
        ws.send(JSON.stringify({ type: 'authorization', status: '401', message: 'Token not valid' }));
        return false;
    }
}
