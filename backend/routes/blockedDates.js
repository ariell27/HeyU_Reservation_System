import express from 'express';
import {
  readBlockedDates,
  saveBlockedDates,
  validateBlockedDate
} from '../utils/blockedDatesUtils.js';

const router = express.Router();

// GET /api/blocked-dates - 获取所有被屏蔽的日期
router.get('/', (req, res) => {
  try {
    const blockedDates = readBlockedDates();
    res.json({
      success: true,
      count: blockedDates.length,
      blockedDates: blockedDates
    });
  } catch (error) {
    console.error('获取屏蔽日期列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取屏蔽日期列表',
      error: error.message
    });
  }
});

// POST /api/blocked-dates - 创建或更新被屏蔽的日期
router.post('/', (req, res) => {
  try {
    const blockedDateData = req.body;

    // 验证数据
    const validation = validateBlockedDate(blockedDateData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: validation.errors
      });
    }

    const blockedDates = readBlockedDates();
    
    // 查找是否已存在该日期
    const existingIndex = blockedDates.findIndex(b => b.date === blockedDateData.date);
    
    if (existingIndex !== -1) {
      // 更新现有记录
      blockedDates[existingIndex] = {
        date: blockedDateData.date,
        times: blockedDateData.times || []
      };
    } else {
      // 添加新记录
      blockedDates.push({
        date: blockedDateData.date,
        times: blockedDateData.times || []
      });
    }

    saveBlockedDates(blockedDates);

    res.json({
      success: true,
      message: '屏蔽日期保存成功',
      blockedDate: existingIndex !== -1 ? blockedDates[existingIndex] : blockedDates[blockedDates.length - 1]
    });
  } catch (error) {
    console.error('保存屏蔽日期失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法保存屏蔽日期',
      error: error.message
    });
  }
});

// DELETE /api/blocked-dates/:date - 删除整个日期的屏蔽
router.delete('/:date', (req, res) => {
  try {
    const { date } = req.params;
    const blockedDates = readBlockedDates();
    
    const filteredDates = blockedDates.filter(b => b.date !== date);
    
    if (filteredDates.length === blockedDates.length) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的屏蔽日期'
      });
    }

    saveBlockedDates(filteredDates);

    res.json({
      success: true,
      message: '屏蔽日期删除成功'
    });
  } catch (error) {
    console.error('删除屏蔽日期失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法删除屏蔽日期',
      error: error.message
    });
  }
});

// DELETE /api/blocked-dates/:date/times/:time - 删除特定时间段的屏蔽
router.delete('/:date/times/:time', (req, res) => {
  try {
    const { date, time } = req.params;
    const blockedDates = readBlockedDates();
    
    const blockedDate = blockedDates.find(b => b.date === date);
    
    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的屏蔽日期'
      });
    }

    const filteredTimes = blockedDate.times.filter(t => t !== time);
    
    // 如果没有时间段了，删除整个日期记录
    if (filteredTimes.length === 0) {
      const filteredDates = blockedDates.filter(b => b.date !== date);
      saveBlockedDates(filteredDates);
    } else {
      blockedDate.times = filteredTimes;
      saveBlockedDates(blockedDates);
    }

    res.json({
      success: true,
      message: '时间段屏蔽删除成功'
    });
  } catch (error) {
    console.error('删除时间段屏蔽失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法删除时间段屏蔽',
      error: error.message
    });
  }
});

export default router;

