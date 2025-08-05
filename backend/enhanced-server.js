require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 配置multer处理图片上传
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 存储会话数据（简单内存存储）
const sessions = new Map();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI Emotional Support Backend (Enhanced)',
    ai: process.env.AI_SERVICE_TYPE || 'mock'
  });
});

// 处理聊天消息（支持图片）
app.post('/api/chat/message', upload.single('image'), async (req, res) => {
  try {
    console.log('收到聊天请求:', {
      hasContent: !!req.body.content,
      hasImage: !!req.file,
      contentPreview: req.body.content?.substring(0, 50)
    });

    const { content, sessionId } = req.body;
    const imageFile = req.file;
    
    // 创建或获取会话
    let session = sessions.get(sessionId) || {
      id: sessionId || Date.now().toString(),
      messages: [],
      createdAt: Date.now()
    };

    // 创建用户消息
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now()
    };

    if (imageFile) {
      userMessage.image = `data:image/jpeg;base64,${imageFile.buffer.toString('base64')}`;
      console.log('包含图片，大小:', imageFile.size, 'bytes');
    }

    // 生成AI响应
    let aiResponse = `我理解你的感受。`;
    
    if (content) {
      aiResponse += `你提到了"${content.substring(0, 30)}..."，这很重要。`;
    }
    
    if (imageFile) {
      aiResponse += ` 我也看到了你分享的图片，其中蕴含着重要的情感信息。`;
    }
    
    aiResponse += ` 让我们一起深入探讨这个话题。你能详细说说是什么让你有这样的感受吗？`;

    // 如果配置了OpenRouter，尝试调用真实API
    if (process.env.AI_SERVICE_TYPE === 'openrouter' && process.env.OPENROUTER_API_KEY) {
      console.log('尝试调用OpenRouter API...');
      try {
        const messages = [{
          role: 'system',
          content: '你是一个专业的心理情感支持AI助手。请提供温暖、理解和支持性的回应。'
        }, {
          role: 'user',
          content: imageFile ? 
            [{ type: 'text', text: content }, { type: 'image_url', image_url: { url: userMessage.image }}] : 
            content
        }];

        const openRouterResponse = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo', // 使用更通用的模型
            messages,
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'AI Emotional Support Chat',
              'Content-Type': 'application/json'
            }
          }
        );

        aiResponse = openRouterResponse.data.choices[0].message.content;
        console.log('OpenRouter API调用成功');
      } catch (error) {
        console.error('OpenRouter API调用失败:', error.message);
        // 使用默认响应
      }
    }

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'ai',
      timestamp: Date.now() + 100,
      analysis: {
        facts: ['你表达了自己的想法', imageFile ? '你分享了一张图片' : '这是一次文字交流'],
        insights: ['表达和分享是建立连接的第一步', '你愿意寻求支持显示了勇气'],
        concepts: ['自我认知', '情感连接'],
        emotionalTone: {
          primary: '关切',
          intensity: 0.7,
          confidence: 0.8
        },
        suggestions: ['继续分享你的感受', '尝试描述更多细节', '思考这个话题对你的重要性']
      }
    };

    // 保存消息到会话
    session.messages.push(userMessage, aiMessage);
    sessions.set(session.id, session);

    // 返回响应
    res.json({
      success: true,
      sessionId: session.id,
      userMessage,
      aiMessage,
      layerData: [],
      dynamicModel: {
        type: 'organism',
        parameters: {
          complexity: 0.5,
          coherence: 0.7,
          evolution: 0.3,
          patterns: []
        }
      }
    });

    console.log('响应已发送');
  } catch (error) {
    console.error('处理消息时出错:', error);
    res.status(500).json({
      success: false,
      error: '处理消息时出错: ' + error.message
    });
  }
});

// 获取会话列表
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(s => ({
    id: s.id,
    title: `会话 ${s.id}`,
    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  res.json({
    success: true,
    sessions: sessionList
  });
});

// 获取单个会话
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: '会话不存在' });
  }
  
  res.json({
    success: true,
    session: {
      id: session.id,
      title: `会话 ${session.id}`,
      messages: session.messages,
      layerData: [],
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🚀 增强版后端服务已启动
==================================
地址: http://localhost:${PORT}
AI服务: ${process.env.AI_SERVICE_TYPE || 'mock'}
功能: 
  ✅ 文字聊天
  ✅ 图片上传
  ✅ 会话管理
  ${process.env.AI_SERVICE_TYPE === 'openrouter' ? '✅ OpenRouter/GPT-4集成' : '⚠️  使用模拟AI'}
==================================
  `);
});