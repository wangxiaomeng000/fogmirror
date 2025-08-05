const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testImageRecognition() {
  try {
    // 读取桌面上的合照
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('图片大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    // 先创建会话
    console.log('\n1. 创建会话...');
    const sessionResponse = await axios.post('http://localhost:3001/api/chat/session', {});
    const sessionId = sessionResponse.data.sessionId;
    console.log('会话ID:', sessionId);
    
    // 发送图片进行分析
    console.log('\n2. 发送图片进行分析...');
    
    // 使用 FormData 来发送图片
    const FormData = require('form-data');
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('content', '这是我和朋友的合照，你能看到什么？');
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    const chatResponse = await axios.post('http://localhost:3001/api/chat/message', form, {
      headers: form.getHeaders()
    });
    
    console.log('\n3. AI响应:');
    console.log('完整响应:', JSON.stringify(chatResponse.data, null, 2));
    
    if (chatResponse.data.success) {
      console.log('\n消息内容:', chatResponse.data.message?.content);
      console.log('\n分析结果:');
      console.log(JSON.stringify(chatResponse.data.message?.analysis, null, 2));
    } else {
      console.log('请求失败:', chatResponse.data.error);
    }
    
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

// 等待服务器启动后执行
setTimeout(() => {
  console.log('开始测试图片识别功能...');
  testImageRecognition();
}, 2000);