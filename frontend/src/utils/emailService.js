/**
 * Email service
 * Sends confirmation emails via backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Debug: Log API URL
if (typeof window !== 'undefined') {
  console.log('📧 Email Service API_URL:', API_URL);
}

/**
 * Send confirmation email
 * @param {Object} bookingData - Booking data
 * @returns {Promise<boolean>} Whether email was sent successfully
 */
export const sendConfirmationEmail = async (bookingData) => {
  console.log('📧 sendConfirmationEmail called with:', {
    email: bookingData.email,
    bookingId: bookingData.bookingId,
    API_URL: API_URL
  });

  try {
    const url = `${API_URL}/api/email/send-confirmation`;
    console.log('📧 Calling email API:', url);
    
    // Call backend API to send email
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingData: bookingData,
      }),
    });

    console.log('📧 Email API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email sent successfully:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ Failed to send email:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      // Don't throw error, just log it - email failure shouldn't block booking
      return false;
    }
  } catch (error) {
    // If backend API is not available, just log and return false
    // Email sending is handled by backend automatically when booking is created
    console.error('❌ Email service error:', {
      message: error.message,
      stack: error.stack,
      API_URL: API_URL
    });
    return false;
  }
};

/**
 * 生成邮件内容
 * @param {Object} bookingData - 预约数据
 * @returns {string} 邮件HTML内容
 */
    const generateEmailContent = (bookingData) => {
      const { service, selectedDate, selectedTime, selectedStaff, name, email, phone, wechat } = bookingData;
  
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2c2c2c; }
        .content { background-color: #f8f8f8; padding: 20px; border-radius: 8px; }
        .detail-item { margin-bottom: 15px; }
        .label { font-weight: bold; color: #666; }
        .value { color: #2c2c2c; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HeyU禾屿</div>
        </div>
        <div class="content">
          <h2>预约确认</h2>
          <p>感谢您选择HeyU禾屿！您的预约已成功确认。</p>
          
          <div class="detail-item">
            <span class="label">服务：</span>
            <span class="value">${service.nameCn} | ${service.nameEn}</span>
          </div>
          <div class="detail-item">
            <span class="label">员工：</span>
            <span class="value">${selectedStaff.name}</span>
          </div>
          <div class="detail-item">
            <span class="label">日期：</span>
            <span class="value">${formatDate(selectedDate)}</span>
          </div>
          <div class="detail-item">
            <span class="label">时间：</span>
            <span class="value">${formatTime(selectedTime)}</span>
          </div>
          <div class="detail-item">
            <span class="label">时长：</span>
            <span class="value">${service.duration}</span>
          </div>
          <div class="detail-item">
            <span class="label">价格：</span>
            <span class="value">${service.price}</span>
          </div>
          <div class="detail-item">
            <span class="label">姓名：</span>
            <span class="value">${name || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="label">电话：</span>
            <span class="value">${phone}</span>
          </div>
          <div class="detail-item">
            <span class="label">邮箱：</span>
            <span class="value">${email}</span>
          </div>
          ${wechat ? `<div class="detail-item">
            <span class="label">微信：</span>
            <span class="value">${wechat}</span>
          </div>` : ''}
          
          <p style="margin-top: 20px;">
            我们会在预约前24小时通过电话或邮件与您确认。<br>
            如有任何问题，请随时联系我们。
          </p>
        </div>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿回复。</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

