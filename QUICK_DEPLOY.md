# 🚀 雾镜 FogMirror - 5分钟快速部署

## 你的 GitHub 仓库已准备就绪！
🎉 访问: https://github.com/wangxiaomeng000/fogmirror

## 第1步：获取必需密钥（3分钟）

### 1.1 MongoDB Atlas（免费）
1. 打开 https://www.mongodb.com/cloud/atlas
2. 点击 "Try Free" → 用 Google 账号快速注册
3. 创建免费集群：
   - 选择 AWS
   - 选择最近的区域（如 Hong Kong）
   - 集群名称：fogmirror
4. 设置数据库用户：
   - Username: fogmirror
   - Password: 生成一个安全密码
5. Network Access → Add IP Address → Allow Access from Anywhere
6. 点击 "Connect" → "Connect your application"
7. 复制连接字符串，替换 <password> 为你的密码

### 1.2 SiliconFlow API
1. 打开 https://siliconflow.cn
2. 注册账号（支持手机号）
3. 进入控制台 → API密钥
4. 创建新密钥并复制

### 1.3 JWT Secret
运行以下命令生成：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 第2步：部署到 Vercel（2分钟）

### 方法A：一键部署（推荐）
1. 点击下方按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wangxiaomeng000/fogmirror)

2. 使用 GitHub 账号登录
3. 填写环境变量：
   - MONGODB_URI = `你的MongoDB连接字符串`
   - JWT_SECRET = `你生成的32位密钥`
   - SILICONFLOW_API_KEY = `你的SiliconFlow密钥`
   - AI_SERVICE_TYPE = `siliconflow`
4. 点击 Deploy

### 方法B：手动部署
1. 访问 https://vercel.com/new
2. Import Git Repository → 选择 fogmirror
3. 配置环境变量（同上）
4. Deploy

## 第3步：访问你的网站！

部署成功后，你会看到：
- ✅ 网址：https://fogmirror.vercel.app 或 https://fogmirror-xxx.vercel.app
- ✅ 状态：Ready

### 测试功能：
1. 访问首页：https://你的域名.vercel.app
2. 进入认知考古：https://你的域名.vercel.app/cognitive-archaeology
3. 上传图片测试AI识别
4. 使用测试剧本对话

## 🎊 恭喜！雾镜已经上线！

现在你可以：
- 分享链接给朋友使用
- 自己测试认知考古功能
- 探索AI情感支持对话

## 常见问题

**Q: 部署失败？**
A: 检查环境变量是否正确填写，特别是 MongoDB 连接字符串

**Q: 数据库连接失败？**
A: 确保 MongoDB Network Access 设置为 0.0.0.0/0

**Q: 图片识别不工作？**
A: 验证 SiliconFlow API 密钥是否正确

---
需要帮助？在 Issues 中提问：https://github.com/wangxiaomeng000/fogmirror/issues