import { createClient, RedisClientType } from 'redis';
import { Room } from '@repo/lib/types';
import { webSocketManager } from '..';

let redisClient: RedisClientType | null = null;

export async function initializeRedis(): Promise<RedisClientType> {
    if (redisClient)
        return redisClient;
    
    try {
        redisClient = createClient({
            url : process.env.REDIS_URL
          });
          
        redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));

        await redisClient.connect();
        console.log('Connected to Redis...');
        return redisClient;
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        throw error;
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

                        if(room.senderSocket) room.senderSocket = null;
                        if(room.receiverSocket) room.receiverSocket = null;
                        
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

// Create room in redis and assign that room to user in redis with expiry time
export async function CreateRoomCache(roomKey: string, data: any, whiteId: string, whiteData: any, blackId: string, blackData: any, expiryTimeInSeconds: number){
    const multi = webSocketManager.redisClient.multi();

    multi.hSet(roomKey, data);
    multi.hSet(whiteId, whiteData);
    multi.hSet(blackId, blackData);
    
    multi.expire(roomKey, expiryTimeInSeconds);
    multi.expire(whiteId, expiryTimeInSeconds);
    multi.expire(blackId, expiryTimeInSeconds);
    
    await multi.exec();

}

export async function sendMoveToRedis(roomId: string, boardFen: string, move: any, userId: string) {
    const messgageForQueue = JSON.stringify({userId, roomId, move});
    const client = webSocketManager.redisClient;
    await client.eval(
        `
          redis.call('HSET', KEYS[1], 'game', ARGV[1])
          redis.call('LPUSH', KEYS[2], ARGV[2])
          return 1
        `,
        {
          keys: [`gameRoom:${roomId}`, 'queue:movesQueue'],
          arguments: [boardFen, messgageForQueue]
        }
      );
}
