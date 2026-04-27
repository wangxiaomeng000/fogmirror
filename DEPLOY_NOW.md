# 🚀 立即部署 FogMirror 雾镜

## ✅ 你已经准备好的：
- GitHub 仓库：https://github.com/wangxiaomeng000/fogmirror
- MongoDB 数据库：已配置

## 📋 环境变量（复制这些到 Vercel）：

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fogmirror?retryWrites=true&w=majority

JWT_SECRET=<生成32位随机字符串：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

SILICONFLOW_API_KEY=<your_siliconflow_key>

AI_SERVICE_TYPE=siliconflow
```

> ⚠️ 历史版本曾包含明文凭证，已于 2026-04-28 撤销并轮换。请使用新凭证。

## 🎯 现在就部署：

### 方法1：一键部署（推荐）
点击这个链接：
👉 https://vercel.com/new/clone?repository-url=https://github.com/wangxiaomeng000/fogmirror

然后：
1. 用 GitHub 登录 Vercel
2. 在环境变量部分，复制粘贴上面的4个变量
3. 点击 Deploy

### 方法2：手动部署
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入 fogmirror 仓库
4. 添加环境变量
5. Deploy

## ⚠️ 重要：SiliconFlow API 密钥

如果你还没有 SiliconFlow API 密钥：
1. 访问 https://siliconflow.cn
2. 注册账号（支持手机号）
3. 进入控制台 → API密钥
4. 创建新密钥

或者你可以先部署，之后在 Vercel 设置中添加。

## 🎉 部署成功后

你的网站地址：
- https://fogmirror.vercel.app
- 或 https://fogmirror-xxx.vercel.app

立即可以使用的功能：
- ✅ 用户注册/登录
- ✅ 情感支持聊天
- ✅ 认知考古（需要 SiliconFlow API 才能识别图片）
- ✅ 3D 认知地图

---

**现在就去部署吧！** 👉 https://vercel.com/new/clone?repository-url=https://github.com/wangxiaomeng000/fogmirror