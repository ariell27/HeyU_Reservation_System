// Vercel serverless function - Clear all booking data
import { redis, REDIS_KEYS } from '../utils/redis.js';
import { initRedisClient } from '../utils/redis.js';

let redisInitialized = false;

async function initializeRedis() {
  if (!redisInitialized) {
    try {
      await initRedisClient();
      redisInitialized = true;
      console.log('✅ Clear Bookings API: Redis initialized.');
    } catch (error) {
      console.error('❌ Clear Bookings API: Redis initialization failed:', error.message);
    }
  }
}

export default async function handler(req, res) {
  await initializeRedis();

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST or DELETE methods for security
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST or DELETE.'
    });
  }

  try {
    console.log('🗑️  Clear Bookings API: Request received to clear all booking data.');

    // Delete the bookings key
    await redis.del(REDIS_KEYS.BOOKINGS);
    
    console.log(`✅ Successfully cleared all booking data. Key deleted: ${REDIS_KEYS.BOOKINGS}`);

    // Verify deletion
    const checkData = await redis.get(REDIS_KEYS.BOOKINGS);
    const isCleared = checkData === null;

    return res.status(200).json({
      success: true,
      message: 'All booking data has been cleared successfully.',
      key: REDIS_KEYS.BOOKINGS,
      verified: isCleared,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to clear booking data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during data clearing',
      error: error.message
    });
  }
}

