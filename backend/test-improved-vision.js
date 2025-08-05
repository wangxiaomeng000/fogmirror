const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';

// 测试改进后的图片描述功能
async function testImprovedVision() {
  console.log('=== 测试改进后的图片描述功能 ===\n');
  
  // 1. 先注册/登录
  const timestamp = Date.now();
  const testUser = {
    name: `测试用户_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'Test123456!'
  };
  
  let authToken = '';
  
  try {
    // 注册
    const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
    authToken = registerRes.data.token;
    console.log('✅ 用户注册成功\n');
  } catch (error) {
    console.error('注册失败:', error.response?.data?.error);
    return;
  }
  
  // 2. 发送图片测试
  const imagePath = '/Users/mac/Desktop/合照.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ 找不到测试图片');
    return;
  }
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append('content', '刚刚参加完展会');
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('发送图片消息...\n');
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 60000
    });
    
    if (response.data.success) {
      const aiResponse = response.data.aiMessage.content;
      const analysis = response.data.aiMessage.analysis;
      
      console.log('=== AI响应 ===');
      console.log(aiResponse);
      console.log('\n=== 分析细节 ===');
      
      if (analysis.facts && analysis.facts.length > 0) {
        console.log('\n📸 图片识别到的事实:');
        analysis.facts.forEach((fact, index) => {
          console.log(`  ${index + 1}. ${fact}`);
        });
      }
      
      if (analysis.insights && analysis.insights.length > 0) {
        console.log('\n💡 洞察:');
        analysis.insights.forEach((insight, index) => {
          console.log(`  ${index + 1}. ${insight}`);
        });
      }
      
      console.log('\n=== 评估 ===');
      
      // 检查是否包含详细描述
      const hasDetailedDescription = aiResponse.length > 100;
      const mentionsSpecificDetails = 
        aiResponse.includes('四') || 
        aiResponse.includes('高校') || 
        aiResponse.includes('参访') ||
        aiResponse.includes('笑');
      
      const asksFollowUpQuestions = 
        aiResponse.includes('？') || 
        aiResponse.includes('吗') ||
        aiResponse.includes('谁') ||
        aiResponse.includes('什么');
      
      console.log(`✅ 详细描述图片: ${hasDetailedDescription ? '是' : '否'} (长度: ${aiResponse.length}字)`);
      console.log(`✅ 提到具体细节: ${mentionsSpecificDetails ? '是' : '否'}`);
      console.log(`✅ 提出引导问题: ${asksFollowUpQuestions ? '是' : '否'}`);
      
      if (hasDetailedDescription && mentionsSpecificDetails && asksFollowUpQuestions) {
        console.log('\n🎉 改进成功！AI现在会先详细描述图片，然后引导用户深入对话。');
      } else {
        console.log('\n⚠️  需要进一步优化，确保AI充分描述图片并提出引导性问题。');
      }
      
      // 显示会话ID供后续测试
      console.log(`\n会话ID: ${response.data.sessionId}`);
      
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data?.error || error.message);
  }
}

// 运行测试
testImprovedVision().catch(console.error);