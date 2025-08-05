const axios = require('axios');
const fs = require('fs');
const userScenario = require('./test-user-scenario');

const API_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3002';

// 测试结果收集
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// 辅助函数
function log(message, type = 'info') {
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  };
  console.log(`${icons[type]} ${message}`);
}

function addResult(test, success, message) {
  if (success) {
    testResults.passed.push({ test, message });
    log(`${test}: ${message}`, 'success');
  } else {
    testResults.failed.push({ test, message });
    log(`${test}: ${message}`, 'error');
  }
}

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 主测试函数
async function runFullSystemTest() {
  console.log('🚀 开始认知考古系统全面测试');
  console.log('📖 测试场景：', userScenario.user.background);
  console.log('=====================================\n');

  let sessionId = null;
  let allNodes = [];

  try {
    // 1. 测试服务健康状态
    log('测试服务健康状态', 'test');
    try {
      const health = await axios.get(`${API_URL}/health`);
      addResult('服务健康检查', true, `服务正常运行 - AI类型: ${health.data.services.ai}`);
    } catch (error) {
      addResult('服务健康检查', false, '无法连接到后端服务');
      throw new Error('后端服务未启动，请先运行: cd backend && npm run dev');
    }

    // 2. 测试前端页面
    log('测试前端页面访问', 'test');
    try {
      // 主页面
      const homePage = await axios.get(FRONTEND_URL);
      addResult('主页面访问', homePage.status === 200, '主页面可访问');
      
      // 认知考古页面
      const archaeologyPage = await axios.get(`${FRONTEND_URL}/cognitive-archaeology`);
      addResult('认知考古页面', archaeologyPage.status === 200, '认知考古页面可访问');
    } catch (error) {
      testResults.warnings.push({
        test: '前端访问',
        message: '前端可能未启动，请运行: npm run dev'
      });
      log('前端页面测试跳过（前端可能未启动）', 'warning');
    }

    // 3. 测试对话流程
    log('\\n开始测试认知考古对话流程', 'test');
    
    for (const conv of userScenario.conversations) {
      console.log(`\\n--- 第 ${conv.round} 轮对话 ---`);
      
      // 准备请求数据
      const requestData = {
        content: conv.user,
        sessionId: sessionId,
        history: []
      };

      // 如果有图片，添加图片
      if (conv.image) {
        try {
          const imageBuffer = fs.readFileSync(conv.image);
          requestData.image = imageBuffer.toString('base64');
          log('已添加图片到对话', 'info');
        } catch (error) {
          // 使用模拟图片
          requestData.image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          log('使用模拟图片进行测试', 'warning');
        }
      }

      // 发送对话请求
      try {
        const response = await axios.post(`${API_URL}/cognitive/archaeology`, requestData);
        
        if (!sessionId) {
          sessionId = response.data.sessionId;
          log(`创建会话: ${sessionId}`, 'info');
        }

        // 检查响应
        console.log(`\\n👤 用户: ${conv.user}`);
        console.log(`🤖 AI: ${response.data.response}`);

        // 验证响应质量
        const isQuestion = response.data.response.includes('？') || response.data.response.includes('?');
        addResult(
          `对话${conv.round}-响应格式`,
          isQuestion,
          isQuestion ? 'AI正确地以问题形式回应' : 'AI未以问题形式回应'
        );

        // 检查认知节点
        if (response.data.cognitiveNodes) {
          const nodes = response.data.cognitiveNodes;
          allNodes = nodes; // 保存所有节点
          
          const factNodes = nodes.filter(n => n.type === 'fact');
          const insightNodes = nodes.filter(n => n.type === 'insight');
          const beliefNodes = nodes.filter(n => n.type === 'belief');
          const tensionNodes = nodes.filter(n => n.tensionLevel > 0.7);

          console.log(`\\n📊 认知节点统计:`);
          console.log(`   事实节点: ${factNodes.length}个`);
          console.log(`   洞见节点: ${insightNodes.length}个`);
          console.log(`   信念节点: ${beliefNodes.length}个`);
          console.log(`   张力点: ${tensionNodes.length}个`);

          // 验证节点提取
          addResult(
            `对话${conv.round}-节点提取`,
            nodes.length > 0,
            `成功提取${nodes.length}个认知节点`
          );

          // 显示部分节点内容
          if (tensionNodes.length > 0) {
            console.log(`\\n⚡ 识别到的张力点:`);
            tensionNodes.slice(0, 2).forEach(node => {
              console.log(`   - "${node.content}"`);
            });
          }
        }

        // 延迟以模拟真实对话节奏
        await delay(1000);

      } catch (error) {
        addResult(`对话${conv.round}`, false, `请求失败: ${error.message}`);
        console.error('详细错误:', error.response?.data || error.message);
      }
    }

    // 4. 测试认知地图获取
    if (sessionId) {
      log('\\n测试认知地图数据获取', 'test');
      try {
        const mapResponse = await axios.get(`${API_URL}/cognitive/cognitive-map/${sessionId}`);
        
        addResult(
          '认知地图数据',
          mapResponse.data.success,
          `获取到${mapResponse.data.nodes?.length || 0}个节点，${mapResponse.data.connections?.length || 0}个连接`
        );

        // 验证3D地图数据结构
        const hasValidStructure = mapResponse.data.nodes || mapResponse.data.areas;
        addResult(
          '3D地图数据结构',
          hasValidStructure,
          hasValidStructure ? '地图数据结构正确' : '地图数据结构异常'
        );

      } catch (error) {
        addResult('认知地图获取', false, `获取失败: ${error.message}`);
      }
    }

    // 5. 测试张力点识别算法
    log('\\n测试张力点识别算法', 'test');
    if (allNodes.length > 0) {
      const highTensionNodes = allNodes.filter(n => n.tensionLevel && n.tensionLevel > 0.7);
      
      addResult(
        '张力点识别',
        highTensionNodes.length > 0,
        `识别到${highTensionNodes.length}个高张力节点`
      );

      // 验证张力点特征
      const expectedTensions = [
        "努力工作但被裁员",
        "HR说不是个人问题 vs 自我归因",
        "能力vs关系的归因冲突"
      ];

      let matchedTensions = 0;
      highTensionNodes.forEach(node => {
        if (expectedTensions.some(tension => 
          node.content.includes(tension.split('vs')[0].trim()) ||
          node.content.includes('矛盾') ||
          node.content.includes('冲突')
        )) {
          matchedTensions++;
        }
      });

      addResult(
        '张力点准确性',
        matchedTensions > 0,
        `正确识别了${matchedTensions}个预期张力点`
      );
    }

    // 6. 测试认知层次
    log('\\n测试认知层次结构', 'test');
    if (allNodes.length > 0) {
      const layers = {
        facts: allNodes.filter(n => n.type === 'fact').length,
        insights: allNodes.filter(n => n.type === 'insight').length,
        beliefs: allNodes.filter(n => n.type === 'belief').length
      };

      const hasAllLayers = layers.facts > 0 && layers.insights > 0 && layers.beliefs > 0;
      addResult(
        '三层认知结构',
        hasAllLayers,
        `事实层${layers.facts}个，洞见层${layers.insights}个，信念层${layers.beliefs}个`
      );
    }

  } catch (error) {
    console.error('\\n测试过程中发生错误:', error.message);
  }

  // 生成测试报告
  console.log('\\n\\n' + '='.repeat(50));
  console.log('📊 测试报告总结');
  console.log('='.repeat(50));
  
  console.log(`\\n✅ 通过测试: ${testResults.passed.length}项`);
  testResults.passed.forEach(r => {
    console.log(`   • ${r.test}: ${r.message}`);
  });

  if (testResults.failed.length > 0) {
    console.log(`\\n❌ 失败测试: ${testResults.failed.length}项`);
    testResults.failed.forEach(r => {
      console.log(`   • ${r.test}: ${r.message}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log(`\\n⚠️  警告: ${testResults.warnings.length}项`);
    testResults.warnings.forEach(r => {
      console.log(`   • ${r.test}: ${r.message}`);
    });
  }

  // 总体评估
  const totalTests = testResults.passed.length + testResults.failed.length;
  const passRate = (testResults.passed.length / totalTests * 100).toFixed(1);
  
  console.log(`\\n📈 测试通过率: ${passRate}%`);
  
  if (testResults.failed.length === 0) {
    console.log('\\n🎉 所有测试通过！系统运行正常！');
    console.log('\\n💡 建议：');
    console.log('1. 访问 http://localhost:3000/cognitive-archaeology 体验完整功能');
    console.log('2. 上传真实图片测试视觉分析功能');
    console.log('3. 进行多轮对话观察认知地图的动态变化');
  } else {
    console.log('\\n⚠️  存在失败的测试项，请检查并修复相关问题');
    console.log('\\n🔧 修复建议：');
    testResults.failed.forEach(r => {
      if (r.test.includes('服务')) {
        console.log('- 确保后端服务正在运行：cd backend && npm run dev');
      }
      if (r.test.includes('前端')) {
        console.log('- 确保前端服务正在运行：npm run dev');
      }
      if (r.test.includes('节点')) {
        console.log('- 检查认知节点提取逻辑是否正确实现');
      }
    });
  }

  // 保存测试结果
  const testReport = {
    timestamp: new Date().toISOString(),
    scenario: userScenario.user,
    results: testResults,
    passRate: passRate
  };

  fs.writeFileSync(
    'test-report.json',
    JSON.stringify(testReport, null, 2)
  );
  console.log('\\n📄 详细测试报告已保存到 test-report.json');
}

// 运行测试
console.log('🧪 认知考古系统完整测试套件');
console.log('================================\\n');

runFullSystemTest().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});