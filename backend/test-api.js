const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
let authToken = null;
let sessionId = null;

// 测试流程
async function runTests() {
  try {
    console.log('🚀 开始测试API...\n');
    
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 健康检查成功:', health.data);
    console.log('\n---\n');
    
    // 2. 用户注册
    console.log('2️⃣ 测试用户注册');
    try {
      const register = await axios.post(`${API_BASE}/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
      });
      authToken = register.data.token;
      console.log('✅ 注册成功:', {
        user: register.data.user,
        hasToken: !!authToken
      });
    } catch (error) {
      console.log('❌ 注册失败:', error.response?.data);
    }
    console.log('\n---\n');
    
    // 3. 创建会话
    console.log('3️⃣ 创建新会话');
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    sessionId = session.data.sessionId;
    console.log('✅ 会话创建成功:', session.data);
    console.log('\n---\n');
    
    // 4. 发送文本消息
    console.log('4️⃣ 发送文本消息');
    const textMessage = await axios.post(`${API_BASE}/chat/message`, 
      {
        content: '你好，我最近感到有些焦虑，工作压力很大',
        sessionId: sessionId
      },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ 文本消息响应:', {
      userMessage: textMessage.data.userMessage.content,
      aiResponse: textMessage.data.aiMessage.content.substring(0, 100) + '...',
      hasAnalysis: !!textMessage.data.aiMessage.analysis
    });
    console.log('\n---\n');
    
    // 5. 测试图片识别（使用测试图片）
    console.log('5️⃣ 测试图片识别功能');
    
    // 创建一个简单的测试图片
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // 使用 FormData 发送图片
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('content', '请看看这张图片');
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    try {
      const imageMessage = await axios.post(`${API_BASE}/chat/message`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✅ 图片消息响应:', {
        hasImage: !!imageMessage.data.userMessage.image,
        aiResponse: imageMessage.data.aiMessage.content.substring(0, 100) + '...',
        hasAnalysis: !!imageMessage.data.aiMessage.analysis
      });
    } catch (error) {
      console.log('❌ 图片消息失败:', error.response?.data || error.message);
    }
    console.log('\n---\n');
    
    // 6. 获取会话历史
    console.log('6️⃣ 获取会话历史');
    const history = await axios.get(`${API_BASE}/chat/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 会话历史:', {
      sessionId: history.data.sessionId,
      messageCount: history.data.messages.length,
      messages: history.data.messages.map(m => ({
        role: m.role,
        content: m.content?.substring(0, 50) + '...',
        hasImage: !!m.image
      }))
    });
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
runTests();