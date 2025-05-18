import { Queue } from 'bullmq';
import { webSocketManager } from '..'; 

export const chessTimersQueue = new Queue('chess-timers', {
  connection: {
    url: process.env.REDIS_URL, // works perfectly
  },
});

export async function schedulePlayerTimeout(roomId: string, userId: string, timeLeft: number) {
    await chessTimersQueue.remove(`timeout:${roomId}:${userId}`); // Remove previous timeout job
  
    await chessTimersQueue.add(
      'timeout',
      { roomId, userId },
      {
        delay: timeLeft * 1000,
        jobId: `timeout:${roomId}:${userId}`, // Unique job per player
      }
    );
  }

  
  export async function clearPlayerTimeout(roomId: string, userId: string) {
    await chessTimersQueue.remove(`timeout:${roomId}:${userId}`);
  }
  
// workers/timeoutWorker.ts
import { Worker } from 'bullmq';

const timeoutWorker = new Worker(
  'chess-timers', // queue name
  async (job) => {
    console.log('⏱️ Timeout job received:', job.data);

    // You can later add logic here to handle game timeout:
    // - Declare winner
    // - Update DB
    // - Notify clients
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
