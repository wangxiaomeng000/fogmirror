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

// 测试多个视觉模型
const VISION_MODELS = [
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-opus',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'google/gemini-flash-1.5',
  'openai/gpt-4-vision-preview'
];

// 使用OpenRouter分析图片
async function analyzeImageWithModel(imageBuffer, modelName) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('缺少OpenRouter API密钥');
    }

    const imageBase64 = imageBuffer.toString('base64');
    
    console.log(`尝试模型: ${modelName}`);
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请描述这张图片的内容。'
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
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Vision Model Test',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log(`${modelName} 成功!`);
    return {
      model: modelName,
      success: true,
      content: content
    };
  } catch (error) {
    console.error(`${modelName} 失败:`, error.response?.data || error.message);
    return {
      model: modelName,
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// 测试所有模型
app.post('/api/vision/test-all', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    console.log('\n=== 测试所有视觉模型 ===');
    console.log('图片大小:', req.file.size, 'bytes');

    const results = [];
    
    for (const model of VISION_MODELS) {
      const result = await analyzeImageWithModel(req.file.buffer, model);
      results.push(result);
      // 短暂延迟避免频率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successfulModels = results.filter(r => r.success);
    
    res.json({
      totalModels: VISION_MODELS.length,
      successCount: successfulModels.length,
      results: results,
      recommendation: successfulModels.length > 0 ? successfulModels[0].model : null
    });

  } catch (error) {
    console.error('测试错误:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// 单个模型测试
app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const model = req.body.model || 'anthropic/claude-3-haiku';
    console.log('使用模型:', model);

    const result = await analyzeImageWithModel(req.file.buffer, model);
    
    if (result.success) {
      res.json({
        success: true,
        model: result.model,
        analysis: {
          原始描述: result.content,
          分析状态: 'success'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('分析错误:', error);
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
    service: 'OpenRouter Vision Test Server',
    availableModels: VISION_MODELS
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🔍 OpenRouter 视觉模型测试服务
==================================
地址: http://localhost:${PORT}
测试所有模型: POST /api/vision/test-all
单个模型分析: POST /api/vision/analyze

可用模型:
${VISION_MODELS.map(m => `  - ${m}`).join('\n')}
==================================
  `);
});