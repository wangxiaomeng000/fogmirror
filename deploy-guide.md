# 部署指南 - AI情感支持与认知考古系统

## 🚀 快速部署到 Vercel

### 1. 准备工作

确保你有以下账号和密钥：
- GitHub 账号
- Vercel 账号（免费）
- MongoDB Atlas 账号（免费层够用）
- SiliconFlow API 密钥

### 2. 部署步骤

#### Step 1: Fork 或上传代码到 GitHub

```bash
# 初始化 git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/ai-emotional-support-chat.git
git push -u origin main
```

#### Step 2: 在 Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（重要！）：
   - `MONGODB_URI`: MongoDB 连接字符串
   - `JWT_SECRET`: 随机生成的密钥
   - `SILICONFLOW_API_KEY`: SiliconFlow API 密钥
   - `OPENROUTER_API_KEY`: OpenRouter API 密钥（可选）

#### Step 3: 配置 MongoDB Atlas

1. 在 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 创建免费集群
2. 创建数据库用户
3. 添加 IP 白名单（选择 "Allow access from anywhere"）
4. 获取连接字符串

### 3. 环境变量说明

在 Vercel 项目设置中添加以下环境变量：

```
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/ai-emotional-support?retryWrites=true&w=majority
JWT_SECRET=生成一个随机字符串（至少32位）
SILICONFLOW_API_KEY=你的SiliconFlow密钥
AI_SERVICE_TYPE=siliconflow
```

### 4. 部署后配置

部署成功后，你需要：

1. **更新前端API地址**
   修改 `utils/api.ts` 中的 API_BASE_URL：
   ```typescript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://你的应用名.vercel.app/api'
     : 'http://localhost:3001/api';
   ```

2. **配置CORS**（如果前后端分离部署）
   在 `backend/src/server.ts` 中更新 CORS 配置

### 5. 功能验证

部署完成后，测试以下功能：
- [ ] 用户注册/登录
- [ ] 普通聊天（带图片）
- [ ] 认知考古聊天
- [ ] 图片识别功能
- [ ] 3D认知地图

## 🌐 其他部署选项

### 部署到 Railway

1. 在 [Railway](https://railway.app) 创建新项目
2. 连接 GitHub 仓库
3. 添加 MongoDB 插件
4. 配置环境变量
5. 部署会自动进行

### 部署到 Render

1. 在 [Render](https://render.com) 创建 Web Service
2. 连接 GitHub 仓库
3. 配置构建命令：`npm install && npm run build`
4. 配置启动命令：`npm start`
5. 添加环境变量

## 📱 移动端适配

系统已经做了移动端适配，在手机上访问体验良好。

## 🔒 安全建议

1. **生产环境必须使用 HTTPS**
2. **定期更新 API 密钥**
3. **设置 MongoDB 备份**
4. **监控 API 使用量**

## 🆘 常见问题

### Q: 部署后图片上传失败
A: 检查 Vercel 函数大小限制，可能需要压缩图片

### Q: MongoDB 连接超时
A: 确保 IP 白名单设置正确，或使用 0.0.0.0/0

### Q: API 调用失败
A: 检查环境变量是否正确设置，特别是 API 密钥

## 📞 获取帮助

如果遇到问题：
1. 查看 Vercel 函数日志
2. 检查浏览器控制台错误
3. 确认所有环境变量已设置

祝部署顺利！🎉