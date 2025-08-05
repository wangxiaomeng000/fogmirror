require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// 存储会话数据
const sessions = new Map();

// 引导式AI提示词
const GUIDED_SYSTEM_PROMPT = `你是一个温暖的情感支持伙伴。你的任务是：

1. 通过开放式问题引导用户深入探索他们的感受和经历
2. 不要急于分析或下结论
3. 保持好奇心，询问更多细节
4. 关注用户提到的具体行为、事件和感受
5. 使用温暖、理解的语气

回应原则：
- 先共情和理解
- 提出1-2个开放式问题
- 鼓励用户分享更多细节
- 避免过早的分析或建议

示例回应：
"听起来参观会场对你来说是个特别的经历。你提到'刚刚结束'，这让我很好奇——是什么让你想要在这个时刻分享这张照片呢？会场里有什么特别触动你的地方吗？"`;

// 初始化Gemini
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI Emotional Support Backend (Guided)',
    ai: process.env.AI_SERVICE_TYPE || 'gemini'
  });
});

// 生成引导式回应
async function generateGuidedResponse(content, imageBase64) {
  try {
    if (genAI && process.env.AI_SERVICE_TYPE === 'gemini') {
      console.log('使用Gemini API生成回应...');
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `${GUIDED_SYSTEM_PROMPT}\n\n用户说：${content}\n\n请用引导式的方式回应，帮助用户探索更深层的感受。`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else {
      // 备用引导式回应
      return generateFallbackGuidedResponse(content, imageBase64);
    }
  } catch (error) {
    console.error('AI生成失败:', error);
    return generateFallbackGuidedResponse(content, imageBase64);
  }
}

// 备用引导式回应
function generateFallbackGuidedResponse(content, hasImage) {
  const responses = [
    `我能感受到这对你很重要。${hasImage ? '这张照片' : '你的话'}背后似乎有着特别的意义。能和我说说当时的具体情况吗？是什么让这一刻如此特别？`,
    
    `谢谢你愿意和我分享。我注意到你提到了"${content.substring(0, 20)}..."，这让我很想了解更多。当时你的心情是怎样的？有什么特别的感受吗？`,
    
    `听起来这是个值得记住的时刻。${hasImage ? '看到你想要用照片记录下来' : '听你这么说'}，我很好奇——在那个场景中，什么最打动你？`,
    
    `我能感受到这段经历对你的意义。你说"${content.substring(0, 15)}..."，能再详细描述一下吗？比如，当时周围是什么样子？你在想什么？`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// 处理聊天消息
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

    // 生成引导式AI响应
    const aiResponse = await generateGuidedResponse(content, imageFile?.buffer.toString('base64'));

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'ai',
      timestamp: Date.now() + 100,
      analysis: {
        facts: [
          content ? `用户分享了: "${content.substring(0, 30)}..."` : '用户分享了一张图片',
          imageFile ? '包含视觉内容' : '纯文字交流'
        ],
        insights: ['愿意分享是建立信任的开始', '每个细节都可能蕴含重要意义'],
        concepts: ['自我表达', '情感探索'],
        emotionalTone: {
          primary: '探索',
          intensity: 0.6,
          confidence: 0.8
        },
        suggestions: [
          '继续分享你的感受和想法',
          '注意内心的真实声音',
          '不必急于得出结论'
        ]
      }
    };

    // 保存消息
    session.messages.push(userMessage, aiMessage);
    sessions.set(session.id, session);

    // 返回响应
    res.json({
      success: true,
      sessionId: session.id,
      userMessage,
      aiMessage,
      layerData: generateLayerData(aiMessage.analysis),
      dynamicModel: {
        type: 'organism',
        parameters: {
          complexity: 0.3 + (session.messages.length * 0.05),
          coherence: 0.6,
          evolution: 0.2 + (session.messages.length * 0.03),
          patterns: ['探索', '分享', '理解']
        }
      }
    });

    console.log('引导式响应已发送');
  } catch (error) {
    console.error('处理消息时出错:', error);
    res.status(500).json({
      success: false,
      error: '处理消息时出错: ' + error.message
    });
  }
});

// 生成层级数据
function generateLayerData(analysis) {
  const layers = [];
  let id = 0;
  
  // 事实层
  analysis.facts.forEach((fact, i) => {
    layers.push({
      id: `layer-${id++}`,
      type: 'facts',
      content: fact,
      position: [Math.cos(i * Math.PI / 2) * 3, 0, Math.sin(i * Math.PI / 2) * 3],
      color: '#4A90E2',
      intensity: 0.7
    });
  });
  
  // 洞见层
  analysis.insights.forEach((insight, i) => {
    layers.push({
      id: `layer-${id++}`,
      type: 'insights',
      content: insight,
      position: [Math.cos(i * Math.PI / 1.5) * 4, 2, Math.sin(i * Math.PI / 1.5) * 4],
      color: '#F5A623',
      intensity: 0.8
    });
  });
  
  // 观念层
  analysis.concepts.forEach((concept, i) => {
    layers.push({
      id: `layer-${id++}`,
      type: 'concepts',
      content: concept,
      position: [Math.cos(i * Math.PI) * 2, 4, Math.sin(i * Math.PI) * 2],
      color: '#E85D75',
      intensity: 0.9
    });
  });
  
  return layers;
}

// 获取会话列表
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(s => ({
    id: s.id,
    title: s.messages[0]?.content?.substring(0, 30) + '...' || `会话 ${s.id}`,
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
      title: session.messages[0]?.content?.substring(0, 30) + '...' || `会话 ${session.id}`,
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
🌟 引导式AI情感支持系统已启动
==================================
地址: http://localhost:${PORT}
AI服务: ${process.env.AI_SERVICE_TYPE || 'gemini'}
模式: 引导式对话（非分析式）

特点：
  ✨ 开放式提问
  ✨ 深度探索
  ✨ 温暖共情
  ✨ 避免过早分析
  
${genAI ? '✅ Gemini API已配置' : '⚠️  使用备用引导模式'}
==================================
  `);
});