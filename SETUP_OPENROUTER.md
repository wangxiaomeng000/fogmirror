# 配置 OpenRouter API

OpenRouter 支持多种AI模型，包括 GPT-4、Claude 等，并且支持图片识别功能。

## 获取 API 密钥

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号
3. 进入 [API Keys](https://openrouter.ai/keys) 页面
4. 创建新的 API 密钥

## 配置步骤

1. 打开 `backend/.env` 文件
2. 将 `OPENROUTER_API_KEY` 替换为你的真实密钥：
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
   ```
3. 确保 `AI_SERVICE_TYPE=openrouter`

## 支持的模型

OpenRouter 支持多种模型，默认使用 `openai/chatgpt-4o-latest`，它支持：
- 文本对话
- 图片识别
- 多轮对话

其他可选模型：
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet
- `google/gemini-pro-vision` - Gemini Pro Vision
- `openai/gpt-4-vision-preview` - GPT-4 Vision

## 测试

配置完成后，重启后端服务：
```bash
cd backend
npm run dev
```

然后访问前端测试图片上传功能。