require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI Emotional Support Backend',
    ai: process.env.AI_SERVICE_TYPE || 'mock'
  });
});

app.post('/api/chat/message', async (req, res) => {
  const { content } = req.body;
  
  // 简单的模拟响应
  res.json({
    success: true,
    userMessage: {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now()
    },
    aiMessage: {
      id: (Date.now() + 1).toString(),
      content: `我理解你的感受。你提到了"${content.substring(0, 20)}..."，这很重要。让我们一起探讨这个话题。`,
      role: 'ai',
      timestamp: Date.now() + 100,
      analysis: {
        facts: ['你表达了自己的想法', '这是一个重要的话题'],
        insights: ['表达情感是健康的'],
        concepts: ['自我认知'],
        emotionalTone: {
          primary: '关切',
          intensity: 0.7,
          confidence: 0.8
        },
        suggestions: ['继续分享你的感受', '思考这个话题对你的意义']
      }
    },
    layerData: [],
    dynamicModel: {
      type: 'organism',
      parameters: {
        complexity: 0.5,
        coherence: 0.7,
        evolution: 0.3,
        patterns: []
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
  console.log(`AI Service: ${process.env.AI_SERVICE_TYPE || 'mock'}`);
  console.log('Test the health endpoint: http://localhost:' + PORT + '/api/health');
});