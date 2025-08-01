import { createClient, RedisClientType } from 'redis';

class RedisSingleton {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClientType {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = createClient({
        url: process.env.REDIS_URL
      });

      RedisSingleton.instance.on('error', (err) => console.error('Redis Client Error', err));
      RedisSingleton.instance.connect().catch(console.error);
    }

    return RedisSingleton.instance;
  }
}

export default RedisSingleton;
