/**
 * 邮件发送服务
 * 在实际项目中，这应该调用后端API或第三方邮件服务（如EmailJS、SendGrid等）
 */

/**
 * 发送确认邮件
 * @param {Object} bookingData - 预约数据
 * @returns {Promise<boolean>} 是否发送成功
 */
export const sendConfirmationEmail = async (bookingData) => {
  try {
    // 方案1: 调用后端API（推荐用于生产环境）
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: bookingData.email,
        phone: bookingData.phone,
        service: bookingData.service,
        date: bookingData.selectedDate,
        time: bookingData.selectedTime,
        staff: bookingData.selectedStaff,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('邮件发送失败:', await response.text());
      return false;
    }
  } catch (error) {
    // 方案2: 如果后端API不可用，可以使用EmailJS等第三方服务
    // 这里提供一个使用EmailJS的示例（需要先安装 @emailjs/browser）
    /*
    import emailjs from '@emailjs/browser';
    
    const templateParams = {
      to_email: bookingData.email,
      to_phone: bookingData.phone,
      service_name: `${bookingData.service.nameCn} | ${bookingData.service.nameEn}`,
      date: formatDate(bookingData.selectedDate),
      time: formatTime(bookingData.selectedTime),
      staff_name: bookingData.selectedStaff.name,
      price: bookingData.service.price,
    };

    try {
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        templateParams,
        'YOUR_PUBLIC_KEY'
      );
      return true;
    } catch (error) {
      console.error('EmailJS发送失败:', error);
      return false;
    }
    */

    // 开发环境：模拟邮件发送
    console.log('模拟发送确认邮件:', {
      to: bookingData.email,
      subject: 'HeyU禾屿 - 预约确认',
      htmlContent: generateEmailContent(bookingData),
    });

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 在开发环境中，我们假设总是成功
    return true;
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

