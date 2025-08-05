const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testActualRecognition() {
  console.log('=== 测试真实图片识别 ===\n');
  
  // 注册新用户
  const timestamp = Date.now();
  const testUser = {
    name: `识别测试_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'Test123456!'
  };
  
  try {
    const registerRes = await axios.post('http://localhost:3001/api/auth/register', testUser);
    const authToken = registerRes.data.token;
    console.log('✅ 用户注册成功\n');
    
    // 发送图片
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append('content', '这是我的照片');
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('🖼️  发送真实图片进行识别...\n');
    
    const response = await axios.post('http://localhost:3001/api/chat/message', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 60000
    });
    
    if (response.data.success) {
      const aiResponse = response.data.aiMessage.content;
      const analysis = response.data.aiMessage.analysis;
      
      console.log('=== AI 原始响应 ===');
      console.log(aiResponse);
      console.log('\n=== 分析详情 ===');
      console.log(JSON.stringify(analysis, null, 2));
      
      // 检查是否真的识别了图片内容
      console.log('\n=== 真实性检验 ===');
      const realDetails = {
        '提到人数': aiResponse.includes('四') || aiResponse.includes('4'),
        '提到高校参访团': aiResponse.includes('高校') || aiResponse.includes('参访'),
        '提到笑容': aiResponse.includes('笑') || aiResponse.includes('微笑'),
        '提到牌子': aiResponse.includes('牌') || aiResponse.includes('标牌'),
        '提到紫色': aiResponse.includes('紫')
      };
      
      console.log('识别结果:');
      Object.entries(realDetails).forEach(([key, value]) => {
        console.log(`  ${key}: ${value ? '✅ 是' : '❌ 否'}`);
      });
      
      const recognizedCount = Object.values(realDetails).filter(v => v).length;
      console.log(`\n识别准确度: ${recognizedCount}/5 (${(recognizedCount/5*100).toFixed(0)}%)`);
      
      if (recognizedCount >= 3) {
        console.log('\n✅ AI确实识别了真实的图片内容！');
      } else {
        console.log('\n⚠️  AI可能没有真正识别图片，只是使用了模板回复');
      }
      
      // 额外检查：是否完全匹配示例
      const isExampleResponse = aiResponse === "我看到四个人围坐在一起，每个人脸上都洋溢着灿烂的笑容。中间那位拿着紫色的'高校参访团'牌子，看起来这是一次特别的学术交流活动。大家的表情都很放松自然，能感受到彼此之间的友好氛围。这样的聚会时刻总是让人感到温暖，友谊和知识的交流让这个瞬间变得特别有意义。我很好奇，左边穿蓝色外套的是你吗？这次参访中有什么特别让你印象深刻的瞬间？参访结束后，你们还保持联系吗？";
      
      if (isExampleResponse) {
        console.log('\n⚠️  警告：AI返回的是示例模板，而不是真实识别结果！');
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.response?.data?.error || error.message);
  }
}

testActualRecognition().catch(console.error);