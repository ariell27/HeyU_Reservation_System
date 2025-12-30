/**
 * Clear all booking data from Redis
 * Usage: node scripts/clear-bookings.js
 */

import { redis, REDIS_KEYS } from '../utils/redis.js';
import { initRedisClient } from '../utils/redis.js';

async function clearBookings() {
  try {
    console.log('🔄 Initializing Redis connection...');
    await initRedisClient();
    
    console.log('🗑️  Clearing booking data...');
    
    // Delete the bookings key
    await redis.del(REDIS_KEYS.BOOKINGS);
    
    console.log('✅ Successfully cleared all booking data from Redis');
    console.log(`   Key deleted: ${REDIS_KEYS.BOOKINGS}`);
    
    // Verify deletion
    const checkData = await redis.get(REDIS_KEYS.BOOKINGS);
    if (checkData === null) {
      console.log('✅ Verification: Booking data is now empty');
    } else {
      console.warn('⚠️  Warning: Data still exists after deletion');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear booking data:', error);
    process.exit(1);
  }
}

// Run the script
clearBookings();

