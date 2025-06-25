import { webSocketManager } from '..';
import crypto, { randomUUID } from 'crypto'
import { WebSocket } from 'ws';
import { userWebSocketServer, waitingGameRoom } from '@repo/lib/types';
import { authenticateUser } from '../utils/authorization';
import { STATUS_MESSAGES, WebSocketMessageType } from '@repo/lib/status';
import { Chess } from 'chess.js';

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
            
            const code = crypto.randomUUID();
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