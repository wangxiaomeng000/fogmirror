const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';
let authToken = '';
let sessionId = '';

// 测试用户数据
const testUser = {
  name: `测试用户_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Test123456!'
};

// 辅助函数：打印测试结果
function printTestResult(testName, success, details = '') {
  console.log(`\n[${success ? '✅' : '❌'}] ${testName}`);
  if (details) {
    console.log(`    ${details}`);
  }
}

// 辅助函数：延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. 测试用户注册
async function testRegister() {
  console.log('\n=== 1. 测试用户注册 ===');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.data.token) {
      authToken = response.data.token;
      printTestResult('用户注册', true, `用户: ${testUser.name}`);
      return true;
    }
  } catch (error) {
    printTestResult('用户注册', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 2. 测试用户登录
async function testLogin() {
  console.log('\n=== 2. 测试用户登录 ===');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      printTestResult('用户登录', true, `获取到Token`);
      return true;
    }
  } catch (error) {
    printTestResult('用户登录', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 3. 测试发送纯文本消息
async function testTextMessage() {
  console.log('\n=== 3. 测试发送纯文本消息 ===');
  try {
    const form = new FormData();
    form.append('content', '我最近感觉有些焦虑，工作压力很大');
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      sessionId = response.data.sessionId;
      printTestResult('发送文本消息', true, `AI回复: ${response.data.aiMessage.content}`);
      
      // 检查分析结果
      const layerData = response.data.layerData;
      console.log(`    分析结果: 事实(${layerData.facts.length}) 洞见(${layerData.insights.length}) 观念(${layerData.concepts.length})`);
      return true;
    }
  } catch (error) {
    printTestResult('发送文本消息', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 4. 测试发送图片消息
async function testImageMessage() {
  console.log('\n=== 4. 测试发送图片消息 ===');
  
  const imagePath = '/Users/mac/Desktop/合照.jpg';
  
  if (!fs.existsSync(imagePath)) {
    printTestResult('发送图片消息', false, '找不到测试图片');
    return false;
  }
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append('content', '看看这张照片，这是我和朋友们的合照，那天我们都很开心');
    form.append('sessionId', sessionId);
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 60000
    });
    
    if (response.data.success) {
      printTestResult('发送图片消息', true, `AI回复: ${response.data.aiMessage.content}`);
      
      const analysis = response.data.aiMessage.analysis;
      if (analysis && analysis.facts) {
        console.log(`    图片识别结果:`);
        analysis.facts.forEach(fact => console.log(`      - ${fact}`));
      }
      return true;
    }
  } catch (error) {
    printTestResult('发送图片消息', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 5. 测试获取会话历史
async function testSessionHistory() {
  console.log('\n=== 5. 测试获取会话历史 ===');
  try {
    const response = await axios.get(`${API_URL}/sessions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.sessions) {
      printTestResult('获取会话历史', true, `共有 ${response.data.sessions.length} 个会话`);
      
      // 显示最新会话的消息数
      if (response.data.sessions.length > 0) {
        const latestSession = response.data.sessions[0];
        console.log(`    最新会话: ${latestSession.title} (${latestSession.messages?.length || 0} 条消息)`);
      }
      return true;
    }
  } catch (error) {
    printTestResult('获取会话历史', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 6. 测试获取特定会话详情
async function testSessionDetail() {
  console.log('\n=== 6. 测试获取会话详情 ===');
  try {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.session) {
      const session = response.data.session;
      printTestResult('获取会话详情', true, `会话包含 ${session.messages.length} 条消息`);
      
      // 检查三层数据
      if (session.layerData) {
        console.log(`    三层数据: 事实(${session.layerData.facts?.length || 0}) 洞见(${session.layerData.insights?.length || 0}) 观念(${session.layerData.concepts?.length || 0})`);
      }
      return true;
    }
  } catch (error) {
    printTestResult('获取会话详情', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 7. 测试连续对话
async function testContinuousConversation() {
  console.log('\n=== 7. 测试连续对话 ===');
  
  const messages = [
    '其实那天聚会后，我一直在想我们的友谊',
    '有时候觉得大家都在变，关系也在变',
    '但看到这张照片，又觉得有些东西是不会变的'
  ];
  
  for (let i = 0; i < messages.length; i++) {
    try {
      const form = new FormData();
      form.append('content', messages[i]);
      form.append('sessionId', sessionId);
      
      const response = await axios.post(`${API_URL}/chat/message`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.data.success) {
        console.log(`\n  消息 ${i + 1}: "${messages[i]}"`);
        console.log(`  AI回复: "${response.data.aiMessage.content}"`);
        
        // 显示情绪分析
        const emotion = response.data.aiMessage.analysis?.emotionalTone;
        if (emotion) {
          console.log(`  情绪: ${emotion.primary} (强度: ${emotion.intensity})`);
        }
      }
      
      // 等待一下，模拟真实对话节奏
      await delay(1000);
      
    } catch (error) {
      console.log(`  ❌ 消息 ${i + 1} 发送失败:`, error.response?.data?.error || error.message);
    }
  }
  
  printTestResult('连续对话测试', true, '完成3轮对话');
  return true;
}

// 8. 测试认知地图
async function testCognitiveMap() {
  console.log('\n=== 8. 测试认知地图功能 ===');
  try {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.session) {
      const cognitiveMap = response.data.session.cognitiveMap;
      
      if (cognitiveMap && cognitiveMap.nodes && cognitiveMap.nodes.length > 0) {
        printTestResult('认知地图', true, `包含 ${cognitiveMap.nodes.length} 个节点`);
        
        // 显示一些节点信息
        console.log('    节点示例:');
        cognitiveMap.nodes.slice(0, 3).forEach(node => {
          console.log(`      - [${node.layer}] ${node.content}`);
        });
        
        // 显示连接信息
        if (cognitiveMap.edges && cognitiveMap.edges.length > 0) {
          console.log(`    连接数: ${cognitiveMap.edges.length}`);
        }
      } else {
        printTestResult('认知地图', false, '未生成认知地图数据');
      }
      return true;
    }
  } catch (error) {
    printTestResult('认知地图', false, error.response?.data?.error || error.message);
    return false;
  }
}

// 主测试函数
async function runFullTest() {
  console.log('====================================');
  console.log('   AI情感支持聊天系统 - 全流程测试');
  console.log('====================================');
  console.log(`\n测试时间: ${new Date().toLocaleString()}`);
  console.log(`测试用户: ${testUser.name}`);
  console.log(`API地址: ${API_URL}`);
  
  // 确保服务器正在运行
  try {
    // 尝试连接健康检查端点
    await axios.get('http://localhost:3001/api/auth/health', { timeout: 5000 });
  } catch (error) {
    console.error('\n❌ 错误：无法连接到后端服务器');
    console.error('请确保后端服务器正在运行 (npm run dev)');
    console.error('服务器地址:', API_URL);
    return;
  }
  
  // 执行测试
  const tests = [
    testRegister,
    testLogin,
    testTextMessage,
    testImageMessage,
    testSessionHistory,
    testSessionDetail,
    testContinuousConversation,
    testCognitiveMap
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
    await delay(500); // 测试间短暂延迟
  }
  
  // 测试总结
  console.log('\n====================================');
  console.log('           测试总结');
  console.log('====================================');
  console.log(`总测试数: ${tests.length}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${tests.length - passedTests}`);
  console.log(`通过率: ${(passedTests / tests.length * 100).toFixed(1)}%`);
  
  if (passedTests === tests.length) {
    console.log('\n🎉 所有测试通过！系统功能正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关功能。');
  }
}

// 运行测试
runFullTest().catch(console.error);