// Support two Redis clients:
// 1. Vercel KV - Uses @vercel/kv (Vercel's wrapper for Upstash), deeply integrated with Vercel platform
//    When you add Upstash Redis in Vercel Storage, Vercel automatically sets KV_URL and other environment variables
// 2. Upstash Redis - Uses @upstash/redis, more flexible, can be used anywhere
//    Requires manual setup of UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

import { kv } from '@vercel/kv';

let redisClient = null;
let clientType = null;

// Initialize Redis client
async function initRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    // Prefer Upstash Redis (if UPSTASH_REDIS_REST_URL is configured)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        // Try to use @upstash/redis
        const { Redis } = await import('@upstash/redis');
        redisClient = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        clientType = 'upstash';
        console.log('✅ Redis connection initialized (Upstash Redis)');
        return redisClient;
      } catch (importError) {
        // If @upstash/redis is not installed, fall back to Vercel KV
        console.warn('⚠️  @upstash/redis not installed, using Vercel KV');
        return initVercelKV();
      }
    }
    // Use Vercel KV (if KV_URL or KV_REST_API_URL is configured)
    else if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      return initVercelKV();
    } else {
      throw new Error('Redis configuration not found. Please set one of the following environment variables:\n' +
        '1. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (use Upstash Redis)\n' +
        '2. KV_URL or KV_REST_API_URL (use Vercel KV, automatically set by Vercel)');
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
}

// Initialize Vercel KV
function initVercelKV() {
  try {
    redisClient = kv;
    clientType = 'vercel';
    console.log('✅ Redis connection initialized (Vercel KV)');
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to load @vercel/kv, please ensure it is installed: npm install @vercel/kv');
    throw error;
  }
}

// Get Redis client (synchronous interface, needs to be initialized before first use)
export function getRedisClient() {
  if (!redisClient) {
    // If using Vercel KV, can return directly (it's already initialized)
    if (process.env.KV_URL || process.env.KV_REST_API_URL) {
      return initVercelKV();
    }
    throw new Error('Redis client not initialized. Please call await initRedisClient() first');
  }
  return redisClient;
}

// Get Redis client asynchronously (recommended, automatically initializes)
export async function getRedisClientAsync() {
  return await initRedisClient();
}

// Test Redis connection
export async function testRedisConnection() {
  try {
    const client = await getRedisClientAsync();
    // Try to set and get a test value to verify connection
    const testKey = 'heyu:test:connection';
    
    await client.set(testKey, 'test', { ex: 1 }); // Both clients support the same syntax
    const testValue = await client.get(testKey);
    
    if (testValue === 'test') {
      console.log(`✅ Redis connection test successful (${clientType || 'unknown'})`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Redis connection test failed:', error.message);
    return false;
  }
}

// Redis key prefix constants
export const REDIS_KEYS = {
  BOOKINGS: 'heyu:bookings',
  SERVICES: 'heyu:services',
  BLOCKED_DATES: 'heyu:blocked_dates'
};

// Default export synchronous version (backward compatible)
export default getRedisClient;

// Export initialization function, can be called when server starts
export { initRedisClient };
