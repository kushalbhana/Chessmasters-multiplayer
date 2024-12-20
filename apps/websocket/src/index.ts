import { WebSocket, WebSocketServer } from 'ws';
import axios from 'axios';
import { RedisClientType } from 'redis';

import { initializeRedis } from './utils/redisUtils'
import { setRoomFromRedis } from './utils/redisUtils'
import { handleAuthorization } from './utils/authorization'


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

// 'White' ---> Sender | SenderSocker
// 'black' ---> Reciever | RecieverSocker
class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer;
    private rooms: { [key: string]: Room } =  {};
     
    public redisClient!: RedisClientType; 

    private constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.initialize();
        
        initializeRedis()
            .then((redisClient) => {
                this.redisClient = redisClient; // Set the redis client after initialization
                console.log('Redis client initialized');
                
                setRoomFromRedis().then((colledtedRooms) => {
                    if(colledtedRooms != null){
                        this.rooms = colledtedRooms
                    }
                    console.log('Rooms initialized from Redis...');
                }).catch((error) => {
                    console.log('Error setting rooms from Redis:', error);
                });
            })
            .catch((error) => {
                console.log('Error initializing Redis:', error);
            });
    }

    public static getInstance(port: number = 8080): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager(port);
        }
        return WebSocketManager.instance;
    }

    private async initialize() {
        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('error', console.error);
            ws.on('message', (data: string) => this.handleMessage(ws, data));
            ws.on('close', () => this.handleClose(ws));
        });

        console.log('WebSocket server running on port:', this.wss.options.port);
    }

    private async pushToRedis(roomId: string){
        try {
            console.log('started pushing to redis..')
            // Retrieve the cached moves
            this.redisClient.hSet('rooms', roomId, JSON.stringify(this.rooms[roomId]));
        } catch (error) {
            console.log(error);
        }  
    }

    // Handle messages and moves
    private async handleMessage(ws: WebSocket, data: string) {
        const message = JSON.parse(data);

        if (!message.roomId) {
            ws.send(JSON.stringify({ type: 'error', 
                message: 'Room ID not provided' }));
            ws.close(4000, 'Room ID not provided');
            return;
        }
        const roomId = message.roomId;

        // Initialize the room if it doesn't exist
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = { boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves:[{'message': 'Game started'}] };
            
        }
        const room = this.rooms[roomId];

        if (message.type === 'sender') {
            if (!room?.senderSocket) {
                    // Verify the token using the route
                    const verify = handleAuthorization(message, room!, ws, 'sender')

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
                const verify = handleAuthorization(message, room, ws, 'receiver')
                if(!verify){
                    return
                }
                room.receiverSocket = ws;
                room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black', boardState: room.boardState }));

                const cachedRoom = await this.redisClient.hSet('rooms', roomId, JSON.stringify(this.rooms));
        
            } else {
                console.log('Additional sender attempted to connect.');
                ws.close(4000, 'Only one sender allowed');
            }
        } else if (message.type === 'receiver') {
            if (!room?.receiverSocket) {
                console.log('Receiver socket connected to:');

                // Verify User
                const verify = handleAuthorization(message, roomId, ws, 'receiver')
                if(!verify){
                    return
                }

                if(room){
                  room.receiverSocket = ws;
                  room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black', boardState: room.boardState }));

                  const roomEntries = Object.entries(this.rooms);
                    for (const [key, value] of roomEntries) {
                        // Serialize the room object to a JSON string
                        const roomData = JSON.stringify(value);
                        await this.redisClient.hSet('rooms', key, roomData);
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
                this.rooms[roomId]?.moves?.push(message);
                await this.pushToRedis(roomId);

                console.log('Move initiated by sender to Sender ');
                room.boardState = message.boardState;  //Saving the move from one player
                if (room.receiverSocket){
                    room.receiverSocket.send(JSON.stringify({ type: 'move', move: message.move }));
                }

            } else if (message.type === 'moveFromReceiver') {
                await this.pushToRedis(roomId);
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

    private handleClose(ws: WebSocket): void {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room?.senderSocket === ws) {
                console.log('Sender socket disconnected in room:', roomId);
                room.senderSocket = null;
            } else if (room?.receiverSocket === ws) {
                console.log('Receiver socket disconnected in room:', roomId);
                room.receiverSocket = null;
            }

            // Clean up room if both sockets are null
            if (!room?.senderSocket && !room?.receiverSocket) {
                delete this.rooms[roomId];
            }
        }
    }
}

async function getRoomFromRedis(redisClient:RedisClientType){
    const cachedRoom = await redisClient.hGetAll('rooms');
    if(cachedRoom){
        let rooms: any = {};
        for (const key in cachedRoom) {
            if (cachedRoom.hasOwnProperty(key)) {
                // Assuming you have a function to convert a string to a Room object
                const room: Room = JSON.parse(cachedRoom[key]!);
                rooms[key] = room;
            }
        }
        return rooms;
    }else{
        return null;
    }
}
// Export an instance of WebSocketManager as a singleton
export const webSocketManager = WebSocketManager.getInstance();


