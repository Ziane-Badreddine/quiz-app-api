/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createClient, type RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url:
    process.env.NODE_ENV === 'production'
      ? process.env.REDIS_URL
      : 'rediss://default:AZ6wAAIncDI2ZTUzMjQ4OWQ5MjA0YjBkOWQ3NjhkZjIyMDM4MDMyMHAyNDA2MjQ@dear-bluebird-40624.upstash.io:6379',
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`🔁 Redis retry #${retries}`);
      return Math.min(retries * 500, 5000); // retry progressif
    },
    connectTimeout: 10000,
  },
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});
