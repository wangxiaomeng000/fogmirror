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

// 使用Claude-3分析图片
async function analyzeImageWithClaude(imageBuffer) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('缺少OpenRouter API密钥');
    }

    const imageBase64 = imageBuffer.toString('base64');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.7-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `请详细分析这张图片，用中文回答。请提供以下信息：

1. 场景描述：整体场景、地点、环境氛围
2. 人物信息：如果有人物，描述数量、动作、表情、穿着
3. 物品细节：可见的具体物品、位置关系
4. 时间线索：从光线、季节等推测时间
5. 文字内容：如果有文字、标牌等，请准确读出
6. 情绪氛围：画面传达的整体感受
7. 特殊发现：任何异常或值得注意的细节

请提供具体的、可验证的事实信息，不要推测或想象。`
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
          'X-Title': 'Vision Analysis'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // 解析文本为结构化数据
    const analysis = {
      原始描述: content,
      场景描述: extractSection(content, '场景描述', '人物信息'),
      人物信息: extractSection(content, '人物信息', '物品细节'),
      物品细节: extractSection(content, '物品细节', '时间线索'),
      时间线索: extractSection(content, '时间线索', '文字内容'),
      文字内容: extractSection(content, '文字内容', '情绪氛围'),
      情绪氛围: extractSection(content, '情绪氛围', '特殊发现'),
      特殊发现: extractSection(content, '特殊发现', null),
      分析状态: 'claude-success'
    };
    
    return analysis;
  } catch (error) {
    console.error('Claude分析失败:', error.response?.data || error.message);
    throw error;
  }
}

// 提取文本中的特定部分
function extractSection(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';
  
  const contentStart = text.indexOf('：', startIndex) + 1;
  if (contentStart === 0) return '';
  
  let contentEnd;
  if (endMarker) {
    contentEnd = text.indexOf(endMarker, contentStart);
    if (contentEnd === -1) contentEnd = text.length;
  } else {
    contentEnd = text.length;
  }
  
  return text.substring(contentStart, contentEnd).trim();
}

// 测试端点
app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    console.log('收到图片，大小:', req.file.size, 'bytes');

    const analysis = await analyzeImageWithClaude(req.file.buffer);

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size,
      model: 'claude-3.7-sonnet'
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
    service: 'Claude Vision Server',
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    model: 'anthropic/claude-3.7-sonnet'
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🤖 Claude视觉分析服务
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/analyze
模型: Claude 3.7 Sonnet

${process.env.OPENROUTER_API_KEY ? '✅ OpenRouter API已配置' : '❌ 缺少OpenRouter API密钥'}
==================================
  `);
});