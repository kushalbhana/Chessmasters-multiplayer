import WebSocket from "ws";
import { handleAuthorization } from "../utils/authorization";
import { webSocketManager } from "..";
import { pushToRedis } from "../utils/redisUtils";

export async function handleMessage(ws: WebSocket, data: string) {
    const message = JSON.parse(data);

    if (!message.roomId) {
        ws.send(JSON.stringify({ type: 'error', 
            message: 'Room ID not provided' }));
        ws.close(4000, 'Room ID not provided');
        return;
    }
    const roomId = message.roomId;

    // Initialize the room if it doesn't exist
    if (!webSocketManager.rooms[roomId]) {
        webSocketManager.rooms[roomId] = { boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves:[{'message': 'Game started'}] };
        
    }
    const room = webSocketManager.rooms[roomId];

    if (message.type === 'sender') {
        if (!room?.senderSocket) {
                // Verify the token using the route
                console.log('Checking auth..')
                const verify = await handleAuthorization(message, roomId!, ws, 'sender')

                if(!verify){
                    return;
                }

            console.log('Sender socket connected to:', roomId);
            if (room){
                console.log('boardState before sending: ', room.boardState)
              room.senderSocket = ws;
              room.senderSocket.send(JSON.stringify({ type: 'color', color: 'white', boardState: room.boardState }));
            }

        } else if (!room.receiverSocket) {
            console.log('Receiver socket connected to:');

            // Verify User
            const verify = await handleAuthorization(message, roomId, ws, 'receiver')
            if(!verify){
                return
            }
            room.receiverSocket = ws;
            room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black', boardState: room.boardState }));

            const cachedRoom = await webSocketManager.redisClient.hSet('rooms', roomId, JSON.stringify(webSocketManager.rooms));
    
        } else {
            console.log('Additional sender attempted to connect.');
            ws.close(4000, 'Only one sender allowed');
        }
    } else if (message.type === 'receiver') {
        if (!room?.receiverSocket) {
            console.log('Receiver socket connected to:');

            // Verify User
            const verify = await handleAuthorization(message, roomId, ws, 'receiver')
            if(!verify){
                return
            }

            if(room){
              room.receiverSocket = ws;
              room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black', boardState: room.boardState }));

              const roomEntries = Object.entries(webSocketManager.rooms);
                for (const [key, value] of roomEntries) {
                    // Serialize the room object to a JSON string
                    const roomData = JSON.stringify(value);
                    await webSocketManager.redisClient.hSet('rooms', key, roomData);
}
            }
        } else {
            console.log('Additional receiver attempted to connect.');
            ws.close(4000, 'Only one receiver allowed');
        }
    }

    if(message.type==='checkmate'){
        if(room?.receiverSocket && message.winner === 'white'){
            room?.receiverSocket.send(JSON.stringify({ type: 'checkmate', message: 'You got checkmate' }));
        }else if(room?.senderSocket && message.winner === 'blcak'){
            room.senderSocket.send(JSON.stringify({ type: 'checkmate', message: 'You got CHeckmate' }));
        }else{
            console.log('Pushing the game to redis');
        }
    }

    if (room?.senderSocket || room?.receiverSocket) {

        if (message.type === 'moveFromSender') {
            webSocketManager.rooms[roomId]?.moves?.push(message);
            await pushToRedis(roomId);

            console.log('Move initiated by sender to Sender ');
            room.boardState = message.boardState;  //Saving the move from one player
            if (room.receiverSocket){
                room.receiverSocket.send(JSON.stringify({ type: 'move', move: message.move }));
            }

        } else if (message.type === 'moveFromReceiver') {
            await pushToRedis(roomId);
            console.log('Move initiated by receiver to Reciever');
            room.boardState = message.boardState;
            if (room.senderSocket)
                room.senderSocket.send(JSON.stringify({ type: 'move', move: message.move }));
        }

        if(message.type === 'textMessage'){
            if(ws === room.senderSocket){
                room.receiverSocket?.send(JSON.stringify({ type: 'textMessage', message: message.message.text }))
            }else{
                room.senderSocket?.send(JSON.stringify({ type: 'textMessage', message: message.message.text }))
            
            }
        }
    }
}