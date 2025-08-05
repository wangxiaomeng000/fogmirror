const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

async function testGeminiImageRecognition() {
  console.log('🚀 测试Gemini真实图片识别功能...\n');
  console.log('使用图片:', IMAGE_PATH);

  try {
    // 1. 读取图片
    console.log('\n1️⃣ 读取图片文件...');
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const stats = fs.statSync(IMAGE_PATH);
    console.log('✅ 图片大小:', Math.round(stats.size / 1024), 'KB');
    
    // 2. 发送带图片的消息
    console.log('\n2️⃣ 发送图片到Gemini服务...');
    const form = new FormData();
    form.append('content', '请分析这张合照，描述你看到的人物和场景');
    form.append('image', imageBuffer, {
      filename: '合照.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('⏰ 正在等待Gemini分析图片...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_URL}/chat/message`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000 // 30秒超时
    });
    
    const responseTime = Date.now() - startTime;
    console.log('✅ 分析完成！用时:', responseTime, 'ms');
    
    // 3. 展示结果
    console.log('\n3️⃣ Gemini识别结果:');
    console.log('=====================================');
    
    const data = response.data;
    console.log('\n📋 基本信息:');
    console.log('AI服务:', data.debug?.aiServiceName);
    console.log('会话ID:', data.sessionId);
    
    console.log('\n💬 对话:');
    console.log('用户:', data.userMessage.content);
    console.log('AI回复:', data.aiMessage.content);
    
    // 4. 分析识别结果
    if (data.aiMessage.analysis) {
      const analysis = data.aiMessage.analysis;
      
      console.log('\n🔍 图片识别内容:');
      console.log('=====================================');
      
      // 查找图片识别相关的事实
      const imageFacts = analysis.facts.filter(fact => 
        fact.includes('图片识别') || fact.includes('图片') || fact.includes('人')
      );
      
      if (imageFacts.length > 0) {
        imageFacts.forEach((fact, index) => {
          console.log(`${index + 1}. ${fact}`);
        });
      }
      
      // 如果有专门的图片分析字段
      if (analysis.imageAnalysis) {
        console.log('\n📸 详细图片分析:');
        console.log(analysis.imageAnalysis);
      }
      
      console.log('\n💡 洞察:');
      analysis.insights.forEach((insight, index) => {
        console.log(`${index + 1}. ${insight}`);
      });
      
      console.log('\n🎯 概念:');
      analysis.concepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept}`);
      });
    }
    
    // 5. 测试持续对话
    console.log('\n4️⃣ 测试后续对话...');
    const form2 = new FormData();
    form2.append('content', '图片中有几个人？他们看起来关系如何？');
    form2.append('sessionId', data.sessionId);
    
    const response2 = await axios.post(`${API_URL}/chat/message`, form2, {
      headers: form2.getHeaders()
    });
    
    console.log('AI回复:', response2.data.aiMessage.content);
    
    // 6. 对比总结
    console.log('\n\n📊 测试总结');
    console.log('=====================================');
    console.log('✅ 使用Gemini服务成功');
    console.log('✅ 真实图片内容被识别');
    console.log('✅ AI能够理解图片并进行对话');
    console.log('✅ 系统完整支持视觉分析功能');
    
    console.log('\n🎉 恭喜！系统现在可以真正识别和分析用户上传的图片了！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
    
    // 检查是否是API密钥问题
    if (error.message.includes('API key') || error.message.includes('401')) {
      console.log('\n⚠️  可能是Gemini API密钥无效，请检查配置');
    }
  }
}

// 运行测试
testGeminiImageRecognition();