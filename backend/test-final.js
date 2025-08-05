const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

async function runFinalTest() {
  console.log('🚀 心理支持系统后端测试\n');
  console.log('当前AI服务: freevision (免费视觉服务)\n');
  
  try {
    // 1. 健康检查
    console.log('1️⃣ 健康检查');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 系统状态:', health.data);
    console.log('\n');
    
    // 2. 用户注册
    console.log('2️⃣ 用户注册');
    const email = `final${Date.now()}@example.com`;
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: email,
      password: 'password123',
      name: 'Final Test User'
    });
    const authToken = register.data.token;
    console.log('✅ 注册成功:', {
      user: register.data.user,
      hasToken: !!authToken
    });
    console.log('\n');
    
    // 3. 创建会话
    console.log('3️⃣ 创建会话');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    console.log('✅ 会话ID:', sessionId);
    console.log('\n');
    
    // 4. 测试文本对话
    console.log('4️⃣ 文本对话测试');
    const messages = [
      '你好，我最近感到压力很大',
      '工作上有很多任务要完成',
      '我担心完不成'
    ];
    
    for (const msg of messages) {
      console.log(`\n用户: ${msg}`);
      const response = await axios.post(`${API_BASE}/chat/message`, 
        {
          content: msg,
          sessionId: sessionId
        },
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`AI: ${response.data.aiMessage.content}`);
      console.log('情绪分析:', response.data.aiMessage.analysis.emotionalTone);
    }
    console.log('\n');
    
    // 5. 测试图片识别
    console.log('5️⃣ 图片识别测试');
    
    // 使用base64编码的测试图片（蓝色方块）
    const blueSquareBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(blueSquareBase64, 'base64');
    
    const formData = new FormData();
    formData.append('content', '看看这张照片，这是我和朋友们的聚会');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'party.png',
      contentType: 'image/png'
    });
    
    console.log('\n发送图片...');
    const imageResponse = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('\n图片识别结果:');
    console.log('AI响应:', imageResponse.data.aiMessage.content);
    console.log('\n分析内容:');
    const analysis = imageResponse.data.aiMessage.analysis;
    console.log('- 事实:', analysis.facts);
    console.log('- 洞察:', analysis.insights);
    console.log('- 情绪:', analysis.emotionalTone);
    console.log('\n');
    
    // 6. 获取会话历史
    console.log('6️⃣ 会话历史');
    const history = await axios.get(`${API_BASE}/chat/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`总共 ${history.data.messages.length} 条消息`);
    console.log('最近3条:');
    history.data.messages.slice(-3).forEach((msg, i) => {
      console.log(`  ${i+1}. [${msg.role}] ${msg.content?.substring(0, 30)}...${msg.image ? ' (含图片)' : ''}`);
    });
    
    console.log('\n✅ 所有测试完成！系统运行正常。');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
  }
}

// 主程序
const { exec } = require('child_process');

console.log('正在启动服务器...\n');
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      if (data.includes('Server is running on port') && !ready) {
        ready = true;
        console.log('服务器已就绪\n');
        setTimeout(() => {
          runFinalTest().then(() => {
            console.log('\n关闭服务器...');
            server.kill();
            process.exit(0);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.includes('免费视觉服务已初始化')) {
        console.log('✅ FreeVision服务已加载');
      }
    });
  }, 1000);
});