import express from 'express';
import {
  readServices,
  saveServices,
  getServiceById,
  getServicesByCategory
} from '../utils/serviceUtils.js';

const router = express.Router();

// GET /api/services - 获取所有服务
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let services = readServices();

    // 按分类筛选
    if (category) {
      services = getServicesByCategory(category);
    }

    res.json({
      success: true,
      count: services.length,
      services: services
    });
  } catch (error) {
    console.error('获取服务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取服务列表',
      error: error.message
    });
  }
});

// GET /api/services/:serviceId - 根据ID获取单个服务
router.get('/:serviceId', (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = getServiceById(parseInt(serviceId));

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的服务'
      });
    }

    res.json({
      success: true,
      service: service
    });
  } catch (error) {
    console.error('获取服务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取服务详情',
      error: error.message
    });
  }
});

// POST /api/services - 创建或更新服务（管理功能）
router.post('/', (req, res) => {
  try {
    const serviceData = req.body;
    const services = readServices();

    // 如果提供了ID，则更新现有服务
    if (serviceData.id) {
      const index = services.findIndex(s => s.id === serviceData.id);
      if (index !== -1) {
        services[index] = { ...services[index], ...serviceData };
        saveServices(services);
        return res.json({
          success: true,
          message: '服务更新成功',
          service: services[index]
        });
      }
    }

    // 创建新服务（自动生成ID）
    const newId = services.length > 0 
      ? Math.max(...services.map(s => s.id)) + 1 
      : 1;
    
    const newService = {
      id: newId,
      ...serviceData
    };

    services.push(newService);
    saveServices(services);

    res.status(201).json({
      success: true,
      message: '服务创建成功',
      service: newService
    });
  } catch (error) {
    console.error('创建/更新服务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法创建/更新服务',
      error: error.message
    });
  }
});

export default router;

