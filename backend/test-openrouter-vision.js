const axios = require('axios');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001/api';

async function testOpenRouterVision() {
  try {
    console.log('🚀 测试 OpenRouter 图片识别功能...\n');
    
    // 1. 健康检查
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 服务状态:', health.data);
    console.log('\n');
    
    // 2. 注册用户
    const email = `vision${Date.now()}@example.com`;
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: email,
      password: 'password123',
      name: 'Vision Test User'
    });
    const authToken = register.data.token;
    console.log('✅ 用户注册成功\n');
    
    // 3. 创建会话
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    console.log('✅ 会话创建成功:', sessionId, '\n');
    
    // 4. 测试纯文本消息
    console.log('📝 测试纯文本消息...');
    const textResponse = await axios.post(`${API_BASE}/chat/message`, 
      {
        content: '你好，今天心情不错',
        sessionId: sessionId
      },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ 文本消息响应:', textResponse.data.aiMessage.content);
    console.log('\n');
    
    // 5. 测试图片识别
    console.log('🖼️ 测试图片识别...');
    
    // 使用一个真实的测试图片 (1x1 红色像素)
    const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(redPixelBase64, 'base64');
    
    const formData = new FormData();
    formData.append('content', '看看这张照片，这是我和朋友们在公园的合影');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'park-photo.png',
      contentType: 'image/png'
    });
    
    console.log('发送图片请求...');
    const startTime = Date.now();
    
    try {
      const imageResponse = await axios.post(`${API_BASE}/chat/message`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000
      });
      
      const endTime = Date.now();
      console.log(`✅ 图片识别成功，耗时: ${(endTime - startTime) / 1000}秒`);
      console.log('\nAI响应:', imageResponse.data.aiMessage.content);
      console.log('\n分析数据:');
      console.log(JSON.stringify(imageResponse.data.aiMessage.analysis, null, 2));
      
    } catch (error) {
      console.error('❌ 图片识别失败:', error.response?.data || error.message);
    }
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 先杀死现有服务器进程
const { exec } = require('child_process');
console.log('正在重启服务器...\n');

exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    const server = exec('npm run dev');
    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
      if (!serverReady && data.includes('Server is running on port')) {
        serverReady = true;
        console.log('\n服务器已就绪，开始测试...\n');
        setTimeout(() => {
          testOpenRouterVision().then(() => {
            console.log('\n关闭服务器...');
            server.kill();
            process.exit(0);
          }).catch(err => {
            console.error('测试出错:', err);
            server.kill();
            process.exit(1);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  }, 1000);
});