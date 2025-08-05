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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 使用Gemini直接分析图片
async function analyzeImageWithGemini(imageBuffer) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = `请详细分析这张图片，用中文回答。请按以下格式提供信息：

1. 场景描述：（描述整体场景、地点、环境）
2. 人物信息：（如果有人物，描述数量、动作、表情、穿着）
3. 物品细节：（描述可见的物品、位置关系）
4. 时间线索：（从光线、季节等推测时间）
5. 文字内容：（如果有文字、标牌等）
6. 情绪氛围：（整体给人的感受）
7. 特殊发现：（任何异常或值得注意的细节）

请提供具体的、可验证的事实信息。`;

    const imageParts = [
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // 解析文本为结构化数据
    const analysis = {
      原始描述: text,
      场景描述: extractSection(text, '场景描述'),
      人物信息: extractSection(text, '人物信息'),
      物品细节: extractSection(text, '物品细节'),
      时间线索: extractSection(text, '时间线索'),
      文字内容: extractSection(text, '文字内容'),
      情绪氛围: extractSection(text, '情绪氛围'),
      特殊发现: extractSection(text, '特殊发现'),
      分析状态: 'gemini-success'
    };
    
    return analysis;
  } catch (error) {
    console.error('Gemini分析失败:', error);
    throw error;
  }
}

// 提取文本中的特定部分
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}[：:：](.+?)(?=\\d+\\.|$)`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

// 测试端点
app.post('/api/vision/gemini-test', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    console.log('收到图片，大小:', req.file.size, 'bytes');

    const analysis = await analyzeImageWithGemini(req.file.buffer);

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size
    });

  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gemini Vision Direct',
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🔮 Gemini直接视觉分析服务
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/gemini-test

${process.env.GEMINI_API_KEY ? '✅ Gemini API已配置' : '❌ 缺少Gemini API密钥'}
==================================
  `);
});