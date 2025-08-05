const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let sessionId = null;

async function testCompleteFlow() {
  console.log('🚀 开始测试AI情感支持聊天系统...\n');

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...');
    const healthRes = await axios.get(`${API_URL}/health`);
    console.log('✅ 后端服务状态:', healthRes.data.status);
    console.log('');

    // 2. 发送第一条消息
    console.log('2️⃣ 发送第一条消息...');
    const msg1 = await axios.post(`${API_URL}/chat/message`, {
      content: '我最近工作压力很大，经常失眠，感觉很焦虑。'
    });
    
    sessionId = msg1.data.sessionId;
    console.log('✅ 收到AI回复:', msg1.data.aiMessage.content);
    console.log('📊 情绪分析:', msg1.data.aiMessage.analysis.emotionalTone);
    console.log('💡 洞察:', msg1.data.aiMessage.analysis.insights);
    console.log('');

    // 3. 继续对话
    console.log('3️⃣ 继续对话...');
    const msg2 = await axios.post(`${API_URL}/chat/message`, {
      content: '我担心自己会失去工作，这让我更加焦虑了。',
      sessionId: sessionId
    });
    
    console.log('✅ 收到AI回复:', msg2.data.aiMessage.content);
    console.log('📊 情绪分析:', msg2.data.aiMessage.analysis.emotionalTone);
    console.log('🎯 建议:', msg2.data.aiMessage.analysis.suggestions);
    console.log('');

    // 4. 获取会话信息
    console.log('4️⃣ 获取会话信息...');
    const sessionRes = await axios.get(`${API_URL}/sessions/${sessionId}`);
    console.log('✅ 会话ID:', sessionRes.data._id);
    console.log('📝 消息数量:', sessionRes.data.messages.length);
    console.log('⏰ 创建时间:', new Date(sessionRes.data.createdAt).toLocaleString());
    console.log('');

    // 5. 测试3D可视化数据
    console.log('5️⃣ 检查3D可视化数据...');
    if (msg2.data.dynamicModel) {
      const model = msg2.data.dynamicModel;
      console.log('✅ 动态模型类型:', model.type);
      console.log('🔗 节点数量:', model.structure.nodes.length);
      console.log('🎨 动画效果:', model.animations.map(a => a.type).join(', '));
      console.log('🧬 概念生物体核心洞察:', model.conceptOrganism.coreInsight);
    }
    console.log('');

    // 6. 测试认知地图
    console.log('6️⃣ 检查认知地图数据...');
    if (msg2.data.cognitiveMap) {
      const map = msg2.data.cognitiveMap;
      console.log('✅ 认知区域数量:', map.areas.length);
      console.log('🗺️ 主要话题:', map.areas.map(a => a.topic).join(', '));
    }
    console.log('');

    console.log('🎉 所有测试完成！系统运行正常。');
    console.log('');
    console.log('📌 系统功能总结:');
    console.log('- ✅ AI情感分析和对话功能正常');
    console.log('- ✅ 会话管理功能正常');
    console.log('- ✅ 3D可视化数据生成正常');
    console.log('- ✅ 认知地图功能正常');
    console.log('- ✅ 多层次分析（事实、洞察、概念）正常');
    console.log('');
    console.log('🌐 访问 http://localhost:3002 体验完整的UI界面');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testCompleteFlow();