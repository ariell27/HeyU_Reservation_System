import express from 'express';
import cors from 'cors';
import bookingsRouter from './routes/bookings.js';
import servicesRouter from './routes/services.js';
import blockedDatesRouter from './routes/blockedDates.js';
import timeSlotsRouter from './routes/timeSlots.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HeyU 后端服务运行正常' });
});

// API 路由
app.use('/api/bookings', bookingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/blocked-dates', blockedDatesRouter);
app.use('/api/time-slots', timeSlotsRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '内部服务器错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 HeyU 后端服务已启动`);
  console.log(`📡 服务器运行在 http://localhost:${PORT}`);
  console.log(`💾 预订数据存储: backend/data/bookings.json`);
  console.log(`📋 服务数据存储: backend/data/services.json`);
  console.log(`🚫 屏蔽日期存储: backend/data/blockedDates.json`);
});

