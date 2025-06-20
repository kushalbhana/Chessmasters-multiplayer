import { createClient, RedisClientType } from 'redis';
import { Room } from '@repo/lib/types';
import { webSocketManager } from '..';
import { WebSocketMessageType } from '@repo/lib/status';
import { handleMessageFromPubSub } from '../controllers/messsageFomPubSub';

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

    const gameToDB = {
        id: roomKey,
        user1: whiteId,
        user2: blackId
    }
    multi.rPush("queue:movesQueue", JSON.stringify(gameToDB));
    
    await multi.exec();

}

export async function subscribeToRoom(roomId: string) {
    try {
        const subRedisClient = createClient({
            url : process.env.REDIS_URL
          });
          
          subRedisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));

            await subRedisClient.connect();
            console.log('Connected to Sub Redis...');
            const channel = `room:${roomId}:channel`;
            
            subRedisClient.subscribe(channel, (message) => {
            console.log(`New message in room ${roomId}:`, message);
        
            // Process the message (you can adapt this as needed)
                handleMessageFromPubSub(message);
            });
        
            console.log(`Subscribed to room ${roomId} channel.`);
        } catch (error) {
            console.error('Error connecting to Redis:', error);
            throw error;
        }
  }


export async function sendMoveToRedis(roomId: string, boardFen: string, move: any, userId: string) {
    const messgageForQueue = JSON.stringify({userId, roomId, move});
    const messageToPubSub = JSON.stringify({type: WebSocketMessageType.INGAMEMOVE, roomId, move, boardState: boardFen});
    const client = webSocketManager.redisClient;
    await client.eval(
        `
          redis.call('HSET', KEYS[1], 'game', ARGV[1])
          redis.call('LPUSH', KEYS[2], ARGV[2])
          redis.call('PUBLISH', KEYS[3], ARGV[3])
          return 1
        `,
        {
          keys: [`gameRoom:${roomId}`, 'queue:movesQueue', `room:${roomId}:channel`],
          arguments: [boardFen, messgageForQueue, messageToPubSub]
        }
      );
}

export async function saveMovesArrayToRedis(roomId: string, moves: string) {
    const client = webSocketManager.redisClient;
    const multi = client.multi();
    multi.hSet(`gameRoom:${roomId}`, 'moves', JSON.stringify(moves));
        
    await multi.exec();
}
export async function SaveRemainingTimeToRedis(roomId: string, time: number, whichUser: 'blackTime' | 'whiteTime') {
    const client = webSocketManager.redisClient;
    const multi = client.multi();
    multi.hSet(`gameRoom:${roomId}`, whichUser, time);
        
    await multi.exec();
}

export async function postGameCleanUp(roomId: string, user1: string, user2: string, data: {id: string, winner:string, overType: string}) {
    const client = webSocketManager.redisClient;
    const multi = client.multi();
    
    multi.rPush('queue:gameOverQueue', JSON.stringify(data));
    // Delete entire Redis keys
    multi.del(`gameRoom:${roomId}`);
    multi.del(`player:${user1}`);
    multi.del(`player:${user2}`);
  
    await multi.exec();
  }
    
export async function sendTextMessageToPubSub(roomId: string, message: string, userId: string){
    const messageToPubSub = JSON.stringify({type: WebSocketMessageType.TEXTMESSAGE, roomId, message, instanceId: webSocketManager.instanceId, userId});
    const client = webSocketManager.redisClient;
    const channel = `room:${roomId}:channel`;

    try {
        await client.publish(channel, messageToPubSub);
        console.log('Message sent to channel...')
    } catch (error) {
        console.log(error)
    }
}

export async function handleWebRTCRequestsForPubSub(message: any, roomId: string){
    message.instanceId = webSocketManager.instanceId;
    const client = webSocketManager.redisClient;
    const channel = `room:${roomId}:channel`;

    try {
        await client.publish(channel, message);
        console.log('Message sent to channel...')
    } catch (error) {
        console.log(error)
    }
}
