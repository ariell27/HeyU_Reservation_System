import express from 'express';
import cors from 'cors';
import bookingsRouter from './routes/bookings.js';
import servicesRouter from './routes/services.js';
import blockedDatesRouter from './routes/blockedDates.js';
import emailRouter from './routes/email.js';
import { initRedisClient, testRedisConnection } from './utils/redis.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HeyU backend service is running',
    endpoints: {
      health: '/health',
      bookings: '/api/bookings',
      services: '/api/services',
      blockedDates: '/api/blocked-dates',
      email: {
        check: '/api/email/check',
        test: '/api/email/test?email=your@email.com',
        sendConfirmation: 'POST /api/email/send-confirmation'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HeyU backend service is running' });
});

// API routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/blocked-dates', blockedDatesRouter);
app.use('/api/email', emailRouter);

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

// Initialize Redis connection on startup
(async () => {
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
})();

// Start server (only in local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 HeyU backend service started`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless functions
export default app;
