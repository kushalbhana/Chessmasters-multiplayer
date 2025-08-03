import { Queue, Worker } from 'bullmq';
import { webSocketManager } from '..'; 
import { gameStatusObj } from '@repo/lib/status';
import { postGameCleanUp } from './redisUtils';
import 'dotenv/config';  // or require('dotenv').config();
import { gameRoom } from '@repo/lib/types';


export const chessTimersQueue = new Queue('chess-timers', {
  connection: {
    url: process.env.REDIS_URL,
  },
});

export async function schedulePlayerTimeout(roomId: string, userId: string, timeLeft: number) {
  await chessTimersQueue.remove(`timeout:${roomId}:${userId}`);

  await chessTimersQueue.add(
    'timeout',
    { roomId, userId },
    {
      delay: timeLeft * 1000,
      jobId: `timeout:${roomId}:${userId}`,
    }
  );
}

export async function clearPlayerTimeout(roomId: string, userId: string) {
  await chessTimersQueue.remove(`timeout:${roomId}:${userId}`);
}


const timeoutWorker = new Worker(
  'chess-timers',
  async (job) => {
    console.log('⏱️ Timeout job received:', job.data);

    let gameRoom = webSocketManager.gameRoom[job.data.roomId];

    // 🔹 If not found in memory, fetch from Redis Hash
    if (!gameRoom) {
      console.warn(`No game room found in memory for timeout: ${job.data.roomId}, checking Redis...`);

      const data = await webSocketManager.redisClient.hGetAll(`gameRoom:${job.data.roomId}`);
      
      if (Object.keys(data).length > 0) {
        gameRoom = data as unknown as gameRoom; // Already an object from HGETALL
        console.log(`Game room loaded from Redis (hash) for roomId: ${job.data.roomId}`);
      }
    }

    // 🔹 If still no gameRoom, skip this job
    if (!gameRoom) {
      console.warn(`No game room found anywhere for timeout: ${job.data.roomId}`);
      return;
    }

    const winner =
      gameRoom.whiteId === job.data.userId ? gameRoom.blackId : gameRoom.whiteId;

    const updateDBAboutGameOver = {
      id: job.data.roomId,
      winner,
      overType: gameStatusObj.TIMEOUT,
    };

    console.log('Game over due to timeout:', winner);
    console.log('Winner:', winner === gameRoom.whiteId ? 'White' : 'Black');

    clearPlayerTimeout(job.data.roomId, gameRoom.whiteId);
    clearPlayerTimeout(job.data.roomId, gameRoom.blackId);

    await postGameCleanUp(
      job.data.roomId,
      gameRoom.whiteId,
      gameRoom.blackId,
      updateDBAboutGameOver
    );

    delete webSocketManager.gameRoom[job.data.roomId];
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);

timeoutWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

timeoutWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

