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

// 使用Llama Vision分析图片
async function analyzeImageWithLlama(imageBuffer) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('缺少OpenRouter API密钥');
    }

    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('使用Llama 3.2 Vision模型分析图片...');
    
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
                text: `请详细描述这张图片的内容。请用中文回答，按以下格式：

场景描述：（整体场景、环境、地点）
人物信息：（如有人物，描述数量、动作、穿着）
物品细节：（具体物品、位置关系）
时间线索：（光线、季节等时间信息）
文字内容：（如有文字、标牌，请准确读出）
情绪氛围：（画面传达的整体感受）
特殊发现：（任何值得注意的细节）

请只描述你看到的，不要推测或想象。`
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
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Vision Analysis',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('Llama分析成功，响应长度:', content.length);
    
    // 解析响应为结构化数据
    const analysis = parseAnalysis(content);
    analysis.分析状态 = 'llama-success';
    analysis.原始描述 = content;
    
    return analysis;
  } catch (error) {
    console.error('Llama分析失败:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('错误详情:', JSON.stringify(error.response.data.error, null, 2));
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
  
  // 如果解析失败，尝试直接使用原文
  if (!analysis.场景描述 && content.length > 0) {
    analysis.场景描述 = content;
  }
  
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

    const analysis = await analyzeImageWithLlama(req.file.buffer);

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size,
      model: 'llama-3.2-vision'
    });

  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Llama Vision Server',
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    model: 'meta-llama/llama-3.2-11b-vision-instruct'
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🦙 Llama 视觉分析服务
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/analyze
模型: Llama 3.2 Vision (11B)

${process.env.OPENROUTER_API_KEY ? '✅ OpenRouter API已配置' : '❌ 缺少OpenRouter API密钥'}
==================================
  `);
});