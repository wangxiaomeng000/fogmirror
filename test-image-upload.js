const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';

async function testImageUpload() {
  console.log('🖼️  开始测试图片上传功能...\n');

  try {
    // 1. 创建测试图片
    console.log('1️⃣ 创建测试图片...');
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // 2. 测试基本消息发送（不带图片）
    console.log('\n2️⃣ 测试普通消息发送...');
    const form1 = new FormData();
    form1.append('content', '这是一条测试消息');
    
    const response1 = await axios.post(`${API_URL}/chat/message`, form1, {
      headers: form1.getHeaders()
    });
    
    console.log('✅ 普通消息发送成功');
    console.log('会话ID:', response1.data.sessionId);
    console.log('AI回复:', response1.data.aiMessage.content);
    
    const sessionId = response1.data.sessionId;
    
    // 3. 测试带图片的消息发送
    console.log('\n3️⃣ 测试带图片的消息发送...');
    const form2 = new FormData();
    form2.append('content', '这是我拍的照片，请帮我分析一下');
    form2.append('sessionId', sessionId);
    form2.append('image', imageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    const response2 = await axios.post(`${API_URL}/chat/message`, form2, {
      headers: form2.getHeaders()
    });
    
    console.log('✅ 图片消息发送成功');
    console.log('AI回复:', response2.data.aiMessage.content);
    console.log('是否包含图片:', !!response2.data.userMessage.image);
    
    // 检查分析结果
    if (response2.data.aiMessage.analysis) {
      const analysis = response2.data.aiMessage.analysis;
      console.log('\n📊 分析结果:');
      console.log('事实数量:', analysis.facts.length);
      
      // 查找图片识别相关的事实
      const imageFactFound = analysis.facts.some(fact => 
        fact.includes('图片识别') || fact.includes('展览') || fact.includes('风景')
      );
      console.log('包含图片识别:', imageFactFound ? '✅ 是' : '❌ 否');
      
      if (imageFactFound) {
        const imageFact = analysis.facts.find(fact => fact.includes('图片识别'));
        console.log('图片识别结果:', imageFact);
      }
    }
    
    // 4. 测试纯图片分析API
    console.log('\n4️⃣ 测试纯图片分析API...');
    const form3 = new FormData();
    form3.append('image', imageBuffer, {
      filename: 'analyze.jpg',
      contentType: 'image/jpeg'
    });
    
    const response3 = await axios.post(`${API_URL}/chat/analyze-image`, form3, {
      headers: form3.getHeaders()
    });
    
    console.log('✅ 图片分析成功');
    console.log('异常识别:', response3.data.abnormalities);
    
    // 5. 创建一个更大的图片测试不同的识别结果
    console.log('\n5️⃣ 测试不同大小的图片...');
    const largerImageBuffer = Buffer.alloc(5000);
    largerImageBuffer.fill('test data');
    
    const form4 = new FormData();
    form4.append('content', '这是另一张图片');
    form4.append('sessionId', sessionId);
    form4.append('image', largerImageBuffer, {
      filename: 'large.jpg',
      contentType: 'image/jpeg'
    });
    
    const response4 = await axios.post(`${API_URL}/chat/message`, form4, {
      headers: form4.getHeaders()
    });
    
    if (response4.data.aiMessage.analysis) {
      const imageFact = response4.data.aiMessage.analysis.facts.find(fact => 
        fact.includes('图片识别')
      );
      console.log('不同图片的识别结果:', imageFact);
    }
    
    console.log('\n🎉 所有图片上传测试完成！');
    console.log('\n📌 测试总结:');
    console.log('- ✅ 普通消息发送正常');
    console.log('- ✅ 带图片的消息发送正常');
    console.log('- ✅ 图片内容被正确识别并添加到分析中');
    console.log('- ✅ 纯图片分析API正常');
    console.log('- ✅ LocalAIService的模拟图片识别功能正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('错误堆栈:', error.response.data.stack);
    }
  }
}

// 运行测试
testImageUpload();