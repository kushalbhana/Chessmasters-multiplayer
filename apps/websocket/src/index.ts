import { WebSocket, WebSocketServer } from 'ws';
import { RedisClientType } from 'redis';
import dotenv from 'dotenv';

import { initializeRedis } from './utils/redisUtils'
import { setRoomFromRedis } from './utils/redisUtils'
import { handleMessage } from './handlers/handleMessage';
import { Room, playerInQueue, gameRoom } from "@repo/lib/types"
dotenv.config({ path: '../../.env' });

// 'White' ---> Sender | SenderSocker
// 'black' ---> Reciever | RecieverSocker
class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer;
    public rooms: { [key: string]: Room } =  {};
    public playerInRandomQueue: playerInQueue | null = null;
    public gameRoom: {[key: string]: gameRoom} = {};
     
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
            ws.on('message', (data: string) => handleMessage(ws, data));
            ws.on('close', () => this.handleClose(ws));
        });

        console.log('WebSocket server running on port:', this.wss.options.port);
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

// Export an instance of WebSocketManager as a singleton
export const webSocketManager = WebSocketManager.getInstance();


