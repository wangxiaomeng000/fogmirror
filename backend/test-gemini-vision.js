const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testGeminiVision() {
  console.log('开始测试Gemini Vision API...\n');

  // 读取桌面上的合照
  const imagePath = '/Users/mac/Desktop/合照.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.error('错误：找不到测试图片:', imagePath);
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  console.log('✅ 成功读取图片，大小:', (imageBuffer.length / 1024).toFixed(2), 'KB\n');

  // 创建表单数据
  const form = new FormData();
  form.append('content', '看看这张照片，这是我和朋友们的合照');
  form.append('image', imageBuffer, {
    filename: '合照.jpg',
    contentType: 'image/jpeg'
  });

  try {
    console.log('正在发送请求到后端API...');
    const response = await axios.post('http://localhost:3001/api/chat/message', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token'
      },
      timeout: 60000 // 增加超时时间到60秒
    });

    console.log('\n✅ API调用成功！\n');
    console.log('AI响应:', response.data.response);
    console.log('\n分析结果:');
    console.log('- 事实层:', response.data.analysis.facts.length, '条');
    console.log('- 洞见层:', response.data.analysis.insights.length, '条');
    console.log('- 观念层:', response.data.analysis.concepts.length, '条');
    console.log('- 情绪类型:', response.data.analysis.emotionalTone?.primary);
    
    console.log('\n详细分析:');
    console.log('事实:', response.data.analysis.facts);
    console.log('洞见:', response.data.analysis.insights);
    console.log('概念:', response.data.analysis.concepts);
    
    if (response.data.analysis.imageAnalysis) {
      console.log('\n图片分析:', response.data.analysis.imageAnalysis);
    }

  } catch (error) {
    console.error('\n❌ API调用失败:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

console.log('=== Gemini Vision API 测试 ===\n');
testGeminiVision();