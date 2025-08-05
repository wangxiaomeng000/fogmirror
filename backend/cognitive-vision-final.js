require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3001;

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// 会话存储
const sessions = new Map();

// 获取或创建会话
function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      messages: [],
      cognitiveMap: {
        nodes: [],
        links: [],
        organism: {
          complexity: 0,
          balance: 50,
          evolution: 0
        }
      }
    });
  }
  return sessions.get(sessionId);
}

// 使用Llama Vision分析图片
async function analyzeImageWithLlama(imageBuffer) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('缺少OpenRouter API密钥');
    }

    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('使用Llama 3.2 Vision分析图片...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-11b-vision-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请详细描述这张图片中的具体事实信息。用中文回答，重点关注：
1. 具体的地点、场景
2. 可见的人物数量、动作、衣着
3. 具体的物品、品牌、文字
4. 时间线索（光线、季节、钟表等）
5. 任何可辨识的细节

只描述你看到的事实，不要推测。`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Cognitive Vision',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('图片分析完成');
    
    return content;
  } catch (error) {
    console.error('图片分析失败:', error.response?.data || error.message);
    throw error;
  }
}

// 提取关键词
function extractKeywords(text) {
  const keywords = new Set();
  
  const patterns = [
    /([^\s，。、]+(?:人|男|女|孩))/g,
    /([^\s，。、]+(?:年|月|日|时|分))/g,
    /([^\s，。、]+(?:市|区|街|路|店|馆|场))/g,
    /([^\s，。、]+(?:红|蓝|绿|黄|黑|白|灰)色?)/g,
    /(\d+[^\s，。、]*)/g,
    /([^\s，。、]{2,4}(?:的|了|着|过))/g
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const keyword = match[1].trim();
      if (keyword.length >= 2 && keyword.length <= 8) {
        keywords.add(keyword);
      }
    }
  });
  
  return Array.from(keywords).slice(0, 10);
}

// 生成事实追问
async function generateFactQuestion(context, imageInfo = null) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    // 从上下文中提取已知信息
    const hasTime = context.includes('点') || context.includes('月') || context.includes('周');
    const hasPlace = context.includes('家') || context.includes('店') || context.includes('村');
    const hasPerson = context.includes('我') || context.includes('他') || context.includes('朋友');
    const hasMoney = context.includes('万') || context.includes('薪') || context.includes('钱');
    
    // 智能选择问题
    const questions = [];
    
    if (!hasTime) {
      questions.push('这件事发生在什么时候？具体是哪一天？');
    } else if (!hasPlace) {
      questions.push('这是在什么地方发生的？');
    } else if (context.includes('同事') || context.includes('朋友')) {
      questions.push('你们具体聊了什么内容？');
    } else if (context.includes('创业') || context.includes('工作')) {
      questions.push('他们的具体计划是什么？');
    } else if (hasMoney && !context.includes('现在')) {
      questions.push('你现在的收入情况如何？');
    } else if (context.includes('说了') || context.includes('觉得')) {
      questions.push('除了他/她，你还咨询过其他人吗？');
    } else {
      // 根据最后提到的内容生成相关问题
      if (context.includes('团队')) {
        questions.push('团队里都有哪些人？他们的背景如何？');
      } else if (context.includes('合同')) {
        questions.push('你的合同什么时候到期？');
      } else if (context.includes('投资')) {
        questions.push('他们的资金来源是什么？投资方是谁？');
      } else {
        questions.push('在这件事上，还有哪些具体细节？');
      }
    }
    
    // 如果可以用更高级的模型，尝试使用
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: '你是一个专注于收集具体事实的助手。只问具体的、可验证的事实，避免重复已经回答过的问题。'
            },
            {
              role: 'user',
              content: `用户描述：${context}\n\n请基于用户还没有提供的信息，问一个具体的事实性问题。`
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Fact Question'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (apiError) {
      // API失败时使用本地逻辑
      return questions[0] || '能告诉我更多具体细节吗？';
    }
  } catch (error) {
    console.error('生成追问失败:', error);
    // 使用更智能的本地备选问题
    const fallbackQuestions = [
      '这件事涉及到哪些人？',
      '具体的时间和地点是？',
      '有什么具体的数字或条件吗？',
      '接下来你打算怎么做？',
      '这件事的背景是什么？'
    ];
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }
}

// 更新认知地图
function updateCognitiveMap(session, keywords, messageType = 'user') {
  const map = session.cognitiveMap;
  
  keywords.forEach(keyword => {
    // 检查节点是否已存在
    let node = map.nodes.find(n => n.text === keyword);
    
    if (!node) {
      // 创建新节点
      node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: keyword,
        type: 'fact',
        size: 1,
        connections: 0
      };
      map.nodes.push(node);
    } else {
      // 增加节点大小
      node.size = Math.min(node.size + 0.2, 3);
    }
  });
  
  // 创建连接
  for (let i = 0; i < keywords.length - 1; i++) {
    const source = map.nodes.find(n => n.text === keywords[i]);
    const target = map.nodes.find(n => n.text === keywords[i + 1]);
    
    if (source && target) {
      const existingLink = map.links.find(
        l => (l.source === source.id && l.target === target.id) ||
             (l.source === target.id && l.target === source.id)
      );
      
      if (!existingLink) {
        map.links.push({
          source: source.id,
          target: target.id,
          strength: 1
        });
        source.connections++;
        target.connections++;
      }
    }
  }
  
  // 更新生物体参数
  map.organism.complexity = Math.min(map.nodes.length * 2, 100);
  map.organism.evolution = Math.min(session.messages.length * 5, 100);
  
  // 生成洞见
  if (map.nodes.length >= 5 && Math.random() > 0.7) {
    const insightNode = {
      id: `insight-${Date.now()}`,
      text: `模式: ${keywords.slice(0, 3).join('-')}`,
      type: 'insight',
      size: 2,
      connections: 0
    };
    map.nodes.push(insightNode);
  }
}

// 处理消息
app.post('/api/chat/message', upload.single('image'), async (req, res) => {
  try {
    const { content, sessionId } = req.body || req.query || {};
    const session = getSession(sessionId || 'default');
    
    let imageAnalysis = null;
    let keywords = [];
    
    // 如果有图片，先分析图片
    if (req.file) {
      console.log('检测到图片，开始分析...');
      imageAnalysis = await analyzeImageWithLlama(req.file.buffer);
      keywords = extractKeywords(imageAnalysis);
      
      // 保存图片分析结果
      session.messages.push({
        role: 'system',
        content: `图片分析：${imageAnalysis}`,
        timestamp: new Date(),
        keywords: keywords
      });
    }
    
    // 处理文本内容
    if (content) {
      const textKeywords = extractKeywords(content);
      keywords = [...keywords, ...textKeywords];
      
      // 保存用户消息
      session.messages.push({
        role: 'user',
        content: content,
        timestamp: new Date(),
        keywords: textKeywords
      });
    }
    
    // 更新认知地图
    if (keywords.length > 0) {
      updateCognitiveMap(session, keywords);
    }
    
    // 生成追问
    const context = session.messages.slice(-3).map(m => m.content).join(' ');
    const question = await generateFactQuestion(context, imageAnalysis);
    
    // 保存AI回复
    const aiMessage = {
      role: 'assistant',
      content: question,
      timestamp: new Date(),
      keywords: []
    };
    session.messages.push(aiMessage);
    
    res.json({
      message: aiMessage,
      imageAnalysis: imageAnalysis,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('处理消息错误:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// 获取认知地图
app.get('/api/cognitive-map/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  res.json({
    cognitiveMap: session.cognitiveMap,
    messageCount: session.messages.length
  });
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../cognitive-map-ui.html'));
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cognitive Vision System',
    features: ['Llama Vision', 'Fact Extraction', 'Cognitive Mapping'],
    hasApiKey: !!process.env.OPENROUTER_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🧠 认知地图 + 视觉分析系统
==================================
地址: http://localhost:${PORT}
视觉模型: Llama 3.2 Vision
语言模型: GPT-3.5 Turbo

功能特点：
  ✨ 真实图片识别
  ✨ 事实关键词提取
  ✨ 具体追问生成
  ✨ 三维认知地图
  ✨ 实时更新可视化

${process.env.OPENROUTER_API_KEY ? '✅ API已配置' : '❌ 缺少API密钥'}
==================================
  `);
});