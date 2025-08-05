# AI情感支持聊天系统 - 项目指南

## 项目概述

这是一个基于AI的情感支持聊天系统，通过深度对话分析帮助用户：
- 识别和理解自己的情绪状态
- 发现思维中的偏见和盲点
- 形成更客观、全面的观念
- 通过3D可视化展示思维的三个层次：事实层、洞见层、观念层

## 技术架构

### 前端
- **框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **UI组件**: Radix UI + Tailwind CSS
- **3D可视化**: Three.js + React Three Fiber
- **状态管理**: 自定义hooks + Context API

### 后端
- **框架**: Express.js + Node.js
- **语言**: TypeScript
- **数据库**: MongoDB + Mongoose
- **AI服务**: OpenAI API (GPT-4)
- **认证**: JWT
- **文件处理**: Multer

## 快速开始

### 环境要求
- Node.js 18+
- MongoDB 6+
- AI API Key (可选 - OpenRouter/OpenAI，或使用免费Mock模式)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-emotional-support-chat
```

2. **安装前端依赖**
```bash
npm install
```

3. **安装后端依赖**
```bash
cd backend
npm install
cd ..
```

4. **配置环境变量**

创建前端环境文件 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_MOCK_API=false
```

创建后端环境文件 `backend/.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-emotional-support
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
```

5. **启动MongoDB**
```bash
# 使用Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# 或使用本地MongoDB
mongod
```

6. **启动后端服务**
```bash
cd backend
npm run dev
```

7. **启动前端服务**
```bash
# 在新终端窗口
npm run dev
```

访问 http://localhost:3000 即可使用系统。

## Docker部署

1. **使用Docker Compose一键部署**
```bash
# 设置环境变量
export OPENAI_API_KEY=your_openai_api_key
export JWT_SECRET=your_jwt_secret

# 启动所有服务
docker-compose up -d
```

2. **单独构建镜像**
```bash
# 构建后端
cd backend
docker build -t ai-emotional-support-backend .

# 构建前端
cd ..
docker build -t ai-emotional-support-frontend .
```

## 核心功能

### 1. 智能对话分析
- 自动识别用户情绪状态
- 提取对话中的客观事实
- 发现潜在的洞察和模式
- 识别深层的观念和信念

### 2. 三层可视化系统
- **事实层（蓝色）**: 用户陈述的客观事实
- **洞见层（金色）**: 从事实中得出的新认识
- **观念层（红色）**: 形成的深层信念和价值观

### 3. 动态3D模型
- 根据对话内容生成独特的生物体模型
- 反映对话的复杂度、连贯性和演化程度
- 实时更新和动画效果

### 4. 数据管理
- 多会话支持
- 导入/导出功能
- 本地和云端存储
- 用户认证（可选）

## API接口文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 会话管理
- `POST /api/sessions` - 创建新会话
- `GET /api/sessions` - 获取会话列表
- `GET /api/sessions/:id` - 获取会话详情
- `PUT /api/sessions/:id` - 更新会话
- `DELETE /api/sessions/:id` - 删除会话

### 聊天功能
- `POST /api/chat/message` - 发送消息
- `POST /api/chat/analyze-image` - 分析图片

### 分析功能
- `POST /api/analysis/conversation/:sessionId` - 分析整个对话
- `GET /api/analysis/layers/:sessionId` - 获取层级数据
- `GET /api/analysis/model/:sessionId` - 获取3D模型数据

## 开发指南

### 目录结构
```
ai-emotional-support-chat/
├── app/                    # Next.js应用目录
├── components/            # React组件
│   ├── chat/             # 聊天相关组件
│   ├── 3d-visualization/ # 3D可视化组件
│   ├── layout/           # 布局组件
│   └── ui/               # UI基础组件
├── hooks/                 # 自定义React hooks
├── lib/                   # 工具库
│   ├── ai/               # AI服务
│   ├── api/              # API客户端
│   └── storage/          # 存储管理
├── types/                 # TypeScript类型定义
├── backend/               # 后端项目
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务服务
│   │   ├── middleware/   # 中间件
│   │   └── utils/        # 工具函数
│   └── dist/             # 编译输出
└── public/               # 静态资源
```

### 添加新功能
1. 在相应的service中添加业务逻辑
2. 创建或更新controller处理请求
3. 在routes中注册新路由
4. 更新前端API客户端
5. 创建或更新React组件
6. 更新类型定义

### 测试模式
设置 `NEXT_PUBLIC_USE_MOCK_API=true` 可以使用模拟数据进行开发，无需启动后端服务。

## 部署建议

### 生产环境配置
1. 使用强密码的JWT_SECRET
2. 配置HTTPS
3. 设置合适的速率限制
4. 使用MongoDB副本集
5. 配置日志和监控

### 性能优化
1. 启用Redis缓存
2. 使用CDN加速静态资源
3. 开启Gzip压缩
4. 优化图片大小
5. 使用数据库索引

## 故障排除

### 常见问题

1. **MongoDB连接失败**
   - 检查MongoDB是否运行
   - 验证连接字符串
   - 检查防火墙设置

2. **OpenAI API错误**
   - 验证API密钥
   - 检查配额限制
   - 查看错误日志

3. **前端无法连接后端**
   - 检查API_URL配置
   - 验证CORS设置
   - 查看浏览器控制台

## 贡献指南

欢迎贡献代码！请遵循以下步骤：
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。