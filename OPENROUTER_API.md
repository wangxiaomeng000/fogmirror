# 获取 OpenRouter API 密钥

为了使用真实的图片识别功能，您需要配置 OpenRouter API 密钥。

## 步骤

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 点击右上角 "Sign Up" 注册账号
3. 登录后进入 [API Keys](https://openrouter.ai/keys) 页面
4. 点击 "Create Key" 创建新密钥
5. 复制生成的密钥（格式: `sk-or-v1-xxxxxxxxxxxxx`）

## 配置密钥

1. 打开 `backend/.env` 文件
2. 找到这一行：
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. 替换为您的真实密钥：
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
   ```

## 免费额度

OpenRouter 提供：
- 新用户免费 $1 额度
- 支持多种模型（GPT-4, Claude等）
- 支持图片识别功能

## 推荐模型

- `openai/chatgpt-4o-latest` - 支持图片识别，性能最佳
- `anthropic/claude-3.5-sonnet` - Claude 模型
- `google/gemini-pro-vision` - Google 视觉模型

配置完成后，重启后端服务即可使用真实的AI图片识别功能。