require('dotenv').config();
const express = require('express');
const { aiServiceFactory } = require('./dist/services/ai/aiServiceFactory');

const app = express();
app.use(express.json());

console.log('\n=== 测试服务器启动 ===');
console.log('AI_SERVICE_TYPE:', process.env.AI_SERVICE_TYPE);

app.post('/test', async (req, res) => {
  try {
    console.log('\n--- 新请求 ---');
    const service = aiServiceFactory.getCurrentService();
    console.log('服务名称:', service.name);
    console.log('服务类型:', service.constructor.name);
    
    const result = await service.analyzeMessage(
      req.body.content || 'test',
      req.body.imageBase64
    );
    
    res.json({
      serviceName: service.name,
      response: result.response,
      hasImageRecognition: !!result.analysis.facts.find(f => f.includes('图片识别'))
    });
  } catch (error) {
    console.error('错误:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log('测试服务器运行在 http://localhost:3002');
  console.log('使用: curl -X POST http://localhost:3002/test -H "Content-Type: application/json" -d \'{"content":"test"}\'');
});