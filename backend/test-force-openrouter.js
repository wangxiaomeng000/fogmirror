require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { OpenRouterService } = require('./dist/services/ai/openRouterService');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 强制创建OpenRouter服务
const openRouterService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'openai/gpt-4o-mini'
});

console.log('✅ 强制使用OpenRouter服务');
console.log('服务名称:', openRouterService.name);

app.post('/test-image', upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const imageFile = req.file;
    
    let imageBase64;
    if (imageFile) {
      imageBase64 = imageFile.buffer.toString('base64');
      console.log('收到图片，大小:', imageFile.size, 'bytes');
    }
    
    console.log('内容:', content);
    console.log('开始分析...');
    
    const result = await openRouterService.analyzeMessage(
      content || '分享一张照片',
      imageBase64
    );
    
    console.log('\n分析结果:');
    console.log('回复:', result.response);
    console.log('事实:', result.analysis.facts);
    
    res.json({
      success: true,
      service: 'openrouter',
      response: result.response,
      facts: result.analysis.facts,
      hasImageRecognition: result.analysis.facts.some(f => 
        f.includes('四个人') || f.includes('合照') || f.includes('微笑') || 
        f.includes('名牌') || f.includes('手势')
      )
    });
  } catch (error) {
    console.error('错误:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`\n测试服务器运行在 http://localhost:${PORT}`);
  console.log('测试命令:');
  console.log(`curl -X POST http://localhost:${PORT}/test-image -F "content=这是我们的合照" -F "image=@/Users/mac/Desktop/合照.jpg"`);
});