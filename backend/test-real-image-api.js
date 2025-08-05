const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

async function testRealImageAPI() {
  try {
    console.log('🎯 测试真实图片识别API\n');
    console.log('使用服务: real-image (基于图片特征的真实分析)\n');
    
    // 检查照片
    if (!fs.existsSync(PHOTO_PATH)) {
      console.error('❌ 找不到测试照片:', PHOTO_PATH);
      return;
    }
    
    const stats = fs.statSync(PHOTO_PATH);
    console.log('📷 照片信息:');
    console.log('  路径:', PHOTO_PATH);
    console.log('  大小:', (stats.size / 1024).toFixed(2), 'KB');
    console.log('  修改时间:', stats.mtime.toLocaleString());
    console.log('\n');
    
    // 1. 检查服务状态
    console.log('1️⃣ 检查服务状态');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 系统状态:', health.data);
    console.log('\n');
    
    // 2. 创建测试用户
    console.log('2️⃣ 创建测试用户');
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `realtest${Date.now()}@example.com`,
      password: 'password123',
      name: 'Real Image Test'
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
    
    // 4. 测试图片识别
    console.log('4️⃣ 发送真实照片进行识别');
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', '这是我和大学同学的合照，大家刚刚完成了毕业答辩，心情都很激动');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'graduation-photo.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('正在分析照片...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000
    });
    
    const endTime = Date.now();
    console.log(`✅ 分析完成！耗时: ${(endTime - startTime) / 1000}秒\n`);
    
    // 显示结果
    console.log('='.repeat(60));
    console.log('📊 图片识别结果');
    console.log('='.repeat(60));
    
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
    
    console.log('\n🏷️ 相关概念:');
    console.log('  ', analysis.concepts.join(', '));
    
    console.log('\n😊 情绪分析:');
    console.log(`   主要情绪: ${analysis.emotionalTone.primary}`);
    console.log(`   强度: ${analysis.emotionalTone.intensity}`);
    console.log(`   置信度: ${analysis.emotionalTone.confidence}`);
    
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      console.log('\n💬 引导建议:');
      analysis.suggestions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 5. 测试后续对话
    console.log('5️⃣ 测试后续对话');
    
    const followUp = await axios.post(`${API_BASE}/chat/message`, 
      {
        content: '是的，那天大家都很开心，虽然即将分别，但我们约定要保持联系',
        sessionId: sessionId
      },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n【用户】是的，那天大家都很开心，虽然即将分别，但我们约定要保持联系');
    console.log('【AI】', followUp.data.aiMessage.content);
    console.log('\n情绪变化:', followUp.data.aiMessage.analysis.emotionalTone);
    
    // 6. 测试另一种场景
    console.log('\n\n6️⃣ 测试另一种图片场景（不上传实际图片）');
    
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const smallImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    const formData2 = new FormData();
    formData2.append('content', '看看这张风景照，是我去年旅行时拍的');
    formData2.append('sessionId', sessionId);
    formData2.append('image', smallImageBuffer, {
      filename: 'landscape.png',
      contentType: 'image/png'
    });
    
    const response2 = await axios.post(`${API_BASE}/chat/message`, formData2, {
      headers: {
        ...formData2.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('\n【场景2 - 风景照】');
    console.log('AI回复:', response2.data.aiMessage.content);
    console.log('图片特征:', response2.data.aiMessage.analysis.facts[0]);
    
    console.log('\n\n✅ 所有测试完成！真实图片识别功能正常工作。');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('\n错误堆栈:', error.response.data.stack);
    }
  }
}

// 主程序
const { exec } = require('child_process');

console.log('准备启动服务器...\n');

// 杀死现有进程
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    console.log('启动服务器（使用 real-image 服务）...\n');
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        console.log('\n服务器已就绪！\n');
        setTimeout(() => {
          testRealImageAPI().then(() => {
            console.log('\n关闭服务器...');
            server.kill();
            setTimeout(() => process.exit(0), 1000);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (!data.includes('ExperimentalWarning') && 
          !data.includes('真实图片识别服务已初始化')) {
        process.stderr.write(data);
      }
      if (data.includes('真实图片识别服务已初始化')) {
        console.log('✅ 真实图片识别服务已加载');
      }
    });
  }, 1000);
});