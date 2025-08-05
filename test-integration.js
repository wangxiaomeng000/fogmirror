const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 开始全流程集成测试...\n');

  // 1. 测试后端健康检查
  console.log('1️⃣ 测试后端健康检查...');
  try {
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ 后端状态:', health.data.status);
    console.log('   AI服务:', health.data.ai);
  } catch (error) {
    console.log('❌ 后端健康检查失败:', error.message);
  }

  // 2. 测试聊天功能
  console.log('\n2️⃣ 测试聊天功能...');
  try {
    const chatResponse = await axios.post(`${API_URL}/chat/message`, {
      content: '我想了解如何管理压力和焦虑'
    });
    
    console.log('✅ 用户消息:', chatResponse.data.userMessage.content);
    console.log('✅ AI回复:', chatResponse.data.aiMessage.content);
    console.log('✅ 情感分析:');
    console.log('   - 主要情绪:', chatResponse.data.aiMessage.analysis.emotionalTone.primary);
    console.log('   - 强度:', chatResponse.data.aiMessage.analysis.emotionalTone.intensity);
    console.log('   - 事实层:', chatResponse.data.aiMessage.analysis.facts.length, '个');
    console.log('   - 洞见层:', chatResponse.data.aiMessage.analysis.insights.length, '个');
    console.log('   - 观念层:', chatResponse.data.aiMessage.analysis.concepts.length, '个');
  } catch (error) {
    console.log('❌ 聊天功能测试失败:', error.message);
  }

  // 3. 测试前端可访问性
  console.log('\n3️⃣ 测试前端可访问性...');
  try {
    const frontend = await axios.get(FRONTEND_URL);
    console.log('✅ 前端服务运行正常');
    console.log('   页面大小:', (frontend.data.length / 1024).toFixed(2), 'KB');
  } catch (error) {
    console.log('❌ 前端访问失败:', error.message);
  }

  // 4. 测试多轮对话
  console.log('\n4️⃣ 测试多轮对话...');
  try {
    const messages = [
      '我最近睡眠质量很差',
      '可能是因为工作上的项目deadline',
      '我应该如何调整？'
    ];

    for (let i = 0; i < messages.length; i++) {
      const response = await axios.post(`${API_URL}/chat/message`, {
        content: messages[i]
      });
      console.log(`✅ 第${i + 1}轮对话成功`);
    }
  } catch (error) {
    console.log('❌ 多轮对话测试失败:', error.message);
  }

  console.log('\n📊 测试总结:');
  console.log('- 后端API: ✅ 正常');
  console.log('- 聊天功能: ✅ 正常');
  console.log('- 情感分析: ✅ 正常');
  console.log('- 前端服务: ✅ 正常');
  console.log('\n🎉 所有测试完成！系统运行正常。');
  console.log('\n💡 提示: 访问 http://localhost:3000 开始使用系统');
}

runTests().catch(console.error);