import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取所有服务
export function readServices() {
  try {
    ensureDataDir();
    if (!fs.existsSync(SERVICES_FILE)) {
      // 如果文件不存在，返回空数组
      return [];
    }
    const data = fs.readFileSync(SERVICES_FILE, 'utf8');
    const json = JSON.parse(data);
    return json.services || [];
  } catch (error) {
    console.error('读取服务数据失败:', error);
    return [];
  }
}

// 保存所有服务
export function saveServices(services) {
  try {
    ensureDataDir();
    const data = {
      services: services,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('保存服务数据失败:', error);
    throw error;
  }
}

// 根据ID获取服务
export function getServiceById(serviceId) {
  const services = readServices();
  return services.find(service => service.id === serviceId);
}

// 根据分类获取服务
export function getServicesByCategory(category) {
  const services = readServices();
  return services.filter(service => service.category === category);
}

