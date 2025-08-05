# 🌫️ FogMirror 雾镜 - 快速部署指南

## 第一步：创建 GitHub 账号（如果还没有）
1. 访问 https://github.com
2. 点击 "Sign up" 注册账号

## 第二步：Fork 或创建仓库
### 方法A：使用现有代码
1. 创建新仓库：https://github.com/new
2. 仓库名称：`fogmirror`
3. 设置为 Public（公开）
4. 不要勾选任何初始化选项

### 方法B：推送本地代码
```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/fogmirror.git

# 推送代码
git push -u origin main
```

## 第三步：获取必需的 API 密钥

### 1. MongoDB Atlas（免费数据库）
1. 访问 https://www.mongodb.com/cloud/atlas
2. 点击 "Try Free" 注册账号
3. 创建免费集群（选择离你最近的区域）
4. 设置数据库用户名和密码
5. 在 Network Access 中添加 `0.0.0.0/0`（允许所有IP）
6. 获取连接字符串：
   ```
   mongodb+srv://用户名:密码@cluster名称.xxxxx.mongodb.net/fogmirror?retryWrites=true&w=majority
   ```

### 2. SiliconFlow API 密钥（图片识别）
1. 访问 https://siliconflow.cn
2. 注册账号
3. 在控制台获取 API Key

### 3. JWT Secret（随机密钥）
在终端运行生成：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 第四步：部署到 Vercel

### 方法A：使用部署按钮（最简单）
1. 确保代码已推送到 GitHub
2. 点击下方按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/fogmirror)

### 方法B：手动部署
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入 `fogmirror` 仓库
5. 配置环境变量（见下方）
6. 点击 "Deploy"

## 第五步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| MONGODB_URI | mongodb+srv://... | MongoDB 连接字符串 |
| JWT_SECRET | 随机32位字符串 | JWT 加密密钥 |
| SILICONFLOW_API_KEY | sk-... | SiliconFlow API密钥 |
| AI_SERVICE_TYPE | siliconflow | 固定值 |

## 第六步：访问你的网站

部署成功后，你会获得一个网址：
- 主域名：`https://fogmirror.vercel.app`
- 或自定义：`https://你的项目名.vercel.app`

### 主要页面：
- 首页：`/`
- 认知考古：`/cognitive-archaeology`
- 情感支持：`/emotional-support`

## 🎯 功能验证清单

部署后测试以下功能：
- [ ] 用户注册/登录
- [ ] 普通聊天功能
- [ ] 图片上传和识别
- [ ] 认知考古对话
- [ ] 3D认知地图显示

## ⚠️ 重要提示

1. **免费额度**：
   - Vercel 免费版每月 100GB 带宽
   - MongoDB Atlas 免费版 512MB 存储
   - SiliconFlow 有免费额度

2. **安全建议**：
   - 定期更换 JWT_SECRET
   - 监控 API 使用量
   - 设置 MongoDB 备份

## 🆘 遇到问题？

### 常见问题：
1. **部署失败**：检查环境变量是否正确设置
2. **数据库连接失败**：确认 MongoDB IP 白名单
3. **图片识别失败**：验证 SiliconFlow API 密钥

### 获取帮助：
- 查看 Vercel 日志：项目设置 > Functions > Logs
- 提交 Issue：https://github.com/fogmirror/fogmirror/issues

---

🎉 恭喜！你的雾镜系统即将上线，让更多人透过迷雾看见真实的自己。