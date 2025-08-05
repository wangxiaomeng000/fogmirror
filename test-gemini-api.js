const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testGeminiAPI() {
  console.log('=== 测试 Gemini API ===\n');
  
  try {
    // 初始化 Gemini
    const genAI = new GoogleGenerativeAI('AIzaSyAvKVLijPt8kojQW6xLRdIEnUaTL2b9v9k');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 读取图片
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('正在调用 Gemini API 分析图片...\n');
    
    // 调用 API
    const result = await model.generateContent([
      '请详细描述这张图片的内容，包括场景、人物、物品、氛围等。',
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini API 响应成功！\n');
    console.log('图片描述：');
    console.log(text);
    
  } catch (error) {
    console.error('Gemini API 测试失败：');
    console.error('错误类型：', error.name);
    console.error('错误信息：', error.message);
    if (error.response) {
      console.error('响应状态：', error.response.status);
      console.error('响应数据：', error.response.data);
    }
  }
}

testGeminiAPI();