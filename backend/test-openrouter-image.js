require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const imageBase64 = fs.readFileSync('/tmp/test_landscape.jpg').toString('base64');

async function testOpenRouterImage() {
  console.log('测试OpenRouter图片识别...\n');
  
  const messages = [
    {
      role: 'system',
      content: '分析用户的消息和图片，返回JSON格式包含response, facts, insights等'
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '这是我拍的风景照片' },
        { 
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ];
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ai-emotional-support.app',
          'X-Title': 'AI Emotional Support Chat'
        }
      }
    );
    
    console.log('OpenRouter响应:');
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testOpenRouterImage();