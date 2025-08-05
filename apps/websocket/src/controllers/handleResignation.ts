import { gameStatusMessage, STATUS_MESSAGES, WebSocketMessageType } from "@repo/lib/status";
import { authenticateUser } from "../utils/authorization";
import { userWebSocketServer } from "@repo/lib/types";
import { webSocketManager } from "..";
import WebSocket from "ws";

export const handleResignation = (message: any, ws: WebSocket) => {
        if (!message.JWT_token || !message.roomId) {
            ws.send(JSON.stringify({
                code: '1007',
                message: STATUS_MESSAGES[1007] || 'Invalid Payload: Missing JWT token or Room ID.',
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
        const playerRoom = webSocketManager.gameRoom[message.roomId];
        if(!playerRoom){
            console.log('No room found')
            return;
        }

        if(user.userId != playerRoom.blackId && user.userId != playerRoom.whiteId)
            return;

        if(user.userId === playerRoom.blackId){
            if(playerRoom.whiteSocket)
                playerRoom.whiteSocket.send(JSON.stringify({type: WebSocketMessageType.GAMEOVER, gameOverType: 'Resignation',
                gameOverMessage: gameStatusMessage.ResignationWin , OverType: 'Win'}));
            if(playerRoom.blackSocket){
                playerRoom.blackSocket.send(JSON.stringify({type: WebSocketMessageType.GAMEOVER, gameOverType: 'Resignation',
                gameOverMessage: gameStatusMessage.ResignationLose , OverType: 'Lose'}))
            }
        }else{
            if(playerRoom.whiteSocket)
                playerRoom.whiteSocket.send(JSON.stringify({type: WebSocketMessageType.GAMEOVER, gameOverType: 'Resignation',
                gameOverMessage: gameStatusMessage.ResignationLose , OverType: 'Lose'}));
            if(playerRoom.blackSocket){
                playerRoom.blackSocket.send(JSON.stringify({type: WebSocketMessageType.GAMEOVER, gameOverType: 'Resignation',
                gameOverMessage: gameStatusMessage.ResignationWin , OverType: 'Win'}))
            }
        }
}