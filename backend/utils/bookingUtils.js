import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 初始化 bookings.json 文件
function initializeBookingsFile() {
  ensureDataDir();
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify({ bookings: [] }, null, 2));
  }
}

// 读取所有预订
export function readBookings() {
  try {
    initializeBookingsFile();
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    const json = JSON.parse(data);
    return json.bookings || [];
  } catch (error) {
    console.error('读取预订数据失败:', error);
    return [];
  }
}

// 保存所有预订
export function saveBookings(bookings) {
  try {
    ensureDataDir();
    const data = {
      bookings: bookings,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('保存预订数据失败:', error);
    throw error;
  }
}

// 生成唯一的预订ID
export function generateBookingId() {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

// 验证预订数据
export function validateBookingData(bookingData) {
  const errors = [];

  if (!bookingData.service || !bookingData.service.id) {
    errors.push('服务信息是必填的');
  }

  if (!bookingData.selectedDate) {
    errors.push('日期是必填的');
  }

  if (!bookingData.selectedTime) {
    errors.push('时间是必填的');
  }

  if (!bookingData.name || !bookingData.name.trim()) {
    errors.push('姓名是必填的');
  }

  if (!bookingData.wechatName || !bookingData.wechatName.trim()) {
    errors.push('微信名是必填的');
  }

  if (!bookingData.email || !bookingData.email.trim()) {
    errors.push('邮箱地址是必填的');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      errors.push('邮箱地址格式无效');
    }
  }

  if (!bookingData.phone || !bookingData.phone.trim()) {
    errors.push('电话号码是必填的');
  } else {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = bookingData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(bookingData.phone) || digitsOnly.length < 8) {
      errors.push('电话号码格式无效');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

