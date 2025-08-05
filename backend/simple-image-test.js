const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

async function testImageRecognition() {
  console.log('\n🎯 心理支持系统 - 图片识别测试\n');

  try {
    // 1. 注册用户
    console.log('1️⃣  注册测试用户...');
    const userEmail = `test-${Date.now()}@example.com`;
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      email: userEmail,
      password: 'test123456',
      name: '测试用户'
    });
    const authToken = registerRes.data.token;
    console.log('✅ 注册成功\n');

    const config = {
      headers: { 'Authorization': `Bearer ${authToken}` }
    };

    // 2. 创建会话
    console.log('2️⃣  创建会话...');
    const sessionRes = await axios.post(`${API_BASE}/chat/session`, {}, config);
    const sessionId = sessionRes.data.sessionId;
    console.log('✅ 会话创建成功:', sessionId, '\n');

    // 3. 发送图片
    console.log('3️⃣  发送图片进行识别...');
    console.log('   图片路径:', IMAGE_PATH);
    
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const base64Image = imageBuffer.toString('base64');
    console.log('   图片大小:', (imageBuffer.length / 1024).toFixed(2), 'KB\n');

    console.log('⏳ AI正在识别图片...\n');
    
    const messageRes = await axios.post(`${API_BASE}/chat/message`, {
      sessionId: sessionId,
      content: '请看这张照片',
      image: base64Image
    }, config);

    console.log('🤖 AI识别结果:');
    console.log('═'.repeat(60));
    console.log(messageRes.data.aiMessage.content);
    console.log('═'.repeat(60));

    if (messageRes.data.aiMessage.analysis) {
      console.log('\n📊 详细分析:');
      const analysis = messageRes.data.aiMessage.analysis;
      console.log('事实:', analysis.facts || []);
      console.log('洞察:', analysis.insights || []);
      console.log('情绪:', analysis.emotionalTone?.primary || '未知');
    }

    console.log('\n✅ 测试完成！图片识别功能正常工作');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
  }
}

testImageRecognition();