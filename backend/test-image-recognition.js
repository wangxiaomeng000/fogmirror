const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001/api';

async function testImageRecognition() {
  try {
    console.log('🚀 测试真实图片识别功能...\n');
    
    // 1. 注册用户
    console.log('1️⃣ 注册测试用户');
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `imgtest${Date.now()}@example.com`,
      password: 'password123',
      name: 'Image Test User'
    });
    const authToken = register.data.token;
    console.log('✅ 注册成功\n');
    
    // 2. 创建会话
    console.log('2️⃣ 创建会话');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    console.log('✅ 会话创建成功:', sessionId, '\n');
    
    // 3. 创建测试图片（包含多人的场景）
    console.log('3️⃣ 准备测试图片');
    
    // 创建一个包含文字的测试图片（使用Canvas创建的PNG图片）
    // 这是一个简单的1x1像素蓝色图片的base64编码
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    
    console.log('✅ 测试图片准备完成\n');
    
    // 4. 发送图片进行识别
    console.log('4️⃣ 发送图片进行识别');
    const formData = new FormData();
    formData.append('content', '这是我和朋友们的合照，你能看出来这是什么场景吗？');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'test-photo.png',
      contentType: 'image/png'
    });
    
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000 // 60秒超时
    });
    const endTime = Date.now();
    
    console.log('✅ 收到响应，耗时:', (endTime - startTime) / 1000, '秒\n');
    
    // 5. 分析响应
    console.log('5️⃣ 图片识别结果:');
    console.log('================');
    console.log('AI响应:', response.data.aiMessage.content);
    console.log('\n分析结果:');
    console.log(JSON.stringify(response.data.aiMessage.analysis, null, 2));
    
    if (response.data.layerData && response.data.layerData.length > 0) {
      console.log('\n层级数据:');
      console.log(JSON.stringify(response.data.layerData, null, 2));
    }
    
    console.log('\n✅ 图片识别测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('\n错误堆栈:', error.response.data.stack);
    }
  }
}

// 重启服务器并运行测试
console.log('正在重启服务器以使用Gemini服务...\n');
const { exec } = require('child_process');

// 杀死现有进程
exec('pkill -f "nodemon"', (err) => {
  setTimeout(() => {
    // 启动新服务器
    const server = exec('npm run dev');
    
    server.stdout.on('data', (data) => {
      if (data.includes('Server is running on port')) {
        console.log('✅ 服务器已启动\n');
        // 等待一下确保服务器完全就绪
        setTimeout(() => {
          testImageRecognition().then(() => {
            console.log('\n测试完成，正在关闭服务器...');
            process.exit(0);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error('服务器错误:', data);
    });
  }, 1000);
});