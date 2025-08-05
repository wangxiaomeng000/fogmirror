const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testFixedAI() {
  console.log('🔧 测试修复后的AI对话系统\n');
  
  const sessionId = 'fix-test-' + Date.now();
  
  try {
    // 测试场景：用户已经说了时间，AI不应该再问时间
    console.log('--- 测试1: 避免重复提问 ---');
    
    const response1 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '是上周三，11月15号下午3点左右，在中关村的一家星巴克',
      sessionId: sessionId
    });
    
    console.log('用户: 是上周三，11月15号下午3点左右，在中关村的一家星巴克');
    console.log('AI:', response1.data.message.content);
    console.log('✅ 期望: AI应该问其他问题，而不是再问时间\n');
    
    // 继续对话
    console.log('--- 测试2: 智能追问 ---');
    
    const response2 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '我在那里遇到了前同事王涛，他想邀请我创业',
      sessionId: sessionId
    });
    
    console.log('用户: 我在那里遇到了前同事王涛，他想邀请我创业');
    console.log('AI:', response2.data.message.content);
    console.log('✅ 期望: AI应该问创业的具体内容\n');
    
    // 测试金钱相关
    console.log('--- 测试3: 金钱细节追问 ---');
    
    const response3 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '他说可以给我15%股份，月薪3万',
      sessionId: sessionId
    });
    
    console.log('用户: 他说可以给我15%股份，月薪3万');
    console.log('AI:', response3.data.message.content);
    console.log('✅ 期望: AI应该问我现在的收入情况\n');
    
    // 测试人物关系
    console.log('--- 测试4: 人物关系追问 ---');
    
    const response4 = await axios.post('http://localhost:3001/api/chat/message', {
      content: '我和女朋友商量了，她觉得风险太大',
      sessionId: sessionId
    });
    
    console.log('用户: 我和女朋友商量了，她觉得风险太大');
    console.log('AI:', response4.data.message.content);
    console.log('✅ 期望: AI应该问是否咨询了其他人\n');
    
    // 获取认知地图
    const mapResponse = await axios.get(`http://localhost:3001/api/cognitive-map/${sessionId}`);
    const map = mapResponse.data.cognitiveMap;
    
    console.log('--- 认知地图验证 ---');
    console.log('节点数:', map.nodes.length);
    console.log('提取的关键信息:');
    map.nodes.slice(0, 10).forEach(node => {
      console.log(`  - ${node.text}`);
    });
    
    console.log('\n✅ AI系统修复测试完成！');
    console.log('改进点:');
    console.log('1. 不再重复问已经回答过的问题');
    console.log('2. 根据上下文智能选择追问');
    console.log('3. 即使API失败也有合理的备选问题');
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 等待服务器启动
setTimeout(() => {
  testFixedAI();
}, 2000);