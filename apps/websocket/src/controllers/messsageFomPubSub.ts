import { webSocketManager } from '../index';
import { authenticateUser } from '../utils/authorization';
import { WebSocketMessageType } from '@repo/lib/status';

export function handleMessageFromPubSub(message: string) {
    try {
        const parsedMessage = JSON.parse(message);
        if(!parsedMessage.roomId){
            console.log("No roomId found in message");
            return;
        }
        const roomId = parsedMessage.roomId;
            const move = parsedMessage.move;
        
            // Check if the room exists
            if (!webSocketManager.gameRoom[roomId]){
                // Unsubscribe topic
                return;
            }
        
            const room = webSocketManager.gameRoom[roomId]!;
            if(parsedMessage.boardState === room.game.fen()){
                console.log("Fen is same, no need to make move");
                return;
            }
            console.log("Directly making move.......................");
            // Check if the move is valid
            const newMove = webSocketManager?.gameRoom[roomId]?.game.move(move)!;
            console.log("Move made:", newMove);

            if(room?.whiteId){
                if(room.blackSocket){
                    room.blackSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
                }
            }else if(room?.blackId){
                if(room.whiteSocket){
                    room.whiteSocket.send(JSON.stringify({ type: WebSocketMessageType.INGAMEMOVE, move, boardState: room.game.fen() }));
                }
            }

        } catch (error) {
            console.error("Error in makeMove:", error);
            return;
            
        }
}