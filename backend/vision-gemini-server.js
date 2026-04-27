require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

// 初始化Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required. See backend/.env.example');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 使用Gemini Pro Vision分析图片
async function analyzeImageWithGemini(imageBuffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    console.log('使用Gemini Pro Vision分析图片...');
    console.log('图片大小:', imageBuffer.length, 'bytes');
    console.log('MIME类型:', mimeType);
    
    // 准备图片数据
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    };
    
    const prompt = `请详细描述这张图片的内容。请用中文回答，按以下格式：

场景描述：（整体场景、环境、地点）
人物信息：（如有人物，描述数量、动作、穿着）
物品细节：（具体物品、位置关系）
时间线索：（光线、季节等时间信息）
文字内容：（如有文字、标牌，请准确读出）
情绪氛围：（画面传达的整体感受）
特殊发现：（任何值得注意的细节）

请只描述你看到的，不要推测或想象。`;
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const content = response.text();
    
    console.log('Gemini分析成功，响应长度:', content.length);
    
    // 解析响应为结构化数据
    const analysis = parseAnalysis(content);
    analysis.分析状态 = 'gemini-success';
    analysis.原始描述 = content;
    
    return analysis;
  } catch (error) {
    console.error('Gemini分析失败:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response);
    }
    throw error;
  }
}

// 解析分析结果
function parseAnalysis(content) {
  const analysis = {
    场景描述: '',
    人物信息: '',
    物品细节: '',
    时间线索: '',
    文字内容: '',
    情绪氛围: '',
    特殊发现: ''
  };
  
  const sections = [
    '场景描述', '人物信息', '物品细节', 
    '时间线索', '文字内容', '情绪氛围', '特殊发现'
  ];
  
  sections.forEach((section, index) => {
    const regex = new RegExp(`${section}[：:](.*?)(?=${sections[index + 1] || '$'}[：:]|$)`, 's');
    const match = content.match(regex);
    if (match) {
      analysis[section] = match[1].trim();
    }
  });
  
  return analysis;
}

// 测试端点
app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    console.log('\n=== 新的图片分析请求 ===');
    console.log('图片大小:', req.file.size, 'bytes');
    console.log('图片类型:', req.file.mimetype);

    const analysis = await analyzeImageWithGemini(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size,
      model: 'gemini-pro-vision'
    });

  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gemini Vision Server',
    hasApiKey: !!process.env.GEMINI_API_KEY || true,
    model: 'gemini-pro-vision'
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🔮 Gemini 视觉分析服务
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/analyze
模型: Gemini Pro Vision

${process.env.GEMINI_API_KEY ? '✅ Gemini API已配置' : '❌ 缺少Gemini API密钥'}
==================================
  `);
});