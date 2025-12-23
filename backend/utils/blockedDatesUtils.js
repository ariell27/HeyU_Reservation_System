import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const BLOCKED_DATES_FILE = path.join(DATA_DIR, 'blockedDates.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 初始化 blockedDates.json 文件
function initializeBlockedDatesFile() {
  ensureDataDir();
  if (!fs.existsSync(BLOCKED_DATES_FILE)) {
    fs.writeFileSync(BLOCKED_DATES_FILE, JSON.stringify({ blockedDates: [] }, null, 2));
  }
}

// 读取所有被屏蔽的日期
export function readBlockedDates() {
  try {
    initializeBlockedDatesFile();
    const data = fs.readFileSync(BLOCKED_DATES_FILE, 'utf8');
    const json = JSON.parse(data);
    return json.blockedDates || [];
  } catch (error) {
    console.error('读取屏蔽日期数据失败:', error);
    return [];
  }
}

// 保存所有被屏蔽的日期
export function saveBlockedDates(blockedDates) {
  try {
    ensureDataDir();
    const data = {
      blockedDates: blockedDates,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(BLOCKED_DATES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('保存屏蔽日期数据失败:', error);
    throw error;
  }
}

// 验证屏蔽日期数据
export function validateBlockedDate(blockedDate) {
  const errors = [];

  if (!blockedDate.date || typeof blockedDate.date !== 'string') {
    errors.push('日期是必填的且必须是字符串格式');
  } else {
    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(blockedDate.date)) {
      errors.push('日期格式无效，应为 YYYY-MM-DD');
    }
  }

  if (!Array.isArray(blockedDate.times)) {
    errors.push('时间段必须是数组格式');
  } else {
    // 验证时间段格式 (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidTimes = blockedDate.times.filter(time => !timeRegex.test(time));
    if (invalidTimes.length > 0) {
      errors.push(`时间段格式无效: ${invalidTimes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

