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

// 具体化AI提示词
const CONCRETE_SYSTEM_PROMPT = `你是一个温暖且善于观察的情感支持伙伴。你的任务是：

1. 如果用户分享了图片，首先仔细观察并在内心描述图片内容（但不要直接说出完整描述）
2. 基于图片和文字的具体内容展开对话
3. 提及你观察到的具体细节，让对话更加真实
4. 将具体观察与情感探索结合
5. 避免空泛的引导，要谈论实际的事物

对话原则：
- 注意图片中的细节：颜色、光线、物体、场景、氛围等
- 将观察到的内容自然地融入对话
- 基于具体内容提出相关问题或分享感受
- 保持温暖理解的语气，但要具体不空泛

示例（如果用户分享了展览照片）：
"我注意到照片里的光线很暗，墙上那些黑白照片看起来确实让人心情沉重。特别是左边那张干涸河床的照片，和你提到的家乡河流形成了强烈对比。站在那里看着这些画面，一定触动了很多回忆吧？"`;

// 初始化Gemini
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI Emotional Support Backend (Concrete)',
    ai: process.env.AI_SERVICE_TYPE || 'gemini',
    mode: '具体化对话模式'
  });
});

// 分析图片内容
async function analyzeImage(imageBase64) {
  const imageDescription = {
    overview: '',
    details: [],
    atmosphere: '',
    colors: [],
    objects: []
  };

  // 模拟图片分析（实际应该调用视觉API）
  // 这里提供一个基础的分析框架
  if (imageBase64) {
    imageDescription.overview = '一张包含丰富视觉信息的图片';
    imageDescription.details = ['场景中有多个元素', '光线条件特殊', '色彩具有情感表达'];
    imageDescription.atmosphere = '整体氛围令人深思';
    imageDescription.colors = ['暖色调', '冷色调的对比'];
    imageDescription.objects = ['人物', '环境', '物品'];
  }

  return imageDescription;
}

// 生成具体化回应
async function generateConcreteResponse(content, imageBase64, imageDescription) {
  try {
    if (genAI && process.env.AI_SERVICE_TYPE === 'gemini') {
      console.log('使用Gemini API生成具体化回应...');
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      let prompt = CONCRETE_SYSTEM_PROMPT + '\n\n';
      
      if (imageDescription && imageDescription.overview) {
        prompt += `图片分析结果：${JSON.stringify(imageDescription)}\n\n`;
      }
      
      prompt += `用户说：${content}\n\n请基于具体内容（包括图片信息）进行回应。`;
      
      const parts = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        });
      }
      
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } else {
      // 备用具体化回应
      return generateFallbackConcreteResponse(content, imageDescription);
    }
  } catch (error) {
    console.error('AI生成失败:', error);
    return generateFallbackConcreteResponse(content, imageDescription);
  }
}

