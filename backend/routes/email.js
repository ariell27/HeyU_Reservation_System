import express from 'express';
import { sendConfirmationEmail } from '../utils/emailUtils.js';
import { readBookings } from '../utils/bookingUtils.js';

const router = express.Router();

// GET /api/email/test - Test email configuration
router.get('/test', async (req, res) => {
  try {
    const testEmail = req.query.email || process.env.SMTP_USER;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address as query parameter: /api/email/test?email=your@email.com'
      });
    }

    console.log('🧪 Testing email configuration...');
    
    // Check environment variables
    const config = {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ Missing',
      SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || 'Not set',
    };

    // Try to send test email
    const testBookingData = {
      bookingId: 'TEST-' + Date.now(),
      email: testEmail,
      name: 'Test User',
      wechatName: 'Test WeChat',
      phone: '1234567890',
      service: {
        nameCn: '测试服务',
        nameEn: 'Test Service',
        duration: '2 hours',
        price: '$50'
      },
      selectedDate: new Date().toISOString().split('T')[0],
      selectedTime: '10:00'
    };

    const result = await sendConfirmationEmail(testBookingData);

    res.json({
      success: result.success,
      message: result.success 
        ? 'Test email sent successfully! Check your inbox (and spam folder).' 
        : 'Failed to send test email',
      config: config,
      result: result,
      testEmail: testEmail
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

// POST /api/email/send-confirmation - Send confirmation email manually
router.post('/send-confirmation', async (req, res) => {
  try {
    const { bookingId, bookingData } = req.body;

    let booking = bookingData;

    // If bookingId is provided, fetch booking from database
    if (bookingId && !bookingData) {
      const bookings = await readBookings();
      booking = bookings.find(b => b.bookingId === bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Booking data or bookingId is required'
      });
    }

    // Send email
    const result = await sendConfirmationEmail(booking);

    if (result.success) {
      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error || result.message
      });
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to send email',
      error: error.message
    });
  }
});

export default router;

