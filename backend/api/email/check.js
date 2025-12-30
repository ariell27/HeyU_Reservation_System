// Vercel serverless function - Email check
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

  const config = {
    SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
    SMTP_PASS: process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
    SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || 'NOT SET',
    SMTP_SERVICE: process.env.SMTP_SERVICE || 'NOT SET',
  };

  const isConfigured = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  return res.json({
    success: true,
    message: 'Email configuration status',
    configured: isConfigured,
    config: config
  });
}

