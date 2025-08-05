import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

console.log('测试 Gemini API 连接...\n');

const apiKey = 'AIzaSyBGFJ2I0p8HTe9RjHEaR3U_M3rJ8wfx9Ck';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGeminiText() {
  console.log('1. 测试纯文本生成...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in Chinese');
    const response = await result.response;
    console.log('✅ 文本生成成功:', response.text());
    return true;
  } catch (error: any) {
    console.error('❌ 文本生成失败:', error.message);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    return false;
  }
}

async function testGeminiImage() {
  console.log('\n2. 测试图片识别...');
  try {
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      '请描述这张图片的内容',
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);
    
    const response = await result.response;
    console.log('✅ 图片识别成功:', response.text());
    return true;
  } catch (error: any) {
    console.error('❌ 图片识别失败:', error.message);
    return false;
  }
}

// 运行测试
(async () => {
  const textSuccess = await testGeminiText();
  const imageSuccess = await testGeminiImage();
  
  if (!textSuccess || !imageSuccess) {
    console.log('\n\nGemini API 连接失败！');
    console.log('正在尝试使用 OpenRouter API...');
    
    // 切换到 OpenRouter
    const env = fs.readFileSync('.env', 'utf8');
    const newEnv = env.replace('AI_SERVICE_TYPE=gemini', 'AI_SERVICE_TYPE=openrouter');
    fs.writeFileSync('.env', newEnv);
    
    console.log('✅ 已切换到 OpenRouter API');
    console.log('请重启服务以使用 OpenRouter');
  } else {
    console.log('\n\n✅ Gemini API 工作正常！');
  }
})();