// Vercel serverless function - Email test
import { sendConfirmationEmail } from '../../utils/emailUtils.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('=== EMAIL TEST STARTED ===');
    console.log('Request received at:', new Date().toISOString());

    const testEmail = req.query.email || process.env.SMTP_USER;

    console.log('Test email address:', testEmail);
    console.log('Environment check:', {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
    });

    if (!testEmail) {
      console.log('ERROR: No email provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide email address as query parameter: /api/email/test?email=your@email.com'
      });
    }

    console.log('🧪 Testing email configuration...');

    const config = {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ Missing',
      SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || 'Not set',
    };

    console.log('Configuration:', config);

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

    console.log('Calling sendConfirmationEmail...');
    const result = await sendConfirmationEmail(testBookingData);
    console.log('Email send result:', JSON.stringify(result, null, 2));

    console.log('=== EMAIL TEST COMPLETED ===');

    return res.json({
      success: result.success,
      message: result.success
        ? 'Test email sent successfully! Check your inbox (and spam folder).'
        : 'Failed to send test email',
      config: config,
      result: result,
      testEmail: testEmail
    });
  } catch (error) {
    console.error('=== EMAIL TEST ERROR ===');
    console.error('Test email failed:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
}

