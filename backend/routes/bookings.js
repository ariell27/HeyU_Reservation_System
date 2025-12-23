import express from 'express';
import {
  readBookings,
  saveBookings,
  generateBookingId,
  validateBookingData
} from '../utils/bookingUtils.js';

const router = express.Router();

// POST /api/bookings - 创建新预订
router.post('/', (req, res) => {
  try {
    const bookingData = req.body;

    // 验证数据
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: validation.errors
      });
    }

    // 读取现有预订
    const bookings = readBookings();

    // 创建新预订对象
    // 确保日期格式为本地日期字符串（YYYY-MM-DD），避免时区问题
    let selectedDateStr = bookingData.selectedDate;
    
    // 如果是 Date 对象，转换为本地日期字符串
    if (selectedDateStr instanceof Date) {
      const year = selectedDateStr.getFullYear();
      const month = String(selectedDateStr.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDateStr.getDate()).padStart(2, '0');
      selectedDateStr = `${year}-${month}-${day}`;
    }
    // 如果是 ISO 字符串，提取日期部分
    else if (typeof selectedDateStr === 'string' && selectedDateStr.includes('T')) {
      selectedDateStr = selectedDateStr.split('T')[0];
    }
    // 如果已经是 YYYY-MM-DD 格式，直接使用
    // 否则保持原样（让验证函数处理）

    const newBooking = {
      bookingId: generateBookingId(),
      service: bookingData.service,
      selectedDate: selectedDateStr, // 存储为本地日期字符串
      selectedTime: bookingData.selectedTime,
      name: bookingData.name.trim(),
      wechatName: bookingData.wechatName.trim(),
      email: bookingData.email.trim(),
      phone: bookingData.phone.trim(),
      wechat: bookingData.wechat ? bookingData.wechat.trim() : '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // 添加到预订列表
    bookings.push(newBooking);

    // 保存到文件
    saveBookings(bookings);

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '预订创建成功',
      booking: newBooking
    });
  } catch (error) {
    console.error('创建预订失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法创建预订',
      error: error.message
    });
  }
});

// GET /api/bookings - 获取所有预订
router.get('/', (req, res) => {
  try {
    const { status, date } = req.query;
    let bookings = readBookings();

    // 按状态筛选
    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
    }

    // 按日期筛选
    if (date) {
      bookings = bookings.filter(booking => {
        // 如果 storedDate 是 ISO 字符串，提取日期部分；如果是 YYYY-MM-DD，直接使用
        const bookingDateStr = booking.selectedDate.includes('T')
          ? booking.selectedDate.split('T')[0]
          : booking.selectedDate;
        return bookingDateStr === date;
      });
    }

    // 按创建时间倒序排列（最新的在前）
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('获取预订列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取预订列表',
      error: error.message
    });
  }
});

// GET /api/bookings/:bookingId - 根据ID获取单个预订
router.get('/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookings = readBookings();
    const booking = bookings.find(b => b.bookingId === bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的预订'
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error('获取预订详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取预订详情',
      error: error.message
    });
  }
});

export default router;

