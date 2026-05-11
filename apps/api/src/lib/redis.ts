import { Redis } from 'ioredis';
import { logger } from './logger.js';

let client: Redis | null | undefined;

/** Returns a shared Redis client when `REDIS_URL` is set; otherwise `null`. */
export function getRedis(): Redis | null {
  if (client === undefined) {
    const url = process.env.REDIS_URL;
    if (!url) {
      client = null;
    } else {
      try {
        client = new Redis(url, { maxRetriesPerRequest: 1 });
      } catch (err) {
        logger.warn({ err }, 'Redis init failed');
        client = null;
      }
    }
  }
  return client;
}
