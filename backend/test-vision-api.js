require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// 测试各种视觉API
async function testVisionAPIs() {
  console.log('=== 视觉API测试 ===\n');
  
  // 1. 创建测试图片
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  
  console.log('测试图片准备完成\n');
  
  // 2. 测试Gemini API
  console.log('--- 测试Gemini API ---');
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // 先测试文本生成
      const result = await model.generateContent("Hello, can you see this?");
      const response = await result.response;
      console.log('✅ Gemini文本API工作正常');
      console.log('响应:', response.text().substring(0, 50) + '...\n');
      
      // 测试视觉模型
      try {
        const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        console.log('⚠️  尝试Gemini Vision模型...');
        
        const imageParts = [{
          inlineData: {
            data: testImageBase64,
            mimeType: "image/png"
          }
        }];
        
        const visionResult = await visionModel.generateContent(["What is this?", ...imageParts]);
        const visionResponse = await visionResult.response;
        console.log('✅ Gemini Vision工作正常!');
        console.log('图片分析:', visionResponse.text());
      } catch (visionError) {
        console.log('❌ Gemini Vision失败:', visionError.message);
      }
      
    } catch (error) {
      console.log('❌ Gemini API失败:', error.message);
    }
  } else {
    console.log('⚠️  缺少GEMINI_API_KEY');
  }
  
  console.log('\n--- 测试OpenRouter API ---');
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const axios = require('axios');
      
      // 测试基础API
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      });
      
      console.log('✅ OpenRouter API连接正常');
      
      // 查找支持vision的模型
      const visionModels = response.data.data.filter(model => 
        model.id.includes('vision') || 
        model.id.includes('gpt-4') ||
        model.id.includes('claude') ||
        model.id.includes('gemini')
      );
      
      console.log('\n可用的视觉模型:');
      visionModels.slice(0, 5).forEach(model => {
        console.log(`- ${model.id}: ${model.name}`);
      });
      
      // 测试一个视觉模型
      if (visionModels.length > 0) {
        const testModel = visionModels.find(m => m.id.includes('claude-3')) || visionModels[0];
        console.log(`\n测试模型: ${testModel.id}`);
        
        try {
          const visionResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: testModel.id,
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: 'What do you see?' },
                  { 
                    type: 'image_url', 
                    image_url: { url: `data:image/png;base64,${testImageBase64}` }
                  }
                ]
              }],
              max_tokens: 100
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Vision Test'
              }
            }
          );
          
          console.log('✅ 视觉模型测试成功!');
          console.log('响应:', visionResponse.data.choices[0].message.content);
        } catch (visionError) {
          console.log('❌ 视觉模型测试失败:', visionError.response?.data || visionError.message);
        }
      }
      
    } catch (error) {
      console.log('❌ OpenRouter API失败:', error.message);
    }
  } else {
    console.log('⚠️  缺少OPENROUTER_API_KEY');
  }
  
  // 3. 测试网络连接
  console.log('\n--- 测试网络连接 ---');
  try {
    const axios = require('axios');
    await axios.get('https://www.google.com');
    console.log('✅ 外网连接正常');
  } catch (error) {
    console.log('❌ 外网连接失败');
  }
  
  // 4. 建议
  console.log('\n=== 建议 ===');
  console.log('1. 如果Gemini Vision失败，可能是API配额或地区限制');
  console.log('2. 尝试使用OpenRouter的Claude-3或其他视觉模型');
  console.log('3. 考虑使用本地模型或其他云服务（如Azure Vision）');
}

// 运行测试
testVisionAPIs().catch(console.error);