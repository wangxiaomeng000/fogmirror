require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = 3001;

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

// OpenAI Vision API 分析图片
async function analyzeImageWithOpenAI(imageBase64) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-pro-vision',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的图片分析助手。请详细描述图片内容，包括：
1. 场景描述（地点、环境、氛围）
2. 人物信息（数量、表情、动作、穿着）
3. 物品细节（具体物品、位置、状态）
4. 时间线索（光线、季节特征）
5. 文字内容（标牌、文字）
6. 情绪氛围（整体感受）
7. 特殊细节（异常或值得注意的地方）

请用JSON格式返回，包含以上所有维度。`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请详细分析这张图片'
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
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Vision Test'
        }
      }
    );

    // 解析返回的JSON
    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch {
      // 如果不是JSON格式，返回文本
      return {
        description: content,
        场景描述: content,
        分析状态: 'success'
      };
    }
  } catch (error) {
    console.error('OpenAI Vision API error:', error.response?.data || error.message);
    throw error;
  }
}

// 备用：使用描述性分析
function generateDetailedDescription(imageBase64) {
  // 这里应该集成其他视觉API作为备选
  return {
    场景描述: "需要真实的视觉分析API",
    人物信息: "无法识别",
    物品细节: "无法识别", 
    时间线索: "无法识别",
    文字内容: "无法识别",
    情绪氛围: "无法识别",
    特殊细节: "无法识别",
    分析状态: "fallback"
  };
}

// 测试端点
app.post('/api/vision/test', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const imageBase64 = req.file.buffer.toString('base64');
    console.log('收到图片，大小:', req.file.size, 'bytes');

    let analysis;
    
    // 尝试使用OpenAI Vision
    try {
      console.log('尝试OpenAI Vision API...');
      analysis = await analyzeImageWithOpenAI(imageBase64);
      console.log('OpenAI分析成功');
    } catch (error) {
      console.log('OpenAI失败，使用备用方案');
      analysis = generateDetailedDescription(imageBase64);
    }

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size,
      method: analysis.分析状态
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
    service: 'Vision Test Server',
    apis: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
👁️  视觉识别测试服务器
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/test

配置状态:
${process.env.OPENROUTER_API_KEY ? '✅' : '❌'} OpenRouter API
${process.env.GEMINI_API_KEY ? '✅' : '❌'} Gemini API
==================================
  `);
});