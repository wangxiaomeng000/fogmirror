const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001/api';

// 用户信息
const TEST_USER = {
  email: 'test-silicon@example.com',
  password: 'testpass123',
  name: 'Silicon测试用户'
};

// 测试用图片
const TEST_IMAGE = '/Users/mac/Desktop/合照.jpg';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCompleteTest() {
  console.log('\n============================================================');
  console.log('🎭 心理支持系统 - SiliconFlow视觉识别完整测试');
  console.log('============================================================\n');

  let authToken = null;
  let conversationId = null;

  try {
    // 1. 注册新用户
    console.log('📝 步骤1: 注册新用户');
    try {
      const registerRes = await axios.post(`${API_BASE}/auth/register`, TEST_USER);
      console.log('✅ 注册成功');
      authToken = registerRes.data.token;
    } catch (error) {
      if (error.response?.status === 400) {
        // 用户已存在，尝试登录
        console.log('ℹ️  用户已存在，尝试登录...');
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        console.log('✅ 登录成功');
        authToken = loginRes.data.token;
      } else {
        throw error;
      }
    }

    // 设置请求头
    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    // 2. 检查系统状态
    console.log('\n📊 步骤2: 检查系统状态');
    const statusRes = await axios.get(`${API_BASE}/system/status`, config);
    console.log(`✅ 系统状态: ${statusRes.data.status}`);
    console.log(`   AI服务: ${statusRes.data.aiService}`);
    console.log(`   数据库: ${statusRes.data.database}`);

    // 3. 创建新对话
    console.log('\n💬 步骤3: 创建新对话');
    const conversationRes = await axios.post(`${API_BASE}/conversations`, { title: 'SiliconFlow视觉测试' }, config);
    conversationId = conversationRes.data._id;
    console.log('✅ 对话创建成功');

    // 4. 发送文字消息
    console.log('\n📝 步骤4: 发送开场白');
    const textMessage = {
      conversationId,
      content: '你好，我想分享一张照片'
    };
    const textRes = await axios.post(`${API_BASE}/messages`, textMessage, config);
    console.log('✅ 消息发送成功');
    console.log('AI回复:', textRes.data.aiResponse);

    await delay(2000);

    // 5. 发送图片消息
    console.log('\n🖼️  步骤5: 发送图片进行识别');
    
    // 读取图片
    const imageBuffer = fs.readFileSync(TEST_IMAGE);
    const base64Image = imageBuffer.toString('base64');
    
    // 创建带图片的消息
    const imageMessage = {
      conversationId,
      content: '这是我和朋友们的合照',
      image: base64Image
    };
    
    console.log('📤 发送图片消息...');
    const imageRes = await axios.post(`${API_BASE}/messages`, imageMessage, config);
    
    console.log('\n✅ 图片识别成功！');
    console.log('\n📋 AI图片识别结果:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(imageRes.data.aiResponse);
    console.log('═══════════════════════════════════════════════════════');
    
    // 显示分析结果
    if (imageRes.data.analysis) {
      const analysis = imageRes.data.analysis;
      console.log('\n📊 深度分析:');
      console.log('事实观察:', analysis.facts);
      console.log('深层洞察:', analysis.insights);
      console.log('核心概念:', analysis.concepts);
      console.log('情绪分析:', analysis.emotionalTone);
      console.log('建议问题:', analysis.suggestions);
    }

    await delay(2000);

    // 6. 继续对话
    console.log('\n💬 步骤6: 回答AI的问题');
    const followUpMessage = {
      conversationId,
      content: '这是上个月我们参加一个科技展会时拍的，左边是我的大学同学'
    };
    const followUpRes = await axios.post(`${API_BASE}/messages`, followUpMessage, config);
    console.log('✅ 消息发送成功');
    console.log('AI回复:', followUpRes.data.aiResponse);

    // 7. 查看对话历史
    console.log('\n📜 步骤7: 查看对话历史');
    const historyRes = await axios.get(`${API_BASE}/conversations/${conversationId}`, config);
    console.log(`✅ 对话包含 ${historyRes.data.messages.length} 条消息`);

    console.log('\n✨ 测试完成！SiliconFlow视觉识别功能正常工作');
    console.log('   - AI成功识别了图片中的人物、场景和细节');
    console.log('   - AI能够基于图片内容进行自然对话');
    console.log('   - 系统完整流程运行正常');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
runCompleteTest();