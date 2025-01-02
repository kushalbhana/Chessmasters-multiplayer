import { createClient, RedisClientType } from 'redis';
import { Room } from '@repo/lib/types';
import { webSocketManager } from '..';

let redisClient: RedisClientType | null = null;

export async function initializeRedis(): Promise<RedisClientType> {
    if (redisClient) {
        console.log('Reusing existing Redis connection...');
        return redisClient;
    }
    
    try {
        redisClient = createClient();
        redisClient.on('error', (err: Error) => {
            console.error('Redis Client Error:', err);
        });

        await redisClient.connect();
        console.log('Connected to Redis...');
        return redisClient;
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        throw error; // 🔥 Important: Throw the error to ensure the return type remains Promise<RedisClientType>
    }
}

export async function setRoomFromRedis(){
        try {
            const cachedRoom = await redisClient?.hGetAll('rooms');
            console.log('cached Rooms from redis',typeof(cachedRoom))
            if (cachedRoom) {
                let colledtedRooms: { [key: string]: Room } = {};
                for (const key in cachedRoom) {
                        let room: Room = JSON.parse(cachedRoom[key]!)

                        if(room.senderSocket){
                            room.senderSocket = null;
                        }
                        if(room.receiverSocket){
                            room.receiverSocket = null;
                        }
                        
                        colledtedRooms[key] = room;
                    }
                    return colledtedRooms; 
            }
             
        } catch (error) {
            console.log(error)
            return {};
        }
    }
export async function pushToRedis(roomId: string){
        try {
            console.log('started pushing to redis..')
            // Retrieve the cached moves
            webSocketManager.redisClient.hSet('rooms', roomId, JSON.stringify(webSocketManager.rooms[roomId]));
        } catch (error) {
            console.log(error);
        }  
    }
export async function getRoomFromRedis(redisClient: RedisClientType) {
    try {
        const cachedRoom = await redisClient.hGetAll('rooms');
        if (cachedRoom) {
            const rooms: { [key: string]: Room } = {};
            for (const key in cachedRoom) {
                const room: Room = JSON.parse(cachedRoom[key]!);
                rooms[key] = room;
            }
            return rooms;
        }
        return null;
    } catch (error) {
        console.error('Error fetching room from Redis:', error);
    }
}
