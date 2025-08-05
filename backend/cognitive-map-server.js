require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
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

// 初始化Gemini
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// 事实追问提示词
const FACT_EXTRACTION_PROMPT = `你是一个专注于事实收集的助手。你的任务是：

1. 只询问具体的、可验证的事实
2. 避免询问感受、想法或观点
3. 关注时间、地点、人物、具体对话、具体行为
4. 一次只问一个具体问题

追问原则：
- 问"什么时候"而不是"为什么"
- 问"说了什么"而不是"怎么想"
- 问"做了什么"而不是"感觉如何"
- 问"具体数字"而不是"大概多少"

如果用户提供了图片，先详细描述你看到的所有具体元素。`;

// 图片描述生成
async function generateImageDescription(imageBase64) {
  const description = {
    场景元素: [],
    人物状态: [],
    时间线索: [],
    空间信息: [],
    物品细节: [],
    文字内容: [],
    情绪氛围: "",
    特殊细节: []
  };

  try {
    // 使用OpenRouter Vision API
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('缺少OpenRouter API密钥');
    }

    const axios = require('axios');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-pro-vision',
        messages: [
          {
            role: 'system',
            content: `请详细描述图片内容，重点关注具体事实：
1. 场景中的具体物体和位置
2. 可见的人物数量、动作、穿着
3. 时间线索（光线、季节特征）
4. 文字内容（标牌、文字）
5. 特殊或异常的细节

请用JSON格式返回，包含：场景元素、人物状态、时间线索、空间信息、物品细节、文字内容、情绪氛围、特殊细节`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请分析这张图片' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
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
          'X-Title': 'Cognitive Map'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    try {
      // 尝试解析JSON
      const parsed = JSON.parse(content);
      Object.assign(description, parsed);
    } catch {
      // 如果不是JSON，解析文本
      description.场景元素 = [content.substring(0, 50) + '...'];
      description.特殊细节 = ['需要更详细的分析'];
    }
    
    console.log('图片分析成功');
  } catch (error) {
    console.error('图片分析失败:', error.message);
    // 使用备用描述
    description.场景元素 = ['图片内容'];
    description.特殊细节 = ['无法识别具体内容'];
  }

  return description;
}

// 提取事实关键词
function extractFactKeywords(text) {
  const keywords = [];
  
  // 提取时间
  const timePatterns = /(\d{4}年|\d{1,2}月|\d{1,2}[日号]|[上下]午\d{1,2}点|凌晨|早上|中午|晚上)/g;
  const times = text.match(timePatterns);
  if (times) keywords.push(...times);
  
  // 提取数字
  const numberPatterns = /\d+[次个条万千百元块岁年月日号]/g;
  const numbers = text.match(numberPatterns);
  if (numbers) keywords.push(...numbers);
  
  // 提取具体行为
  const actionPatterns = /(说|做|去|来|打电话|发消息|签字|搬家|离开|结婚|离婚|生病|手术)/g;
  const actions = text.match(actionPatterns);
  if (actions) keywords.push(...actions);
  
  // 提取地点
  const placePatterns = /(家|公司|医院|学校|餐厅|公园|河边|城市)/g;
  const places = text.match(placePatterns);
  if (places) keywords.push(...places);
  
  return [...new Set(keywords)]; // 去重
}

// 生成具体追问
function generateFactQuestion(context, keywords) {
  const questions = [];
  
  // 基于已有信息生成追问
  if (keywords.includes("河") && !keywords.some(k => k.includes("年"))) {
    questions.push("你最后一次去那条河是哪一年？");
  }
  
  if (keywords.includes("离婚") && !keywords.some(k => k.includes("月"))) {
    questions.push("离婚手续是几月份办理的？");
  }
  
  if (keywords.includes("说") && !context.includes("原话")) {
    questions.push("他/她的原话是什么？能复述一下吗？");
  }
  
  if (keywords.includes("搬家") && !keywords.includes("城市")) {
    questions.push("搬到了哪个城市？具体是哪个区？");
  }
  
  if (keywords.includes("展览") || keywords.includes("展厅")) {
    questions.push("这个展览是在哪个展览馆？", "你是几点到的展览馆？");
  }
  
  if (keywords.includes("照片") || keywords.includes("拍")) {
    questions.push("这张照片是什么时候拍的？", "拍照时周围还有其他人吗？");
  }
  
  // 如果没有特定追问，使用通用追问
  if (questions.length === 0) {
    questions.push(
      "这件事发生的具体日期是？",
      "当时还有谁在场？",
      "从开始到结束持续了多长时间？",
      "有保存相关的记录或证据吗？"
    );
  }
  
  return questions[Math.floor(Math.random() * questions.length)]; // 随机返回一个相关问题
}

// 构建认知地图数据
function buildCognitiveMap(session) {
  const factKeywords = [];
  const insights = [];
  const connections = [];
  
  // 从所有消息中提取事实关键词
  session.messages.forEach(msg => {
    if (msg.role === 'user') {
      const keywords = extractFactKeywords(msg.content);
      keywords.forEach(keyword => {
        factKeywords.push({
          id: `fact-${Date.now()}-${Math.random()}`,
          text: keyword,
          type: 'fact',
          position: [
            Math.random() * 10 - 5,
            0,
            Math.random() * 10 - 5
          ],
          timestamp: msg.timestamp
        });
      });
    }
  });
  
  // 识别洞见（用户的新认识）
  session.messages.forEach(msg => {
    if (msg.content.includes("原来") || msg.content.includes("我发现") || msg.content.includes("明白了")) {
      insights.push({
        id: `insight-${Date.now()}-${Math.random()}`,
        text: msg.content.substring(0, 20) + "...",
        type: 'insight',
        position: [
          Math.random() * 8 - 4,
          3,
          Math.random() * 8 - 4
        ]
      });
    }
  });
  
  // 生成连接关系
  for (let i = 0; i < factKeywords.length - 1; i++) {
    if (Math.random() > 0.6) { // 随机连接一些节点
      connections.push({
        source: factKeywords[i].id,
        target: factKeywords[i + 1].id,
        strength: Math.random()
      });
    }
  }
  
  return {
    nodes: [...factKeywords, ...insights],
    connections,
    organism: {
      complexity: factKeywords.length / 10,
      balance: 0.5 + Math.random() * 0.3,
      evolution: session.messages.length / 20,
      vitality: 0.7
    }
  };
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '认知地图系统',
    mode: '事实导向对话'
  });
});

