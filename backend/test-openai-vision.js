const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

async function testOpenAIVision() {
  try {
    console.log('🎯 OpenAI GPT-4 Vision 真实图片识别测试\n');
    console.log('照片路径:', PHOTO_PATH);
    
    // 检查文件
    if (!fs.existsSync(PHOTO_PATH)) {
      console.error('❌ 照片文件不存在');
      return;
    }
    
    const stats = fs.statSync(PHOTO_PATH);
    console.log('文件大小:', (stats.size / 1024).toFixed(2), 'KB\n');
    
    // 1. 检查服务状态
    console.log('1️⃣ 检查服务状态');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 系统状态:', health.data);
    console.log('\n');
    
    // 2. 注册用户
    console.log('2️⃣ 创建测试用户');
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `vision${Date.now()}@example.com`,
      password: 'password123',
      name: 'Vision Test User'
    });
    const authToken = register.data.token;
    console.log('✅ 用户创建成功\n');
    
    // 3. 创建会话
    console.log('3️⃣ 创建会话');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    console.log('✅ 会话ID:', sessionId, '\n');
    
    // 4. 发送照片进行识别
    console.log('4️⃣ 使用 OpenAI GPT-4 Vision 识别照片');
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', '请详细描述这张照片：有几个人？他们在哪里？看起来在做什么？氛围如何？');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'group-photo.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('正在上传并分析照片（可能需要10-30秒）...');
    const startTime = Date.now();
    
    try {
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
      
      // 显示结果
      console.log('='.repeat(50));
      console.log('🖼️  OpenAI Vision 识别结果');
      console.log('='.repeat(50));
      
      console.log('\n【AI回复】');
      console.log(response.data.aiMessage.content);
      
      console.log('\n【详细分析】');
      const analysis = response.data.aiMessage.analysis;
      
      console.log('\n📌 识别到的事实:');
      if (analysis.facts && analysis.facts.length > 0) {
        analysis.facts.forEach((fact, i) => {
          console.log(`  ${i+1}. ${fact}`);
        });
      }
      
      console.log('\n💡 深层洞察:');
      if (analysis.insights && analysis.insights.length > 0) {
        analysis.insights.forEach((insight, i) => {
          console.log(`  ${i+1}. ${insight}`);
        });
      }
      
      console.log('\n🏷️  相关概念:');
      if (analysis.concepts && analysis.concepts.length > 0) {
        console.log('  ', analysis.concepts.join(', '));
      }
      
      console.log('\n😊 情绪分析:');
      if (analysis.emotionalTone) {
        console.log(`   主要情绪: ${analysis.emotionalTone.primary}`);
        console.log(`   强度: ${analysis.emotionalTone.intensity}`);
        console.log(`   置信度: ${analysis.emotionalTone.confidence}`);
      }
      
      if (analysis.suggestions && analysis.suggestions.length > 0) {
        console.log('\n💬 建议/问题:');
        analysis.suggestions.forEach((s, i) => {
          console.log(`  ${i+1}. ${s}`);
        });
      }
      
      console.log('\n' + '='.repeat(50));
      
    } catch (error) {
      console.error('\n❌ 图片识别失败:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        console.error('错误详情:', JSON.stringify(error.response.data.error, null, 2));
      }
    }
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
  }
}

// 主程序
const { exec } = require('child_process');

console.log('准备使用 OpenAI Vision 服务...\n');

// 杀死现有服务
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
          testOpenAIVision().then(() => {
            console.log('\n关闭服务器...');
            server.kill();
            setTimeout(() => process.exit(0), 1000);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (!data.includes('ExperimentalWarning') && !data.includes('OpenAI视觉识别服务已初始化')) {
        process.stderr.write(data);
      }
      if (data.includes('OpenAI视觉识别服务已初始化')) {
        console.log('✅ OpenAI Vision 服务已加载');
      }
    });
  }, 1000);
});