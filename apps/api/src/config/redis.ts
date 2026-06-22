import Redis from 'ioredis';
import { logger } from '@analytics/shared-utils';

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

if (redisUrl) {
  redis = new Redis(redisUrl);
  redis.on('connect', () => logger.info('Redis connected successfully'));
  redis.on('error', (err) => logger.error('Redis connection error:', err));
} else {
  logger.warn('REDIS_URL not provided. Running without Redis cache.');
}

export const getRedisClient = () => redis;

export const cacheSet = async (key: string, value: any, ttlSeconds: number = 60) => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.error(`Redis cacheSet error for key ${key}:`, err);
  }
};

export const cacheGet = async (key: string) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Redis cacheGet error for key ${key}:`, err);
    return null;
  }
};
