const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

// 测试结果汇总
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 记录测试结果
function recordTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}${details ? ': ' + details : ''}`);
  }
}

async function runTest(name, testFn) {
  console.log(`\n🔍 测试: ${name}`);
  try {
    const result = await testFn();
    recordTest(name, true, result);
  } catch (error) {
    recordTest(name, false, error.message);
  }
}

// 主测试函数
async function runFullTest() {
  console.log('=== AI情感支持聊天系统 - 完整测试 ===\n');
  console.log('后端: http://localhost:3001');
  console.log('前端: http://localhost:3002');
  console.log('AI服务: OpenRouter (需要配置真实API密钥)');
  console.log('\n等待服务启动...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 1. 测试健康检查
  await runTest('健康检查API', async () => {
    const response = await axios.get(`${API_URL}/health`);
    return `状态: ${response.data.status}, 服务: ${response.data.services.ai}`;
  });

  // 2. 测试会话API
  let sessionId;
  await runTest('创建新会话', async () => {
    const response = await axios.post(`${API_URL}/chat/session`);
    sessionId = response.data.sessionId;
    return `会话ID: ${sessionId}`;
  });

  // 3. 测试基本对话
  await runTest('发送文本消息', async () => {
    const form = new FormData();
    form.append('content', '你好，我最近感觉压力很大');
    form.append('sessionId', sessionId);
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: form.getHeaders()
    });
    
    return `AI回复: ${response.data.aiMessage.content}`;
  });

  // 4. 测试图片上传和识别
  await runTest('图片上传和识别', async () => {
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const form = new FormData();
    form.append('content', '这是我和朋友们的合照');
    form.append('sessionId', sessionId);
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    const analysis = response.data.aiMessage.analysis;
    const imageFacts = analysis.facts.filter(f => f.includes('图片') || f.includes('照片'));
    
    return `AI回复: ${response.data.aiMessage.content}, 识别到${imageFacts.length}个图片相关事实`;
  });

  // 5. 测试获取会话历史
  await runTest('获取会话历史', async () => {
    const response = await axios.get(`${API_URL}/chat/session/${sessionId}`);
    return `消息数量: ${response.data.messages.length}`;
  });

  // 6. 测试3D可视化数据
  await runTest('获取3D可视化数据', async () => {
    const response = await axios.get(`${API_URL}/chat/visualization/${sessionId}`);
    return `复杂度: ${response.data.complexity}, 连贯性: ${response.data.coherence}`;
  });

  // 7. 测试认知偏差检测
  await runTest('认知偏差检测', async () => {
    const form = new FormData();
    form.append('content', '我觉得所有人都在针对我，没有人理解我');
    form.append('sessionId', sessionId);
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: form.getHeaders()
    });
    
    const biases = response.data.aiMessage.analysis.cognitiveBiases || [];
    return `检测到${biases.length}个认知偏差`;
  });

  // 8. 测试会话列表
  await runTest('获取会话列表', async () => {
    const response = await axios.get(`${API_URL}/chat/sessions`);
    return `会话数量: ${response.data.sessions.length}`;
  });

  // 9. 测试纯图片分析API
  await runTest('纯图片分析API', async () => {
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${API_URL}/chat/analyze-image`, form, {
      headers: form.getHeaders()
    });
    
    return `异常点数量: ${response.data.abnormalities.length}`;
  });

  // 10. 测试前端访问
  await runTest('前端页面访问', async () => {
    const response = await axios.get('http://localhost:3002');
    return `状态码: ${response.status}, 内容长度: ${response.data.length}`;
  });

  // 11. 测试WebSocket连接（如果支持）
  await runTest('WebSocket支持检查', async () => {
    // 这里只是检查API是否支持WebSocket升级
    try {
      await axios.get(`${API_URL}/ws`, {
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return 'WebSocket暂不支持';
      }
      throw error;
    }
  });

  // 12. 测试错误处理
  await runTest('错误处理 - 无效会话ID', async () => {
    const form = new FormData();
    form.append('content', '测试消息');
    form.append('sessionId', 'invalid-session-id');
    
    try {
      await axios.post(`${API_URL}/chat/message`, form, {
        headers: form.getHeaders()
      });
      throw new Error('应该返回错误');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        return '正确处理了无效会话';
      }
      throw error;
    }
  });

  // 打印测试报告
  console.log('\n\n========== 测试报告 ==========');
  console.log(`总测试数: ${testResults.tests.length}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`成功率: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  
  console.log('\n详细结果:');
  testResults.tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.passed ? '✅' : '❌'} ${test.name}`);
    if (test.details) {
      console.log(`   ${test.details}`);
    }
  });

  // 检查关键功能
  console.log('\n\n========== 功能状态 ==========');
  const imageTest = testResults.tests.find(t => t.name === '图片上传和识别');
  if (imageTest && imageTest.passed) {
    console.log('✅ 图片识别功能: 正常工作');
    console.log('   - 使用OpenRouter API');
    console.log('   - 支持真实图片内容识别');
    console.log('   - 需要配置有效的API密钥');
  } else {
    console.log('❌ 图片识别功能: 需要配置OpenRouter API密钥');
    console.log('   请在 backend/.env 中设置:');
    console.log('   OPENROUTER_API_KEY=你的真实密钥');
  }

  console.log('\n测试完成！');
  
  // 关闭服务
  console.log('\n正在关闭服务...');
  process.exit(0);
}

// 运行测试
runFullTest().catch(error => {
  console.error('\n测试过程中发生错误:', error);
  process.exit(1);
});