# HeyU 禾屿 - 美甲预约网站

一个功能完整的美甲店预约管理系统，包含客户预约流程和管理后台。

## 技术栈

### 前端

- **React** - 前端框架
- **React Router DOM** - 页面路由
- **Vite** - 构建工具
- **CSS Modules** - 样式管理

### 后端

- 待开发

## 项目结构

```
HeyU_Reservation_System/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/           # 可复用组件
│   │   │   ├── Header.jsx        # 导航头部
│   │   │   ├── Button.jsx        # 通用按钮
│   │   │   └── Calendar.jsx      # 日历组件
│   │   ├── pages/                # 页面组件
│   │   │   ├── LandingPage.jsx   # 首页
│   │   │   ├── BookingPage.jsx   # 服务选择页
│   │   │   ├── TimeSelectionPage.jsx  # 时间选择页
│   │   │   ├── CustomerInfoPage.jsx   # 客户信息确认页
│   │   │   ├── SuccessPage.jsx        # 预约成功页
│   │   │   └── AdminPage.jsx          # 管理后台
│   │   ├── data/                 # 数据文件
│   │   │   └── services.js       # 服务数据
│   │   ├── utils/                # 工具函数
│   │   │   └── emailService.js   # 邮件发送服务
│   │   ├── styles/               # 样式文件
│   │   │   └── global.css        # 全局样式
│   │   ├── App.jsx               # 主应用组件
│   │   └── main.jsx              # 入口文件
│   ├── public/                  # 静态资源
│   ├── index.html               # HTML 入口
│   ├── package.json             # 前端依赖配置
│   ├── vite.config.js           # Vite 配置
│   └── eslint.config.js         # ESLint 配置
├── backend/                    # 后端项目（待开发）
└── README.md                   # 项目说明文档
```

## 功能特性

### 客户预约流程

#### 1. 首页 (Landing Page)

- 品牌介绍和欢迎信息
- 中英文双语内容
- 优雅的视觉设计
- 响应式布局

#### 2. 服务选择页 (Booking Page)

- 手部美甲服务列表
- 按分类展示（本甲、延长、卸甲）
- 服务详情（时长、价格、描述）
- 中英文双语展示
- 卡片式布局

#### 3. 时间选择页 (TimeSelectionPage)

- 日历选择日期
- 时间段选择（9:00 AM - 6:00 PM，30 分钟间隔）
- 显示可用时间段
- 预约摘要预览
- 响应式设计，移动端底部固定栏

#### 4. 客户信息确认页 (CustomerInfoPage)

- 客户信息表单
  - 姓名（必填）
  - 电话号码（必填）
  - 邮箱地址（必填）
  - 微信号/微信名（可选）
- 表单验证
- 预约详情摘要
- 面包屑导航

#### 5. 预约成功页 (SuccessPage)

- 预约成功确认信息
- 预约详情展示
- 邮件确认提示

### 管理后台 (AdminPage)

#### 1. 服务管理

- 查看所有服务
- 添加新服务
- 编辑现有服务
- 删除服务
- 按分类组织展示

#### 2. 日期管理

- 日历选择日期
- 屏蔽整个日期
- 屏蔽特定时间段
- 查看已屏蔽日期和时间列表
- 取消屏蔽功能

#### 3. 预约管理

- 日历视图显示所有预约
- 按日期查看预约详情
- 显示客户信息（姓名、电话、邮箱、微信）
- 显示服务信息和价格
- 预约状态管理

## 设计特点

- **简洁现代**：大量留白，清晰的层次结构
- **优雅字体**：使用 Playfair Display 作为标题字体
- **柔和配色**：渐变背景（粉金色系），深色文字，金色作为强调色
- **统一风格**：所有页面共享相同的导航栏和设计语言
- **响应式设计**：完美适配桌面和移动设备
- **双语支持**：所有用户界面文本都提供中英文翻译

## 页面路由

- `/` - 首页
- `/booking` - 服务选择页
- `/booking/time` - 时间选择页
- `/booking/confirm` - 客户信息确认页
- `/booking/success` - 预约成功页
- `/admin` - 管理后台

## 开发

### 前端开发

#### 安装依赖

```bash
cd frontend
npm install
```

#### 启动开发服务器

```bash
cd frontend
npm run dev
```

#### 构建生产版本

```bash
cd frontend
npm run build
```

#### 预览生产构建

```bash
cd frontend
npm run preview
```

### 后端开发

后端项目待开发，将在 `backend/` 目录中实现。

## 主要组件说明

### Calendar 组件

可复用的日历组件，支持：

- 日期选择
- 屏蔽日期显示
- 预约数量显示（带徽章）
- 最小日期限制
- 自动禁用过去日期

### 数据管理

- 服务数据统一存储在 `frontend/src/data/services.js`
- 支持服务分类、价格、时长、描述等信息
- 支持附加服务标记

### 邮件服务

- 模拟邮件发送功能（开发环境）
- 支持完整的预约确认邮件模板
- 包含所有预约详情和客户信息

## 注意事项

- 当前版本使用前端状态管理，数据不会持久化
- 邮件发送功能在开发环境中为模拟实现
- 生产环境需要集成后端 API 或第三方邮件服务（如 EmailJS、SendGrid 等）
- 项目已分离为前端（`frontend/`）和后端（`backend/`）目录结构，便于后续开发