// 处理聊天消息
app.post('/api/chat/message', upload.single('image'), async (req, res) => {
  try {
    const { content, sessionId } = req.body;
    const imageFile = req.file;
    
    // 创建或获取会话
    let session = sessions.get(sessionId) || {
      id: sessionId || Date.now().toString(),
      messages: [],
      createdAt: Date.now(),
      cognitiveMap: {
        nodes: [],
        connections: [],
        organism: {}
      }
    };

    // 创建用户消息
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now()
    };

    // 处理图片
    let imageDescription = null;
    if (imageFile) {
      const imageBase64 = imageFile.buffer.toString('base64');
      userMessage.image = `data:image/jpeg;base64,${imageBase64}`;
      imageDescription = await generateImageDescription(imageBase64);
    }

    // 提取关键词
    const keywords = extractFactKeywords(content || '');
    
    // 生成追问
    let aiResponse = '';
    
    if (imageDescription) {
      // 如果有图片，先描述图片
      const elements = [];
      
      if (imageDescription.场景元素?.length > 0) {
        elements.push(`我看到${imageDescription.场景元素.join('、')}`);
      }
      
      if (imageDescription.人物状态?.length > 0) {
        elements.push(`人物：${imageDescription.人物状态.join('、')}`);
      }
      
      if (imageDescription.物品细节?.length > 0) {
        elements.push(`物品：${imageDescription.物品细节.join('、')}`);
      }
      
      if (imageDescription.时间线索?.length > 0) {
        elements.push(`时间线索：${imageDescription.时间线索.join('、')}`);
      }
      
      if (elements.length > 0) {
        aiResponse = elements.join('。') + '。\n\n';
      }
      
      // 基于图片内容生成具体追问
      const imageKeywords = [];
      Object.values(imageDescription).forEach(value => {
        if (Array.isArray(value)) {
          imageKeywords.push(...value);
        }
      });
      
      // 针对图片的具体追问
      if (imageDescription.场景元素?.some(e => e.includes('展览') || e.includes('展厅'))) {
        aiResponse += '这个展览是在哪个展览馆？你是几月几号去的？';
      } else if (imageDescription.人物状态?.length > 0) {
        aiResponse += '照片里的人是谁？这是什么时候拍的？';
      } else if (imageDescription.文字内容?.length > 0) {
        aiResponse += `我注意到图片中有文字：${imageDescription.文字内容[0]}。这是什么文件？何时获得的？`;
      } else {
        aiResponse += '这张照片是在哪里拍的？具体是什么时候？';
      }
    } else if (content) {
      // 生成具体追问
      aiResponse = generateFactQuestion(
        session.messages.map(m => m.content).join(' '),
        keywords
      );
    } else {
      aiResponse = '请分享一个具体事件，或上传相关图片。';
    }

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'ai',
      timestamp: Date.now() + 100,
      extractedKeywords: keywords
    };

    // 保存消息
    session.messages.push(userMessage, aiMessage);
    
    // 更新认知地图
    session.cognitiveMap = buildCognitiveMap(session);
    
    sessions.set(session.id, session);

    // 返回响应
    res.json({
      success: true,
      sessionId: session.id,
      message: {
        content: aiResponse,
        keywords: keywords
      },
      cognitiveMap: session.cognitiveMap
    });

  } catch (error) {
    console.error('处理消息时出错:', error);
    res.status(500).json({
      success: false,
      error: '处理消息时出错: ' + error.message
    });
  }
});

// 获取认知地图
app.get('/api/cognitive-map/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: '会话不存在' });
  }
  
  res.json({
    success: true,
    cognitiveMap: session.cognitiveMap,
    messages: session.messages.slice(-5) // 返回最近5条消息
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🧠 认知地图系统已启动
==================================
地址: http://localhost:${PORT}
模式: 事实导向对话

特点：
  ✨ 图片详细描述
  ✨ 事实关键词提取
  ✨ 具体追问生成
  ✨ 三维认知地图
  ✨ 实时更新可视化
==================================
  `);
});