import { createClient } from "redis";

const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

export const pushToRedis = (key: string, value: string) => {
  client.HGET('Kushal', "moves")
};