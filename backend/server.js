import express from 'express';
import cors from 'cors';
import bookingsRouter from './routes/bookings.js';
import servicesRouter from './routes/services.js';
import blockedDatesRouter from './routes/blockedDates.js';
import { initRedisClient, testRedisConnection } from './utils/redis.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HeyU backend service is running' });
});

// API routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/blocked-dates', blockedDatesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 HeyU backend service started`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  
  // Initialize Redis connection
  try {
    await initRedisClient();
    // Test Redis connection
    const redisConnected = await testRedisConnection();
    if (redisConnected) {
      console.log(`💾 Data storage: Redis`);
    } else {
      console.warn(`⚠️  Redis connection test failed, please check environment variables`);
    }
  } catch (error) {
    console.warn(`⚠️  Redis initialization failed:`, error.message);
    console.warn(`⚠️  Please check environment variables`);
  }
});
