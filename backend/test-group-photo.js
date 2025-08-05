require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function testGroupPhoto() {
  console.log('测试合照图片识别...\n');
  
  const imageBase64 = fs.readFileSync('/tmp/group_photo_base64.txt', 'utf8').trim();
  
  const messages = [
    {
      role: 'system',
      content: `你是一个心理咨询师。分析用户的消息和图片，返回JSON格式：
{
  "response": "简短回应（少于10个字）",
  "facts": ["具体事实，包括图片中的内容"],
  "insights": ["洞察"],
  "concepts": ["概念"],
  "emotionalTone": {"primary": "情绪", "intensity": 0-1, "confidence": 0-1}
}`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: '这是我们参加活动时的合照，很开心' },
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
    console.log('正在调用OpenRouter API...');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ai-emotional-support.app',
          'X-Title': 'AI Emotional Support Chat',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('成功！AI响应:');
    console.log(response.data.choices[0].message.content);
    
    // 尝试解析JSON
    try {
      const result = JSON.parse(response.data.choices[0].message.content);
      console.log('\n解析后的结果:');
      console.log('回复:', result.response);
      console.log('事实:', result.facts);
      console.log('包含图片描述:', result.facts.some(f => f.includes('四个人') || f.includes('合照') || f.includes('紫色')));
    } catch (e) {
      console.log('(JSON解析失败，但响应有效)');
    }
    
  } catch (error) {
    console.error('\n错误详情:');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.metadata?.raw) {
      console.error('原始错误:', error.response.data.error.metadata.raw);
    }
  }
}

testGroupPhoto();