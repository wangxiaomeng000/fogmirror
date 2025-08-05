const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testSiliconFlowVision() {
  console.log('开始测试SiliconFlow Vision API...\n');

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
      timeout: 60000
    });

    console.log('\n✅ API调用成功！\n');
    
    // 提取AI响应
    const aiMessage = response.data.aiMessage;
    const layerData = response.data.layerData;
    
    console.log('AI响应:', aiMessage.content);
    console.log('\n分析结果:');
    console.log('- 事实层:', layerData?.facts?.length || 0, '条');
    console.log('- 洞见层:', layerData?.insights?.length || 0, '条');
    console.log('- 观念层:', layerData?.concepts?.length || 0, '条');
    console.log('- 情绪类型:', aiMessage.analysis?.emotionalTone?.primary);
    
    if (layerData) {
      console.log('\n详细分析:');
      console.log('事实:', layerData.facts || []);
      console.log('洞见:', layerData.insights || []);
      console.log('概念:', layerData.concepts || []);
    }
    
    if (aiMessage.analysis) {
      console.log('\nAI分析详情:');
      console.log('情绪强度:', aiMessage.analysis.emotionalTone?.intensity);
      console.log('置信度:', aiMessage.analysis.emotionalTone?.confidence);
    }
    
    console.log('\n调试信息:');
    console.log('使用的AI服务:', response.data.debug?.aiServiceName);
    console.log('包含图片:', response.data.debug?.hasImage);

  } catch (error) {
    console.error('\n❌ API调用失败:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 等待服务器重启
console.log('=== SiliconFlow Vision API 测试 ===\n');
console.log('等待服务器重启...');
setTimeout(() => {
  testSiliconFlowVision();
}, 3000);