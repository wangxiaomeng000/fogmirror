const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 打印带颜色的文本
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function print(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

async function runAutomatedTest() {
  print('\n' + '='.repeat(70), 'bright');
  print('🎭 心理支持系统 - 自动化全流程测试', 'bright');
  print('='.repeat(70) + '\n', 'bright');
  
  try {
    // 1. 系统检查
    print('⚙️  第一步：系统检查', 'yellow');
    const health = await axios.get(`${API_BASE}/health`);
    print('✅ 系统正常运行', 'green');
    print(`   - AI服务: ${health.data.services.ai}`, 'dim');
    print(`   - 数据库: ${health.data.services.database}`, 'dim');
    await delay(1000);
    
    // 2. 用户注册
    print('\n📝 第二步：模拟用户注册', 'yellow');
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: '测试用户小明'
    });
    const authToken = register.data.token;
    print('✅ 用户注册成功', 'green');
    print(`   - 用户名: ${register.data.user.name}`, 'dim');
    print(`   - 用户ID: ${register.data.user.id}`, 'dim');
    await delay(1000);
    
    // 3. 创建会话
    print('\n💬 第三步：创建咨询会话', 'yellow');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    print('✅ 会话创建成功', 'green');
    print(`   - 会话ID: ${sessionId}`, 'dim');
    await delay(1000);
    
    // 4. 上传照片（重点测试）
    print('\n🖼️  第四步：用户上传照片（不说话）', 'yellow');
    print('📷 上传文件: 合照.jpg', 'cyan');
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', ''); // 关键：用户只上传图片，不说话
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'hezhao.jpg',
      contentType: 'image/jpeg'
    });
    
    print('⏳ AI正在分析照片...', 'dim');
    const response1 = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    print('\n🤖 AI主动描述（这是关键）:', 'magenta');
    print(response1.data.aiMessage.content, 'bright');
    
    // 检查AI是否主动描述了图片
    const aiResponse1 = response1.data.aiMessage.content;
    const hasDescription = aiResponse1.includes('看到') || aiResponse1.includes('照片') || aiResponse1.includes('画面');
    const hasQuestion = aiResponse1.includes('？') || aiResponse1.includes('吗');
    
    if (hasDescription && hasQuestion) {
      print('\n✅ 测试通过：AI主动描述了图片并提出引导性问题', 'green');
    } else {
      print('\n❌ 测试失败：AI没有主动描述图片或引导对话', 'red');
    }
    
    await delay(2000);
    
    // 5. 用户被吸引后的第一次回应
    print('\n👤 第五步：用户被AI描述吸引，开始分享', 'yellow');
    const userMessage1 = '是的！你说得很对，这确实是一张很有意义的照片。这是我们大学毕业时拍的，那天刚答辩完。';
    print(`用户: ${userMessage1}`, 'cyan');
    
    const response2 = await axios.post(`${API_BASE}/chat/message`, {
      content: userMessage1,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    print('\n🤖 AI回应:', 'magenta');
    print(response2.data.aiMessage.content, 'bright');
    print(`\n情绪识别: ${response2.data.aiMessage.analysis.emotionalTone.primary}`, 'dim');
    await delay(2000);
    
    // 6. 用户深入分享
    print('\n👤 第六步：用户开始深入分享', 'yellow');
    const userMessage2 = '照片里左边第二个是我，旁边是我最好的朋友。我们四年都是室友，现在要各奔东西了，心里很舍不得...';
    print(`用户: ${userMessage2}`, 'cyan');
    
    const response3 = await axios.post(`${API_BASE}/chat/message`, {
      content: userMessage2,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    print('\n🤖 AI回应:', 'magenta');
    print(response3.data.aiMessage.content, 'bright');
    print(`\n情绪变化: ${response2.data.aiMessage.analysis.emotionalTone.primary} → ${response3.data.aiMessage.analysis.emotionalTone.primary}`, 'dim');
    await delay(2000);
    
    // 7. 分析整个对话
    print('\n📊 第七步：对话质量分析', 'yellow');
    
    const history = await axios.get(`${API_BASE}/chat/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    print(`\n对话统计:`, 'bright');
    print(`   - 总轮次: ${history.data.messages.length} 条消息`, 'dim');
    print(`   - 用户消息: ${history.data.messages.filter(m => m.role === 'user').length} 条`, 'dim');
    print(`   - AI消息: ${history.data.messages.filter(m => m.role === 'ai').length} 条`, 'dim');
    
    // 收集所有概念
    const allConcepts = new Set();
    const emotions = [];
    history.data.messages.forEach(msg => {
      if (msg.analysis) {
        if (msg.analysis.concepts) {
          msg.analysis.concepts.forEach(c => allConcepts.add(c));
        }
        if (msg.analysis.emotionalTone) {
          emotions.push(msg.analysis.emotionalTone.primary);
        }
      }
    });
    
    print(`\n识别到的主题:`, 'bright');
    print(`   ${Array.from(allConcepts).join(', ')}`, 'dim');
    
    print(`\n情绪轨迹:`, 'bright');
    print(`   ${emotions.join(' → ')}`, 'dim');
    
    // 8. 测试总结
    print('\n' + '='.repeat(70), 'bright');
    print('✅ 测试完成 - 系统表现总结', 'green');
    print('='.repeat(70), 'bright');
    
    const testResults = {
      '图片识别': aiResponse1.includes('清晰') || aiResponse1.includes('画面') ? '✅ 通过' : '❌ 失败',
      '主动描述': hasDescription ? '✅ 通过' : '❌ 失败',
      '引导提问': hasQuestion ? '✅ 通过' : '❌ 失败',
      '情绪识别': emotions.length > 0 ? '✅ 通过' : '❌ 失败',
      '对话深度': history.data.messages.length >= 6 ? '✅ 通过' : '❌ 失败'
    };
    
    Object.entries(testResults).forEach(([key, value]) => {
      print(`   ${key}: ${value}`, value.includes('通过') ? 'green' : 'red');
    });
    
    // 判断整体是否通过
    const allPassed = Object.values(testResults).every(v => v.includes('通过'));
    
    if (allPassed) {
      print('\n🎉 所有测试通过！系统可以正常使用。', 'green');
      print('\n关键成功点:', 'bright');
      print('1. AI能够主动描述上传的图片内容', 'dim');
      print('2. AI的描述能够吸引用户开始分享', 'dim');
      print('3. AI能够识别情绪变化并给予适当回应', 'dim');
      print('4. 整个对话流程自然且有深度', 'dim');
    } else {
      print('\n⚠️  部分测试未通过，需要优化。', 'yellow');
    }
    
  } catch (error) {
    print('\n❌ 测试出错:', 'red');
    console.error(error.response?.data || error.message);
    if (error.response?.data?.stack) {
      print('\n错误堆栈:', 'dim');
      console.error(error.response.data.stack);
    }
  }
}

// 主程序
const { exec } = require('child_process');

print('🚀 准备启动测试...', 'cyan');

// 确保使用 real-image 服务
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    print('📡 启动服务器...', 'dim');
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        print('✅ 服务器已就绪\n', 'green');
        setTimeout(() => {
          runAutomatedTest().then(() => {
            setTimeout(() => {
              print('\n🔚 测试结束，关闭服务器...', 'dim');
              server.kill();
              process.exit(0);
            }, 3000);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.includes('真实图片识别服务已初始化')) {
        print('✅ 图片识别服务已加载', 'green');
      }
    });
  }, 1000);
});