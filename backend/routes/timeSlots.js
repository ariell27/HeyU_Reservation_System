import express from 'express';
import { generateAvailableTimeSlots, generateDefaultTimeSlots } from '../utils/timeSlotUtils.js';

const router = express.Router();

/**
 * GET /api/time-slots/available
 * 获取指定日期和服务的可用时间槽
 * Query params:
 *   - date: 日期字符串 (YYYY-MM-DD)
 *   - serviceId: 服务ID（可选，如果提供会考虑服务时长）
 * Body (可选):
 *   - service: 服务对象（包含 duration 字段）
 */
router.get('/available', (req, res) => {
  try {
    const { date, serviceId } = req.query;
    const service = req.body?.service;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '日期参数是必填的'
      });
    }

    // 如果没有提供服务信息，返回默认时间槽
    if (!service && !serviceId) {
      const defaultSlots = generateDefaultTimeSlots(date);
      return res.json({
        success: true,
        date: date,
        timeSlots: defaultSlots
      });
    }

    // TODO: 如果只有 serviceId，需要从 services 中获取服务信息
    // 目前需要前端传递完整的 service 对象
    if (!service) {
      return res.status(400).json({
        success: false,
        message: '服务信息是必填的（需要包含 duration 字段）'
      });
    }

    const timeSlots = generateAvailableTimeSlots(date, service);

    res.json({
      success: true,
      date: date,
      service: service,
      timeSlots: timeSlots
    });
  } catch (error) {
    console.error('获取可用时间槽失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取可用时间槽',
      error: error.message
    });
  }
});

/**
 * POST /api/time-slots/available
 * 获取指定日期和服务的可用时间槽（通过 POST 传递服务信息）
 * Body:
 *   - date: 日期字符串 (YYYY-MM-DD)
 *   - service: 服务对象（包含 duration 字段）
 */
router.post('/available', (req, res) => {
  try {
    const { date, service } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '日期是必填的'
      });
    }

    if (!service) {
      return res.status(400).json({
        success: false,
        message: '服务信息是必填的（需要包含 duration 字段）'
      });
    }

    const timeSlots = generateAvailableTimeSlots(date, service);

    res.json({
      success: true,
      date: date,
      service: service,
      timeSlots: timeSlots
    });
  } catch (error) {
    console.error('获取可用时间槽失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取可用时间槽',
      error: error.message
    });
  }
});

/**
 * GET /api/time-slots/default
 * 获取指定日期的默认时间槽（不考虑预订和 block）
 * Query params:
 *   - date: 日期字符串 (YYYY-MM-DD)
 */
router.get('/default', (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '日期参数是必填的'
      });
    }

    const defaultSlots = generateDefaultTimeSlots(date);

    res.json({
      success: true,
      date: date,
      timeSlots: defaultSlots
    });
  } catch (error) {
    console.error('获取默认时间槽失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取默认时间槽',
      error: error.message
    });
  }
});

export default router;

