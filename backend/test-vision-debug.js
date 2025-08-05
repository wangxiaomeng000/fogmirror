const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testVisionDebug() {
  console.log('=== 调试视觉识别 ===\n');
  
  // 注册新用户
  const timestamp = Date.now();
  const testUser = {
    name: `调试_${timestamp}`,
    email: `debug_${timestamp}@example.com`,
    password: 'Test123456!'
  };
  
  try {
    const registerRes = await axios.post('http://localhost:3001/api/auth/register', testUser);
    const authToken = registerRes.data.token;
    console.log('✅ 用户注册成功\n');
    
    // 先测试一个简单的文字消息，确保基本功能正常
    console.log('1️⃣ 测试文字消息...');
    const textResponse = await axios.post('http://localhost:3001/api/chat/message', {
      content: '你好'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('文字响应:', textResponse.data.aiMessage.content.substring(0, 50) + '...\n');
    
    // 测试图片消息
    console.log('2️⃣ 测试图片消息...');
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append('content', '请描述这张图片');
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('图片大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    console.log('发送图片...\n');
    
    const imageResponse = await axios.post('http://localhost:3001/api/chat/message', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 60000,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024
    });
    
    const aiResponse = imageResponse.data.aiMessage.content;
    console.log('=== AI 图片识别响应 ===');
    console.log(aiResponse);
    
    // 检查响应特征
    console.log('\n=== 响应分析 ===');
    console.log('响应长度:', aiResponse.length, '字符');
    console.log('包含"我看到":', aiResponse.includes('我看到'));
    console.log('包含问号:', aiResponse.includes('？'));
    
    // 测试不同的图片（如果存在）
    const testImages = [
      '/Users/mac/Desktop/test.jpg',
      '/Users/mac/Desktop/photo.jpg',
      '/Users/mac/Desktop/image.png'
    ];
    
    for (const testPath of testImages) {
      if (fs.existsSync(testPath)) {
        console.log(`\n3️⃣ 测试其他图片: ${testPath}`);
        const testBuffer = fs.readFileSync(testPath);
        const testForm = new FormData();
        testForm.append('content', '这张图片里有什么');
        testForm.append('image', testBuffer, {
          filename: testPath.split('/').pop(),
          contentType: testPath.endsWith('.png') ? 'image/png' : 'image/jpeg'
        });
        
        try {
          const testResponse = await axios.post('http://localhost:3001/api/chat/message', testForm, {
            headers: {
              ...testForm.getHeaders(),
              'Authorization': `Bearer ${authToken}`
            },
            timeout: 60000
          });
          
          console.log('响应预览:', testResponse.data.aiMessage.content.substring(0, 100) + '...');
        } catch (err) {
          console.log('测试失败:', err.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('详细错误:', error.response.data.details);
    }
  }
}

testVisionDebug().catch(console.error);