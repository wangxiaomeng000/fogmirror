# 雾镜 FogMirror - AI 情感支持与认知考古系统

透过迷雾，看见真实的自己。一个结合了情感支持和认知考古功能的 AI 聊天系统，支持图片识别和 3D 认知地图可视化。

## ✨ 主要功能

### 🤖 AI 情感陪伴
- **温暖专业**：提供理解、共情的情感支持
- **图片识别**：支持上传图片，AI能理解图片内容并结合对话
- **多模态交互**：文字+图片的丰富对话体验

### 🧠 认知考古（特色功能）
- **苏格拉底式提问**：通过提问帮助重构对人生事件的理解
- **三层认知模型**：自动提取和标注事实、洞见、观念
- **张力点识别**：发现内心冲突和认知矛盾
- **3D认知地图**：将思维脉络可视化为立体网络

### 💎 3D可视化
- **动态生物体模型**：每个对话生成独特的3D视觉表现
- **认知节点网络**：展示思维的连接和演化
- **实时更新**：随对话发展动态演化

### 📊 数据管理
- **多会话支持**：管理多个对话历史
- **导入/导出**：数据备份和迁移
- **隐私保护**：支持完全本地运行

## 🚀 一键部署

### 部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wangxiaomeng000/fogmirror&env=MONGODB_URI,JWT_SECRET,SILICONFLOW_API_KEY,AI_SERVICE_TYPE&envDescription=需要配置的环境变量&envLink=https://github.com/wangxiaomeng000/fogmirror/blob/main/deploy-guide.md)

点击上方按钮，然后：
1. 登录 Vercel 账号
2. 设置环境变量（MongoDB连接、API密钥等）
3. 点击 Deploy，等待部署完成
4. 访问你的专属网址！

## 🔧 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/wangxiaomeng000/fogmirror.git
cd fogmirror

# 2. 安装依赖
npm install
cd backend && npm install && cd ..

# 3. 配置环境变量
# 复制 .env.example 到 .env 并填写配置

# 4. 启动系统
./start.sh

# 访问 http://localhost:3000
```

### 环境变量配置

创建 `backend/.env` 文件：
```
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=随机生成的32位密钥
SILICONFLOW_API_KEY=你的SiliconFlow密钥
AI_SERVICE_TYPE=siliconflow
```

## 📖 使用指南

### 认知考古功能使用

1. 访问 `/cognitive-archaeology` 页面
2. 分享你的故事或上传图片
3. AI会通过提问引导你深入探索
4. 查看3D认知地图，理解思维脉络

### 测试剧本

项目包含6套完整测试剧本：
- 职场讨好型人格
- 亲密关系依赖
- 完美主义困境
- 更多剧本见 `认知考古测试剧本.md`

## 🛠 技术栈

- **前端**：Next.js 15 + React 19 + TypeScript + Three.js
- **后端**：Express + Node.js + TypeScript + MongoDB
- **AI服务**：SiliconFlow（支持图片识别）
- **部署**：Vercel / Railway / Docker

## 📝 项目文档

- [部署指南](./deploy-guide.md) - 详细部署步骤
- [认知考古测试剧本](./认知考古测试剧本.md) - 完整测试用例
- [API文档](./API_DOCS.md) - 接口说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**问题反馈**: 请在 [GitHub Issues](https://github.com/wangxiaomeng000/fogmirror/issues) 提交
