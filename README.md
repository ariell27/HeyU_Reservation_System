# HeyU禾屿 - 美甲预约网站

一个简洁优雅的美甲店预约网站，包含品牌介绍页面和手部美甲服务展示页面。

## 技术栈

- **React** - 前端框架
- **React Router** - 页面路由
- **Vite** - 构建工具
- **CSS Modules** - 样式管理

## 项目结构

```
HeyU/
├── src/
│   ├── components/        # 可复用组件
│   │   ├── Header.jsx     # 导航头部
│   │   └── Button.jsx     # 通用按钮
│   ├── pages/             # 页面组件
│   │   ├── LandingPage.jsx    # 首页
│   │   └── BookingPage.jsx    # 预约页
│   ├── styles/            # 样式文件
│   │   └── global.css     # 全局样式
│   ├── App.jsx            # 主应用组件
│   └── main.jsx           # 入口文件
└── index.html
```

## 功能特性

### 首页 (Landing Page)
- 品牌介绍和欢迎信息
- 中英文双语内容
- 优雅的视觉设计
- 响应式布局

### 预约页 (Booking Page)
- 手部美甲服务列表
- 服务详情（时长、价格、描述）
- 中英文双语展示
- 卡片式布局

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 设计特点

- **简洁现代**：大量留白，清晰的层次结构
- **优雅字体**：使用 Playfair Display 作为标题字体
- **柔和配色**：浅色背景，深色文字，粉色作为强调色
- **统一风格**：两个页面共享相同的导航栏和设计语言
- **响应式设计**：适配桌面和移动设备

## 页面路由

- `/` - 首页
- `/booking` - 预约页