// 备用具体化回应
function generateFallbackConcreteResponse(content, imageDesc) {
  const hasImage = imageDesc && imageDesc.overview;
  
  // 基于内容的具体回应
  if (content.includes('展览') || content.includes('照片')) {
    if (hasImage) {
      return `看到你分享的这张照片，${imageDesc.atmosphere || '画面很有感染力'}。${imageDesc.details[0] || '照片中的细节'}让我想到，当你站在展览现场时，这些画面一定给你带来了很深的触动。你提到的"${content.substring(0, 20)}..."，能感受到这不仅仅是一次参观，更像是一次内心的对话。`;
    }
    return `听你描述这个展览，能感受到它对你的触动。"${content.substring(0, 30)}..."这段话里，我特别注意到你用了"${content.includes('累') ? '累' : '特别'}"这个词。这种疲惫感，是来自于情感上的冲击吗？`;
  }
  
  if (content.includes('河') || content.includes('家乡') || content.includes('污染')) {
    return `你提到家乡的河流从清澈变成被污染，这种变化一定让你很心痛。${hasImage ? '结合你分享的照片来看，' : ''}这不仅是环境的改变，更是童年记忆的消逝。那条河对你来说，代表着什么特别的意义吗？是否有什么具体的画面还留在你的记忆中？`;
  }
  
  if (content.includes('朋友') || content.includes('见面')) {
    return `和老朋友见面${hasImage ? '，从照片能看出这次相聚的特别' : ''}。"${content.substring(0, 20)}..."，这样的重逢时刻总是复杂的——既有重逢的喜悦，也可能有时光流逝的感慨。这次见面，你们聊了些什么？有什么特别的瞬间吗？`;
  }
  
  // 通用但具体的回应
  const keywords = content.match(/[\u4e00-\u9fa5]+/g) || [];
  const mainKeyword = keywords.find(k => k.length > 2) || keywords[0] || '';
  
  return `你提到的"${mainKeyword}"${hasImage ? '，再看看这张照片' : ''}，能感受到这对你有特殊的意义。${content.includes('感觉') ? '这种感觉' : '这个经历'}背后，似乎有着更深层的故事。能跟我说说，是什么让这个时刻如此特别吗？`;
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

    let imageDescription = null;
    if (imageFile) {
      const imageBase64 = imageFile.buffer.toString('base64');
      userMessage.image = `data:image/jpeg;base64,${imageBase64}`;
      console.log('包含图片，大小:', imageFile.size, 'bytes');
      
      // 分析图片内容
      imageDescription = await analyzeImage(imageBase64);
      console.log('图片分析完成:', imageDescription.overview);
    }

    // 生成具体化AI响应
    const aiResponse = await generateConcreteResponse(
      content, 
      imageFile?.buffer.toString('base64'),
      imageDescription
    );

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'ai',
      timestamp: Date.now() + 100,
      imageAnalysis: imageDescription, // 保存图片分析结果
      analysis: {
        facts: [
          content ? `用户提到: "${content.substring(0, 30)}..."` : '用户分享了一张图片',
          imageFile ? `图片信息: ${imageDescription?.overview || '包含视觉内容'}` : '纯文字交流'
        ],
        insights: [
          '每个细节都承载着情感记忆',
          '具体的画面往往触发深层感受'
        ],
        concepts: ['具体记忆', '情感联结', '视觉表达'],
        emotionalTone: {
          primary: '共鸣',
          intensity: 0.7,
          confidence: 0.85
        },
        suggestions: [
          '继续分享具体的记忆和感受',
          '注意那些触动你的细节',
          '探索画面背后的情感意义'
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
      layerData: generateLayerData(aiMessage.analysis, imageDescription),
      dynamicModel: {
        type: 'organism',
        parameters: {
          complexity: 0.4 + (session.messages.length * 0.05),
          coherence: 0.7,
          evolution: 0.3 + (session.messages.length * 0.02),
          patterns: ['具体', '观察', '共鸣', '记忆']
        }
      }
    });

    console.log('具体化响应已发送');
  } catch (error) {
    console.error('处理消息时出错:', error);
    res.status(500).json({
      success: false,
      error: '处理消息时出错: ' + error.message
    });
  }
});

// 生成层级数据（包含图片信息）
function generateLayerData(analysis, imageDesc) {
  const layers = [];
  let id = 0;
  
  // 事实层（包括图片事实）
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
  
  // 如果有图片，添加图片细节层
  if (imageDesc && imageDesc.details) {
    imageDesc.details.forEach((detail, i) => {
      layers.push({
        id: `layer-${id++}`,
        type: 'facts',
        content: `图片细节: ${detail}`,
        position: [Math.cos((i + 2) * Math.PI / 3) * 3.5, 0.5, Math.sin((i + 2) * Math.PI / 3) * 3.5],
        color: '#7B68EE',
        intensity: 0.6
      });
    });
  }
  
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
    updatedAt: new Date().toISOString(),
    hasImages: s.messages.some(m => m.image)
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
🎯 具体化AI情感支持系统已启动
==================================
地址: http://localhost:${PORT}
AI服务: ${process.env.AI_SERVICE_TYPE || 'gemini'}
模式: 具体化对话（基于实际内容）

特点：
  ✨ 图片内容分析
  ✨ 基于具体细节对话
  ✨ 结合视觉与文字信息
  ✨ 深度但具体的交流
  
${genAI ? '✅ Gemini API已配置' : '⚠️  使用备用具体化模式'}
==================================
  `);
});