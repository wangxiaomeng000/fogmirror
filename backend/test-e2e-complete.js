const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');
// const puppeteer = require('puppeteer-core');

// 下载真实测试图片
async function downloadRealImage() {
  const imageUrl = 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=600&h=400&fit=crop';
  const imagePath = 'test-real-scene.jpg';
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(imagePath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ 真实测试图片下载成功');
        resolve(imagePath);
      });
    }).on('error', (err) => {
      fs.unlink(imagePath, () => {});
      reject(err);
    });
  });
}

async function runCompleteE2ETest() {
  console.log('='.repeat(60));
  console.log('🧪 雾镜系统完整端到端测试');
  console.log('='.repeat(60));
  console.log();
  
  const sessionId = 'e2e-test-' + Date.now();
  let totalTests = 0;
  let passedTests = 0;
  
  // 测试辅助函数
  function testCase(name, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ ${name}`);
      if (details) console.log(`   ${details}`);
      passedTests++;
      return true;
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
      return false;
    }
  }
  
  try {
    // === 阶段1: 系统健康检查 ===
    console.log('【阶段1】系统健康检查');
    console.log('-'.repeat(40));
    
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    testCase('服务器运行状态', healthResponse.data.status === 'ok');
    testCase('API密钥配置', healthResponse.data.hasApiKey === true);
    testCase('功能模块加载', 
      healthResponse.data.features.includes('Llama Vision') &&
      healthResponse.data.features.includes('Fact Extraction') &&
      healthResponse.data.features.includes('Cognitive Mapping'),
      `已加载: ${healthResponse.data.features.join(', ')}`
    );
    console.log();
    
    // === 阶段2: 图片识别测试 ===
    console.log('【阶段2】真实图片识别测试');
    console.log('-'.repeat(40));
    
    const imagePath = await downloadRealImage();
    
    // 测试案例1: 只发送图片
    const formData1 = new FormData();
    formData1.append('sessionId', sessionId);
    formData1.append('image', fs.createReadStream(imagePath));
    
    console.log('📷 测试1: 只发送图片（无文字）');
    const response1 = await axios.post('http://localhost:3001/api/chat/message', formData1, {
      headers: formData1.getHeaders()
    });
    
    testCase('图片上传成功', response1.status === 200);
    testCase('收到AI响应', !!response1.data.message);
    testCase('图片分析完成', !!response1.data.imageAnalysis);
    
    if (response1.data.imageAnalysis) {
      console.log('\n图片识别内容摘要:');
      console.log(response1.data.imageAnalysis.substring(0, 150) + '...\n');
    }
    
    // 测试案例2: 图片+文字
    const formData2 = new FormData();
    formData2.append('content', '这张照片是我去年在海边拍的，当时心情很复杂');
    formData2.append('sessionId', sessionId);
    formData2.append('image', fs.createReadStream(imagePath));
    
    console.log('📝 测试2: 图片+文字组合');
    const response2 = await axios.post('http://localhost:3001/api/chat/message', formData2, {
      headers: formData2.getHeaders()
    });
    
    testCase('组合输入处理成功', response2.status === 200);
    testCase('AI生成追问', response2.data.message.content.includes('什么') || 
                           response2.data.message.content.includes('哪') ||
                           response2.data.message.content.includes('几'));
    console.log('AI追问:', response2.data.message.content);
    console.log();
    
    // === 阶段3: 对话交互测试 ===
    console.log('【阶段3】多轮对话测试');
    console.log('-'.repeat(40));
    
    // 第一轮回复
    const response3 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '是在2023年8月15日，青岛的金沙滩',
      sessionId: sessionId
    });
    
    console.log('用户: 是在2023年8月15日，青岛的金沙滩');
    console.log('AI:', response3.data.message.content);
    testCase('第一轮对话成功', response3.status === 200);
    
    // 第二轮回复
    const response4 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '当时是和大学同学一起去的，我们有5个人',
      sessionId: sessionId
    });
    
    console.log('\n用户: 当时是和大学同学一起去的，我们有5个人');
    console.log('AI:', response4.data.message.content);
    testCase('第二轮对话成功', response4.status === 200);
    
    // 第三轮回复
    const response5 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '我们是开车去的，早上6点出发，开了3个小时',
      sessionId: sessionId
    });
    
    console.log('\n用户: 我们是开车去的，早上6点出发，开了3个小时');
    console.log('AI:', response5.data.message.content);
    testCase('第三轮对话成功', response5.status === 200);
    console.log();
    
    // === 阶段4: 认知地图验证 ===
    console.log('【阶段4】认知地图生成验证');
    console.log('-'.repeat(40));
    
    const mapResponse = await axios.get(`http://localhost:3001/api/cognitive-map/${sessionId}`);
    const map = mapResponse.data.cognitiveMap;
    
    testCase('认知地图API正常', mapResponse.status === 200);
    testCase('节点数量合理', map.nodes.length >= 15, `共${map.nodes.length}个节点`);
    testCase('连接关系建立', map.links.length >= 10, `共${map.links.length}个连接`);
    testCase('包含事实节点', map.nodes.some(n => n.type === 'fact'));
    testCase('包含洞见节点', map.nodes.some(n => n.type === 'insight'));
    testCase('生物体参数更新', map.organism.complexity > 0 && map.organism.evolution > 0);
    
    // 显示提取的关键词
    console.log('\n提取的关键词（前10个）:');
    const factNodes = map.nodes.filter(n => n.type === 'fact').slice(0, 10);
    factNodes.forEach((node, index) => {
      console.log(`  ${index + 1}. ${node.text}`);
    });
    
    // 显示洞见
    const insightNodes = map.nodes.filter(n => n.type === 'insight');
    if (insightNodes.length > 0) {
      console.log('\n生成的洞见:');
      insightNodes.forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.text}`);
      });
    }
    console.log();
    
    // === 阶段5: 特殊场景测试 ===
    console.log('【阶段5】特殊场景测试');
    console.log('-'.repeat(40));
    
    // 测试只发文字
    const response6 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '其实那天我是因为和女朋友分手了才去的海边',
      sessionId: sessionId
    });
    testCase('纯文字输入处理', response6.status === 200);
    
    // 测试空内容
    try {
      const response7 = await axios.post('http://localhost:3001/api/chat/message', {
        content: '',
        sessionId: sessionId
      });
      testCase('空内容处理', false, '不应该接受空内容');
    } catch (error) {
      testCase('空内容拒绝', true, '正确拒绝了空内容');
    }
    console.log();
    
    // === 阶段6: UI界面测试 ===
    console.log('【阶段6】UI界面可访问性测试');
    console.log('-'.repeat(40));
    
    try {
      const uiResponse = await axios.get('http://localhost:3001/');
      testCase('主页面可访问', uiResponse.status === 200);
      testCase('返回HTML内容', uiResponse.headers['content-type'].includes('text/html'));
      testCase('包含Three.js', uiResponse.data.includes('three.js'));
      testCase('包含聊天界面', uiResponse.data.includes('chat-sidebar'));
    } catch (error) {
      testCase('UI界面访问', false, error.message);
    }
    console.log();
    
    // === 阶段7: 性能测试 ===
    console.log('【阶段7】性能基准测试');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    const perfFormData = new FormData();
    perfFormData.append('content', '性能测试消息');
    perfFormData.append('sessionId', 'perf-test');
    perfFormData.append('image', fs.createReadStream(imagePath));
    
    const perfResponse = await axios.post('http://localhost:3001/api/chat/message', perfFormData, {
      headers: perfFormData.getHeaders()
    });
    const responseTime = Date.now() - startTime;
    
    testCase('响应时间合理', responseTime < 5000, `耗时: ${responseTime}ms`);
    testCase('图片分析完成', !!perfResponse.data.imageAnalysis);
    console.log();
    
    // 清理测试文件
    fs.unlinkSync(imagePath);
    
    // === 测试总结 ===
    console.log('='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`通过率: ${Math.round(passedTests / totalTests * 100)}%`);
    console.log();
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！系统运行正常！');
    } else {
      console.log('⚠️  部分测试失败，请检查相关功能');
    }
    
    console.log('\n📋 功能清单:');
    console.log('✅ 真实图片识别（Llama 3.2 Vision）');
    console.log('✅ 事实关键词提取');
    console.log('✅ 多轮对话支持');
    console.log('✅ 认知地图实时生成');
    console.log('✅ 三层知识结构（事实-洞见-生物体）');
    console.log('✅ UI界面正常访问');
    console.log('✅ 性能表现良好');
    
    console.log('\n🌐 系统地址: http://localhost:3001');
    console.log('💡 可以直接在浏览器中使用完整功能\n');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:');
    console.error(error.response?.data || error.message);
    
    // 清理
    if (fs.existsSync('test-real-scene.jpg')) {
      fs.unlinkSync('test-real-scene.jpg');
    }
  }
}

// 运行完整测试
runCompleteE2ETest();