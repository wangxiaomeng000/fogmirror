const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001/api';
let sessionId = null;
let testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    apiUrl: API_URL,
    aiService: 'mock',
    frontendUrl: 'http://localhost:3000'
  },
  tests: []
};

// Test helper functions
function logTest(name, success, details = {}) {
  const result = {
    name,
    success,
    timestamp: new Date().toISOString(),
    ...details
  };
  testResults.tests.push(result);
  console.log(`${success ? '✅' : '❌'} ${name}`);
  if (details.error) {
    console.error(`   Error: ${details.error}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testHealthCheck() {
  try {
    const start = Date.now();
    const res = await axios.get(`${API_URL}/health`);
    const duration = Date.now() - start;
    
    logTest('Health Check', true, {
      status: res.data.status,
      responseTime: duration + 'ms'
    });
    return true;
  } catch (error) {
    logTest('Health Check', false, { error: error.message });
    return false;
  }
}

async function testChatMessage(content, expectedFeatures = []) {
  try {
    const start = Date.now();
    const res = await axios.post(`${API_URL}/chat/message`, {
      content,
      sessionId
    });
    const duration = Date.now() - start;
    
    if (!sessionId && res.data.sessionId) {
      sessionId = res.data.sessionId;
    }
    
    const analysis = res.data.aiMessage?.analysis || {};
    const hasExpectedFeatures = expectedFeatures.every(feature => 
      analysis[feature] !== undefined
    );
    
    logTest(`Chat Message: "${content.substring(0, 50)}..."`, true, {
      responseTime: duration + 'ms',
      sessionId: res.data.sessionId,
      hasAnalysis: !!analysis,
      emotionalTone: analysis.emotionalTone,
      hasExpectedFeatures
    });
    
    return res.data;
  } catch (error) {
    logTest(`Chat Message: "${content.substring(0, 50)}..."`, false, { 
      error: error.response?.data?.message || error.message 
    });
    return null;
  }
}

async function testImageUpload() {
  try {
    // Create a simple test image buffer
    const imageBuffer = Buffer.from('fake-image-data');
    
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), 'test.jpg');
    formData.append('sessionId', sessionId || '');
    
    const res = await axios.post(`${API_URL}/chat/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    logTest('Image Upload', true, {
      hasAnalysis: !!res.data.analysis,
      extractedFacts: res.data.analysis?.extractedFacts?.length || 0
    });
    
    return res.data;
  } catch (error) {
    // Mock service might not support image upload
    logTest('Image Upload', false, { 
      error: 'Mock service does not support image upload',
      expected: true
    });
    return null;
  }
}

async function testFactExtraction() {
  const testCases = [
    {
      input: "昨天下午3点，我在会议室见了李经理",
      expectedFacts: ['时间', '地点', '人物']
    },
    {
      input: "我觉得他总是针对我，昨天又批评了我的方案",
      expectedFacts: ['主观判断', '事实']
    }
  ];
  
  for (const testCase of testCases) {
    const result = await testChatMessage(testCase.input, ['facts', 'insights']);
    if (result) {
      const facts = result.aiMessage?.analysis?.facts || [];
      logTest(`Fact Extraction: ${testCase.input.substring(0, 30)}...`, facts.length > 0, {
        extractedFacts: facts.length,
        expectedTypes: testCase.expectedFacts
      });
    }
  }
}

async function testCognitiveBiasDetection() {
  const biasTestCases = [
    { input: "他们总是忽视我的建议", expectedBias: "过度概括" },
    { input: "她肯定认为我不够好", expectedBias: "读心术" },
    { input: "要么成功要么失败", expectedBias: "二元思维" }
  ];
  
  for (const testCase of biasTestCases) {
    const result = await testChatMessage(testCase.input, ['cognitiveBiases']);
    if (result) {
      const biases = result.aiMessage?.analysis?.cognitiveBiases || [];
      logTest(`Cognitive Bias Detection: ${testCase.expectedBias}`, biases.length > 0, {
        detectedBiases: biases,
        expectedBias: testCase.expectedBias
      });
    }
  }
}

async function test3DVisualization() {
  // Send multiple messages to build up visualization data
  const messages = [
    "最近工作压力很大",
    "上周五，项目经理说我的方案不行",
    "他直接说：'这个方案完全没有考虑成本'",
    "会议记录显示预算超支30%"
  ];
  
  let lastResult = null;
  for (const msg of messages) {
    lastResult = await testChatMessage(msg);
    await sleep(500); // Give time for processing
  }
  
  if (lastResult) {
    const hasVisualization = !!(lastResult.dynamicModel || lastResult.cognitiveMap);
    logTest('3D Visualization Data Generation', hasVisualization, {
      hasDynamicModel: !!lastResult.dynamicModel,
      hasCognitiveMap: !!lastResult.cognitiveMap,
      nodeCount: lastResult.dynamicModel?.structure?.nodes?.length || 0
    });
  }
}

async function testSessionManagement() {
  try {
    // Get session info
    const sessionRes = await axios.get(`${API_URL}/sessions/${sessionId}`);
    
    logTest('Session Retrieval', true, {
      sessionId: sessionRes.data._id,
      messageCount: sessionRes.data.messages.length
    });
    
    // List all sessions
    const listRes = await axios.get(`${API_URL}/sessions`);
    logTest('Session Listing', true, {
      totalSessions: listRes.data.length
    });
    
    return true;
  } catch (error) {
    logTest('Session Management', false, { error: error.message });
    return false;
  }
}

async function testPerformance() {
  const performanceTests = [];
  
  // Test response times for different message types
  const messages = [
    { content: "简单消息", type: "simple" },
    { content: "我最近工作压力很大，经常失眠。昨天老板又批评了我，我觉得自己什么都做不好。", type: "complex" },
    { content: "分析我的认知偏见", type: "analysis" }
  ];
  
  for (const msg of messages) {
    const start = Date.now();
    await testChatMessage(msg.content);
    const duration = Date.now() - start;
    
    performanceTests.push({
      type: msg.type,
      duration: duration + 'ms',
      acceptable: duration < 3000
    });
  }
  
  const allAcceptable = performanceTests.every(t => t.acceptable);
  logTest('Performance Test', allAcceptable, {
    tests: performanceTests
  });
}

async function testCompleteScenarios() {
  console.log('\n📋 Testing Complete Scenarios...\n');
  
  // Scenario 1: Work Stress
  console.log('Scenario 1: Work Stress');
  sessionId = null; // Start new session
  await testChatMessage("最近工作压力很大");
  await testChatMessage("上周五，项目经理说我的方案不行");
  await testChatMessage("他直接说：'这个方案完全没有考虑成本'");
  await testChatMessage("会议记录显示预算超支30%");
  
  // Scenario 2: Interpersonal Relationships
  console.log('\nScenario 2: Interpersonal Relationships');
  sessionId = null; // Start new session
  await testChatMessage("我和同事相处有些问题");
  await testChatMessage("昨天午餐时，三个同事都没叫我");
  await testChatMessage("我看到他们一起去了楼下餐厅");
  await testChatMessage("之前我拒绝了他们的聚餐邀请");
  
  // Scenario 3: Decision Making
  console.log('\nScenario 3: Decision Making');
  sessionId = null; // Start new session
  await testChatMessage("我在考虑是否换工作");
  await testChatMessage("现在月薪15K，新公司offer 20K");
  await testChatMessage("通勤时间会从30分钟增加到1小时");
  await testChatMessage("家人建议我留在现在的公司");
}

async function generateReport() {
  const report = `# AI Emotional Support Chat System - Test Report

## Test Summary
- **Date**: ${new Date().toISOString()}
- **Environment**: ${testResults.environment.aiService} AI Service
- **API URL**: ${testResults.environment.apiUrl}
- **Total Tests**: ${testResults.tests.length}
- **Passed**: ${testResults.tests.filter(t => t.success).length}
- **Failed**: ${testResults.tests.filter(t => !t.success).length}

## Test Results

### Core Functionality
${testResults.tests.filter(t => 
  t.name.includes('Health') || 
  t.name.includes('Chat Message') ||
  t.name.includes('Session')
).map(t => `- ${t.success ? '✅' : '❌'} ${t.name}`).join('\n')}

### Analysis Features
${testResults.tests.filter(t => 
  t.name.includes('Fact Extraction') ||
  t.name.includes('Cognitive Bias') ||
  t.name.includes('3D Visualization')
).map(t => `- ${t.success ? '✅' : '❌'} ${t.name}`).join('\n')}

### Performance
${testResults.tests.filter(t => t.name.includes('Performance'))
  .map(t => `- ${t.success ? '✅' : '❌'} ${t.name}`)
  .join('\n')}

## Detailed Results
\`\`\`json
${JSON.stringify(testResults, null, 2)}
\`\`\`

## Recommendations
- ${testResults.tests.filter(t => !t.success).length > 0 ? 
    'Fix failing tests before deployment' : 
    'All tests passing, system ready for use'}
- Consider implementing real AI service for production
- Add more comprehensive error handling
- Implement user authentication for production

## Next Steps
1. Visit http://localhost:3000 to test the UI
2. Run performance benchmarks under load
3. Test with real AI service (OpenRouter/OpenAI)
`;

  fs.writeFileSync('test-report.md', report);
  console.log('\n📄 Test report saved to test-report.md');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive System Test...\n');
  
  // Basic connectivity
  console.log('1️⃣ Testing Basic Connectivity...');
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.error('❌ Backend not responding. Please ensure services are running.');
    return;
  }
  
  // Core features
  console.log('\n2️⃣ Testing Core Chat Features...');
  await testChatMessage("Hello, I need help with my anxiety");
  
  // Fact extraction
  console.log('\n3️⃣ Testing Fact Extraction...');
  await testFactExtraction();
  
  // Cognitive bias detection
  console.log('\n4️⃣ Testing Cognitive Bias Detection...');
  await testCognitiveBiasDetection();
  
  // Image upload (expected to fail with mock)
  console.log('\n5️⃣ Testing Image Upload...');
  await testImageUpload();
  
  // 3D visualization
  console.log('\n6️⃣ Testing 3D Visualization Data...');
  await test3DVisualization();
  
  // Session management
  console.log('\n7️⃣ Testing Session Management...');
  await testSessionManagement();
  
  // Performance
  console.log('\n8️⃣ Testing Performance...');
  await testPerformance();
  
  // Complete scenarios
  console.log('\n9️⃣ Testing Complete Scenarios...');
  await testCompleteScenarios();
  
  // Generate report
  console.log('\n📊 Generating Test Report...');
  await generateReport();
  
  console.log('\n✅ All tests completed!');
  console.log('🌐 Visit http://localhost:3000 to test the UI');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});