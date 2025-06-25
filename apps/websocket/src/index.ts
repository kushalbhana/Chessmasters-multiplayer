import { WebSocket, WebSocketServer } from 'ws';
import { RedisClientType } from 'redis';
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';

import { initializeRedis } from './utils/redisUtils'
import { handleMessage } from './handlers/handleMessage';
import { Room, playerInQueue, gameRoom, waitingGameRoom } from "@repo/lib/types"
dotenv.config({ path: '../../.env' });

// 'White' ---> Sender | SenderSocker
// 'black' ---> Reciever | RecieverSocker
class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer;
    public rooms: { [key: string]: Room } =  {};
    public playerInRandomQueue: playerInQueue | null = null;
    public gameRoom: {[key: string]: gameRoom} = {};
    public waitingRoom: {[key: string]: waitingGameRoom} = {};  //Waiting for friend to join
    public instanceId: string;
     
    public redisClient!: RedisClientType; 

    private constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.initialize();
        this.instanceId = uuidv4();
        
        initializeRedis()
            .then((redisClient) => {
                this.redisClient = redisClient; // Set the redis client after initialization
                console.log('Redis client initialized');
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
        for (const roomId in this.gameRoom) {
            const room = this.gameRoom[roomId];
            if (room?.whiteSocket === ws) {
                console.log('Sender socket disconnected in room:', roomId);
                room.whiteSocket = null;
            } else if (room?.blackSocket === ws) {
                console.log('Receiver socket disconnected in room:', roomId);
                room.blackSocket = null;
            }

            // Check if the user if waiting in the lobby
            if(this.playerInRandomQueue?.playerSocket === ws) 
                this.playerInRandomQueue = null;

            // Clean up room if both sockets are null
            if (!room?.whiteSocket && !room?.blackSocket) {
                delete this.gameRoom[roomId];
            }
        }
    }
}

// Export an instance of WebSocketManager as a singleton
export const webSocketManager = WebSocketManager.getInstance();


