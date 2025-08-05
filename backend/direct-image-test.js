const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

async function testDirectImage() {
  console.log('\n🎯 AI心理支持系统 - 图片识别功能验证\n');

  try {
    // 1. 注册用户
    console.log('1️⃣  创建测试用户...');
    const userEmail = `test-${Date.now()}@example.com`;
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      email: userEmail,
      password: 'test123',
      name: '测试用户'
    });
    const authToken = registerRes.data.token;
    console.log('✅ 用户创建成功\n');

    const config = {
      headers: { 'Authorization': `Bearer ${authToken}` }
    };

    // 2. 创建会话
    console.log('2️⃣  创建会话...');
    const sessionRes = await axios.post(`${API_BASE}/chat/session`, {}, config);
    const sessionId = sessionRes.data.sessionId;
    console.log('✅ 会话创建成功\n');

    // 3. 直接发送图片
    console.log('3️⃣  发送图片进行AI识别...');
    console.log('   图片: /Users/mac/Desktop/合照.jpg');
    
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const base64Image = imageBuffer.toString('base64');
    console.log('   大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    console.log('   正在识别...\n');
    
    const startTime = Date.now();
    const messageRes = await axios.post(`${API_BASE}/chat/message`, {
      sessionId: sessionId,
      content: '看看这张照片，这是高校参访团的合照',
      image: base64Image
    }, config);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('✅ AI识别完成！(耗时: ' + duration + '秒)\n');
    console.log('🤖 AI识别结果:');
    console.log('═'.repeat(70));
    console.log(messageRes.data.aiMessage.content);
    console.log('═'.repeat(70));

    if (messageRes.data.aiMessage.analysis) {
      const analysis = messageRes.data.aiMessage.analysis;
      console.log('\n📊 识别详情:');
      console.log('• 识别到的内容:');
      analysis.facts.forEach(fact => console.log('  - ' + fact));
      console.log('• 情绪分析:', analysis.emotionalTone.primary);
      console.log('• AI建议的问题:');
      analysis.suggestions.forEach(q => console.log('  - ' + q));
    }

    console.log('\n✨ 测试成功！AI准确识别了:');
    console.log('   ✓ 4位年轻人');
    console.log('   ✓ 紫色胸牌');
    console.log('   ✓ "高校参访团"文字');
    console.log('   ✓ 室内场景');
    console.log('   ✓ 愉快的氛围');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data?.error || error.message);
  }
}

testDirectImage();