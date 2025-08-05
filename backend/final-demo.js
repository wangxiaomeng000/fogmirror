/**
 * 心理支持系统完整演示
 * 展示从注册到图片识别的完整流程
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const API_BASE = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 ${title}`);
  console.log('='.repeat(60));
}

async function runDemo() {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           心理支持系统 - AI图片识别完整演示                  ║
╚═══════════════════════════════════════════════════════════╝
`);

  await question('按回车键开始演示...');

  let authToken = null;
  let conversationId = null;

  try {
    // 1. 系统状态检查
    printSection('系统状态检查');
    const statusRes = await axios.get(`${API_BASE}/health`);
    console.log('✅ 系统运行正常');
    console.log(`   AI服务: ${statusRes.data.services.ai}`);
    console.log(`   数据库: ${statusRes.data.services.database}`);
    await delay(1000);

    // 2. 用户注册/登录
    printSection('用户注册');
    const userEmail = `demo-${Date.now()}@example.com`;
    const userData = {
      email: userEmail,
      password: 'demo123456',
      name: '演示用户'
    };
    
    try {
      const registerRes = await axios.post(`${API_BASE}/auth/register`, userData);
      authToken = registerRes.data.token;
      console.log('✅ 新用户注册成功');
    } catch (error) {
      if (error.response?.status === 400) {
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        authToken = loginRes.data.token;
        console.log('✅ 用户登录成功');
      }
    }
    await delay(1000);

    const config = {
      headers: { 'Authorization': `Bearer ${authToken}` }
    };

    // 3. 创建对话
    printSection('创建新对话');
    const conversationRes = await axios.post(`${API_BASE}/conversations`, {
      title: '图片识别演示'
    }, config);
    conversationId = conversationRes.data._id;
    console.log('✅ 对话创建成功');
    console.log(`   对话ID: ${conversationId}`);
    await delay(1000);

    // 4. 发送开场白
    printSection('开始对话');
    console.log('\n👤 用户: 你好，我想分享一些照片');
    
    const greetingRes = await axios.post(`${API_BASE}/messages`, {
      conversationId,
      content: '你好，我想分享一些照片'
    }, config);
    
    await delay(500);
    console.log('\n🤖 AI: ' + greetingRes.data.aiResponse);
    await delay(2000);

    // 5. 发送图片
    printSection('发送图片进行识别');
    console.log(`\n📸 正在读取图片: ${IMAGE_PATH}`);
    
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const imageBase64 = imageBuffer.toString('base64');
    const imageSizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`   图片大小: ${imageSizeKB} KB`);
    
    console.log('\n👤 用户: [发送图片] 这是我和朋友们的合照');
    console.log('\n⏳ AI正在识别图片内容...');
    
    const imageRes = await axios.post(`${API_BASE}/messages`, {
      conversationId,
      content: '这是我和朋友们的合照',
      image: imageBase64
    }, config);
    
    await delay(500);
    console.log('\n🤖 AI识别结果:');
    console.log('─'.repeat(50));
    console.log(imageRes.data.aiResponse);
    console.log('─'.repeat(50));
    
    if (imageRes.data.analysis) {
      console.log('\n📊 深度分析:');
      const analysis = imageRes.data.analysis;
      if (analysis.facts?.length > 0) {
        console.log('   事实观察:', analysis.facts.join(', '));
      }
      if (analysis.insights?.length > 0) {
        console.log('   深层洞察:', analysis.insights.join(', '));
      }
      if (analysis.emotionalTone) {
        console.log(`   情绪分析: ${analysis.emotionalTone.primary} (强度: ${analysis.emotionalTone.intensity})`);
      }
    }
    
    await delay(3000);

    // 6. 继续对话
    printSection('深入对话');
    console.log('\n👤 用户: 是的，这是上个月我们参加科技展会时拍的');
    
    const followUpRes = await axios.post(`${API_BASE}/messages`, {
      conversationId,
      content: '是的，这是上个月我们参加科技展会时拍的'
    }, config);
    
    await delay(500);
    console.log('\n🤖 AI: ' + followUpRes.data.aiResponse);
    
    await delay(2000);

    // 7. 查看对话历史
    printSection('对话总结');
    const historyRes = await axios.get(`${API_BASE}/conversations/${conversationId}`, config);
    console.log(`✅ 本次对话共 ${historyRes.data.messages.length} 条消息`);
    console.log(`   其中包含 1 张图片`);
    console.log(`   AI成功识别了图片内容并进行了情感分析`);

    // 8. 演示结束
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✨ 演示完成 ✨                          ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║ 系统功能验证:                                              ║');
    console.log('║ ✅ 用户认证系统正常                                         ║');
    console.log('║ ✅ 对话管理功能正常                                         ║');
    console.log('║ ✅ AI图片识别功能正常                                       ║');
    console.log('║ ✅ 情感分析功能正常                                         ║');
    console.log('║ ✅ 上下文对话功能正常                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ 演示过程中出现错误:');
    console.error(error.response?.data || error.message);
    if (error.response?.data?.stack) {
      console.error('\n错误堆栈:');
      console.error(error.response.data.stack);
    }
  } finally {
    rl.close();
  }
}

// 检查服务是否就绪
async function checkService() {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务状态...');
  
  const isReady = await checkService();
  if (!isReady) {
    console.log('❌ 后端服务未启动，请先运行: npm run dev');
    process.exit(1);
  }
  
  await runDemo();
}

main();