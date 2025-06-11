import { webSocketManager } from '../index';
import { authenticateUser } from '../utils/authorization';
import { WebSocketMessageType } from '@repo/lib/status';
import { handleTextMessage } from './textMessage';

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

            if(parsedMessage.type === WebSocketMessageType.TEXTMESSAGE){
                handleTextMessageFromPubSub(parsedMessage);
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

async function handleTextMessageFromPubSub(message: any){

    console.log('Handling messages from pubsub')
    if(!message.userId || !message.roomId || !message.instanceId){
        console.log("No roomId or userId for text message sent through pubsub")
        return;
    }

    if(message.instanceId === webSocketManager.instanceId){
        console.log('Same instance, So not sending the mesage')
        return;
    }

    const room = webSocketManager.gameRoom[message.roomId]!;

    // Send Message
    if(room?.blackId == message.userId){
        webSocketManager?.gameRoom[message.roomId]?.whiteSocket?.send(JSON.stringify({type: WebSocketMessageType.TEXTMESSAGE, message:message.message}));
        console.log('Message sent to white')
    }else{
        webSocketManager?.gameRoom[message.roomId]?.blackSocket?.send(JSON.stringify({type: WebSocketMessageType.TEXTMESSAGE, message: message.message}));
        console.log('Message sent to Black')
    }

} 