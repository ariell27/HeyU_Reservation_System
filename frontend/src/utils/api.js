/**
 * API 服务工具
 * 统一管理所有后端 API 调用
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 获取所有服务
 * @param {string} category - 可选，按分类筛选
 * @returns {Promise<Array>} 服务列表
 */
export async function getServices(category = null) {
  try {
    const url = category 
      ? `${API_URL}/api/services?category=${encodeURIComponent(category)}`
      : `${API_URL}/api/services`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`获取服务失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.services || [];
  } catch (error) {
    console.error('获取服务列表失败:', error);
    throw error;
  }
}

/**
 * 根据ID获取单个服务
 * @param {number} serviceId - 服务ID
 * @returns {Promise<Object>} 服务对象
 */
export async function getServiceById(serviceId) {
  try {
    const response = await fetch(`${API_URL}/api/services/${serviceId}`);
    
    if (!response.ok) {
      throw new Error(`获取服务失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('获取服务详情失败:', error);
    throw error;
  }
}

/**
 * 创建或更新服务
 * @param {Object} serviceData - 服务数据
 * @returns {Promise<Object>} 保存的服务对象
 */
export async function saveService(serviceData) {
  try {
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '保存服务失败');
    }
    
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('保存服务失败:', error);
    throw error;
  }
}

/**
 * 创建预订
 * @param {Object} bookingData - 预订数据
 * @returns {Promise<Object>} 创建的预订对象
 */
export async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '创建预订失败');
    }
    
    const data = await response.json();
    return data.booking;
  } catch (error) {
    console.error('创建预订失败:', error);
    throw error;
  }
}

/**
 * 获取所有预订
 * @param {Object} filters - 筛选条件 { status, date }
 * @returns {Promise<Array>} 预订列表
 */
export async function getBookings(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const url = `${API_URL}/api/bookings${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`获取预订列表失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.bookings || [];
  } catch (error) {
    console.error('获取预订列表失败:', error);
    throw error;
  }
}

/**
 * 根据ID获取单个预订
 * @param {string} bookingId - 预订ID
 * @returns {Promise<Object>} 预订对象
 */
export async function getBookingById(bookingId) {
  try {
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}`);
    
    if (!response.ok) {
      throw new Error(`获取预订失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.booking;
  } catch (error) {
    console.error('获取预订详情失败:', error);
    throw error;
  }
}

