const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const API_URL = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

// 测试结果收集
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 工具函数
function log(message, type = 'info') {
  const types = {
    info: '📋',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  };
  console.log(`${types[type] || '📋'} ${message}`);
}

async function runTest(name, testFn) {
  log(`运行测试: ${name}`);
  try {
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
    log(`${name} - 通过`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
    log(`${name} - 失败: ${error.message}`, 'error');
    console.error(error);
  }
  console.log('');
}

// 测试函数
async function testHealthCheck() {
  const response = await axios.get(`${API_URL}/health`);
  if (response.data.status !== 'ok') {
    throw new Error('健康检查失败');
  }
}

async function testCreateSession() {
  const response = await axios.post(`${API_URL}/chat/session`);
  if (!response.data.sessionId) {
    throw new Error('创建会话失败');
  }
  return response.data.sessionId;
}

async function testTextMessage(sessionId) {
  const response = await axios.post(`${API_URL}/chat/message`, {
    content: '我今天感觉有点焦虑',
    sessionId
  });
  
  if (!response.data.success) {
    throw new Error('发送文本消息失败');
  }
  
  const { aiMessage } = response.data;
  if (!aiMessage.content || !aiMessage.analysis) {
    throw new Error('AI响应格式不正确');
  }
  
  // 验证分析结果
  if (!aiMessage.analysis.facts || !aiMessage.analysis.insights || !aiMessage.analysis.emotionalTone) {
    throw new Error('分析结果不完整');
  }
  
  log(`AI回复: ${aiMessage.content.substring(0, 50)}...`);
  log(`情绪识别: ${aiMessage.analysis.emotionalTone.primary}`);
}

async function testImageRecognition(sessionId) {
  const imageBuffer = fs.readFileSync(IMAGE_PATH);
  const imageBase64 = imageBuffer.toString('base64');
  
  const response = await axios.post(`${API_URL}/chat/message`, {
    content: '这张照片让我想起了美好的时光',
    image: imageBase64,
    sessionId
  });
  
  if (!response.data.success) {
    throw new Error('发送图片消息失败');
  }
  
  const { aiMessage } = response.data;
  
  // 验证AI是否识别了图片内容
  const hasImageDescription = aiMessage.analysis.facts.some(fact => 
    fact.includes('照片') || fact.includes('图片') || fact.includes('人') || fact.includes('合影')
  );
  
  if (!hasImageDescription) {
    throw new Error('AI未能正确识别图片内容');
  }
  
  log(`图片识别成功: ${aiMessage.analysis.facts[0]}`);
}

async function testSessionHistory(sessionId) {
  const response = await axios.get(`${API_URL}/chat/session/${sessionId}`);
  
  if (!response.data.messages || response.data.messages.length < 2) {
    throw new Error('会话历史记录不完整');
  }
  
  log(`会话包含 ${response.data.messages.length} 条消息`);
}

async function testVisualization(sessionId) {
  const response = await axios.get(`${API_URL}/chat/visualization/${sessionId}`);
  
  if (!response.data.complexity || !response.data.coherence || !response.data.evolution) {
    throw new Error('可视化数据不完整');
  }
  
  log(`可视化参数: 复杂度=${response.data.complexity.toFixed(2)}, 连贯性=${response.data.coherence.toFixed(2)}`);
}

async function testSessionList() {
  const response = await axios.get(`${API_URL}/chat/sessions`);
  
  if (!response.data.sessions || !Array.isArray(response.data.sessions)) {
    throw new Error('会话列表格式不正确');
  }
  
  log(`找到 ${response.data.sessions.length} 个会话`);
}

async function testMockDisabled() {
  // 检查服务工厂是否还包含mock相关代码
  const factoryPath = path.join(__dirname, 'backend/src/services/ai/aiServiceFactory.ts');
  const factoryContent = fs.readFileSync(factoryPath, 'utf-8');
  
  if (factoryContent.includes('mockAIService') || factoryContent.includes('MockAIService')) {
    throw new Error('aiServiceFactory仍包含mock服务引用');
  }
  
  // 检查mock文件是否已被禁用
  const mockFiles = [
    'backend/src/services/ai/mockAIService.ts',
    'backend/src/services/ai/factualMockAIService.ts',
    'backend/src/services/ai/localAIService.ts',
    'backend/src/services/ai/enhancedLocalService.ts'
  ];
  
  for (const file of mockFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      throw new Error(`Mock文件仍然存在: ${file}`);
    }
    
    const disabledPath = filePath + '.disabled';
    if (!fs.existsSync(disabledPath)) {
      throw new Error(`Mock文件未被正确禁用: ${file}`);
    }
  }
  
  log('所有mock文件已被禁用');
}

async function testMultipleMessages(sessionId) {
  // 发送多条消息测试对话连续性
  const messages = [
    '我想聊聊工作压力',
    '最近项目很多，感觉有点应付不过来',
    '同事之间的关系也有些紧张'
  ];
  
  for (const content of messages) {
    const response = await axios.post(`${API_URL}/chat/message`, {
      content,
      sessionId
    });
    
    if (!response.data.success) {
      throw new Error(`发送消息失败: ${content}`);
    }
    
    // 短暂延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 验证会话历史
  const historyResponse = await axios.get(`${API_URL}/chat/session/${sessionId}`);
  const messageCount = historyResponse.data.messages.length;
  
  if (messageCount < 6) { // 3条用户消息 + 3条AI回复
    throw new Error('多轮对话未正确保存');
  }
  
  log(`多轮对话测试通过，共 ${messageCount} 条消息`);
}

// 主测试函数
async function runAllTests() {
  console.log('🧪 AI情感支持聊天系统 - 综合测试');
  console.log('═'.repeat(50));
  console.log(`开始时间: ${new Date().toLocaleString()}`);
  console.log('');

  let sessionId;

  try {
    // 1. 基础连接测试
    await runTest('健康检查', testHealthCheck);
    
    // 2. 验证mock已禁用
    await runTest('Mock功能禁用验证', testMockDisabled);
    
    // 3. 会话管理测试
    await runTest('创建会话', async () => {
      sessionId = await testCreateSession();
    });
    
    // 4. 文本对话测试
    await runTest('文本消息处理', () => testTextMessage(sessionId));
    
    // 5. 图片识别测试
    await runTest('图片识别功能', () => testImageRecognition(sessionId));
    
    // 6. 多轮对话测试
    await runTest('多轮对话', () => testMultipleMessages(sessionId));
    
    // 7. 会话历史测试
    await runTest('会话历史查询', () => testSessionHistory(sessionId));
    
    // 8. 可视化数据测试
    await runTest('3D可视化数据', () => testVisualization(sessionId));
    
    // 9. 会话列表测试
    await runTest('会话列表查询', testSessionList);
    
  } catch (error) {
    log('测试过程中发生致命错误', 'error');
    console.error(error);
  }

  // 生成测试报告
  console.log('');
  console.log('═'.repeat(50));
  console.log('📊 测试报告');
  console.log('═'.repeat(50));
  console.log(`总测试数: ${testResults.passed + testResults.failed}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`通过率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('');

  if (testResults.failed > 0) {
    console.log('失败的测试:');
    testResults.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
    console.log('');
  }

  // 保存测试报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: `${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`
    },
    tests: testResults.tests
  };

  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  log('测试报告已保存到 test-report.json', 'info');

  // 返回测试是否全部通过
  return testResults.failed === 0;
}

// 运行测试
runAllTests().then(allPassed => {
  if (allPassed) {
    console.log('\n🎉 所有测试通过！系统运行正常。');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误信息。');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 测试运行失败:', error);
  process.exit(1);
});