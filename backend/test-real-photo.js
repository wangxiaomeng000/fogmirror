const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

async function testRealPhoto() {
  try {
    console.log('🖼️  测试真实照片识别功能\n');
    console.log('照片路径:', PHOTO_PATH);
    
    // 检查文件是否存在
    if (!fs.existsSync(PHOTO_PATH)) {
      console.error('❌ 照片文件不存在');
      return;
    }
    
    const stats = fs.statSync(PHOTO_PATH);
    console.log('文件大小:', (stats.size / 1024).toFixed(2), 'KB\n');
    
    // 1. 注册用户
    console.log('1️⃣ 注册测试用户');
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `realphoto${Date.now()}@example.com`,
      password: 'password123',
      name: 'Real Photo Test'
    });
    const authToken = register.data.token;
    console.log('✅ 注册成功\n');
    
    // 2. 创建会话
    console.log('2️⃣ 创建会话');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    console.log('✅ 会话ID:', sessionId, '\n');
    
    // 3. 发送照片进行识别
    console.log('3️⃣ 发送照片进行AI识别');
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', '请帮我看看这张合照，描述一下你看到了什么？有几个人？他们在做什么？');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'group-photo.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('正在上传并分析照片...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000
    });
    
    const endTime = Date.now();
    console.log(`\n✅ 分析完成！耗时: ${(endTime - startTime) / 1000}秒\n`);
    
    // 4. 显示识别结果
    console.log('=== AI 识别结果 ===');
    console.log('\n【AI回复】');
    console.log(response.data.aiMessage.content);
    
    console.log('\n【详细分析】');
    const analysis = response.data.aiMessage.analysis;
    
    console.log('\n📌 识别到的事实:');
    analysis.facts.forEach((fact, i) => {
      console.log(`  ${i+1}. ${fact}`);
    });
    
    console.log('\n💡 深层洞察:');
    analysis.insights.forEach((insight, i) => {
      console.log(`  ${i+1}. ${insight}`);
    });
    
    console.log('\n🏷️  相关概念:');
    console.log('  ', analysis.concepts.join(', '));
    
    console.log('\n😊 情绪分析:');
    console.log(`   主要情绪: ${analysis.emotionalTone.primary}`);
    console.log(`   强度: ${analysis.emotionalTone.intensity}`);
    console.log(`   置信度: ${analysis.emotionalTone.confidence}`);
    
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      console.log('\n💬 引导问题:');
      analysis.suggestions.forEach((q, i) => {
        console.log(`  ${i+1}. ${q}`);
      });
    }
    
    console.log('\n===================\n');
    
    // 5. 追问测试
    console.log('4️⃣ 发送追问');
    const followUp = await axios.post(`${API_BASE}/chat/message`, 
      {
        content: '这张照片对我来说很重要，是和大学同学的最后一次聚会',
        sessionId: sessionId
      },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n【用户】这张照片对我来说很重要，是和大学同学的最后一次聚会');
    console.log('【AI】', followUp.data.aiMessage.content);
    
    console.log('\n✅ 真实照片识别测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('\n错误详情:', error.response.data.stack);
    }
  }
}

// 主程序
const { exec } = require('child_process');

// 确保使用freevision服务
console.log('配置AI服务为 freevision...\n');

// 先杀死现有服务
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    console.log('启动服务器...\n');
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        console.log('\n服务器已就绪！\n');
        setTimeout(() => {
          testRealPhoto().then(() => {
            console.log('\n关闭服务器...');
            server.kill();
            setTimeout(() => process.exit(0), 1000);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (!data.includes('ExperimentalWarning')) {
        process.stderr.write(data);
      }
    });
  }, 1000);
});