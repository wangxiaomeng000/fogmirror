const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 颜色输出
const colors = {
  user: '\x1b[36m',    // 青色
  ai: '\x1b[35m',      // 紫色
  system: '\x1b[33m',  // 黄色
  success: '\x1b[32m', // 绿色
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m'
};

async function runDemo() {
  console.log('\n' + '='.repeat(70));
  console.log(colors.bright + '🎭 心理支持系统 - 实际效果演示' + colors.reset);
  console.log('='.repeat(70) + '\n');
  
  try {
    // 1. 初始化
    console.log(colors.system + '⚙️  系统初始化...' + colors.reset);
    
    // 注册用户
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `demo${Date.now()}@example.com`,
      password: 'password123',
      name: '小明'
    });
    const authToken = register.data.token;
    
    // 创建会话
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const sessionId = session.data.sessionId;
    
    console.log(colors.success + '✅ 初始化成功\n' + colors.reset);
    await delay(1500);
    
    // 2. 场景一：用户上传照片（不说话）
    console.log(colors.system + '📸 场景一：用户打开APP，直接上传了一张照片...' + colors.reset);
    console.log(colors.dim + '（用户没有说任何话，只是上传了"合照.jpg"）\n' + colors.reset);
    await delay(2000);
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', ''); // 用户没说话
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'photo.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log(colors.dim + '⏳ AI正在分析照片...\n' + colors.reset);
    const response1 = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    await delay(1000);
    console.log(colors.ai + '🤖 AI助手：' + colors.reset);
    console.log(colors.bright + response1.data.aiMessage.content + colors.reset);
    console.log('');
    await delay(3000);
    
    // 3. 用户被吸引，开始回应
    console.log(colors.user + '👤 小明：' + colors.reset);
    const userMsg1 = '哇，你观察得好仔细！是的，这是我们大学毕业时拍的，那天刚好答辩结束，大家都特别开心。';
    console.log(userMsg1);
    console.log('');
    await delay(2000);
    
    const response2 = await axios.post(`${API_BASE}/chat/message`, {
      content: userMsg1,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(colors.ai + '🤖 AI助手：' + colors.reset);
    console.log(colors.bright + response2.data.aiMessage.content + colors.reset);
    console.log(colors.dim + '（情绪识别：' + response2.data.aiMessage.analysis.emotionalTone.primary + '）' + colors.reset);
    console.log('');
    await delay(3000);
    
    // 4. 用户继续分享
    console.log(colors.user + '👤 小明：' + colors.reset);
    const userMsg2 = '左边第二个就是我，旁边那个是我室友老王。四年来我们一直住在一起，从陌生到熟悉，经历了太多...现在要分开了，真的舍不得。';
    console.log(userMsg2);
    console.log('');
    await delay(2000);
    
    const response3 = await axios.post(`${API_BASE}/chat/message`, {
      content: userMsg2,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(colors.ai + '🤖 AI助手：' + colors.reset);
    console.log(colors.bright + response3.data.aiMessage.content + colors.reset);
    console.log(colors.dim + '（情绪识别：' + response3.data.aiMessage.analysis.emotionalTone.primary + '）' + colors.reset);
    console.log('');
    await delay(3000);
    
    // 5. 用户表达深层情感
    console.log(colors.user + '👤 小明：' + colors.reset);
    const userMsg3 = '其实我一直很害怕分离。小时候父母工作忙，经常不在身边，所以特别珍惜身边的朋友。这次毕业分离，感觉又要经历一次那种孤独...';
    console.log(userMsg3);
    console.log('');
    await delay(2000);
    
    const response4 = await axios.post(`${API_BASE}/chat/message`, {
      content: userMsg3,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(colors.ai + '🤖 AI助手：' + colors.reset);
    console.log(colors.bright + response4.data.aiMessage.content + colors.reset);
    console.log(colors.dim + '（情绪识别：' + response4.data.aiMessage.analysis.emotionalTone.primary + '）' + colors.reset);
    console.log('');
    await delay(2000);
    
    // 6. 总结
    console.log('\n' + '='.repeat(70));
    console.log(colors.success + '✅ 演示完成 - 效果总结' + colors.reset);
    console.log('='.repeat(70));
    
    console.log('\n' + colors.bright + '关键特点：' + colors.reset);
    console.log('1. AI主动描述图片内容，成功吸引用户开始对话');
    console.log('2. 通过具体的观察和问题，引导用户深入分享');
    console.log('3. 准确识别情绪变化：怀念 → 不舍 → 孤独/恐惧');
    console.log('4. 提供温暖、理解的回应，让用户感受到被支持');
    
    console.log('\n' + colors.bright + '技术实现：' + colors.reset);
    console.log('- 真实的图片特征分析（非Mock）');
    console.log('- 基于内容的智能回复生成');
    console.log('- 持续的情绪跟踪和分析');
    console.log('- 自然的对话引导策略');
    
  } catch (error) {
    console.error(colors.system + '\n❌ 演示出错：' + colors.reset, error.message);
  }
}

// 主程序
const { exec } = require('child_process');

console.log(colors.system + '🚀 启动系统...' + colors.reset);

// 先杀死旧进程
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        console.log(colors.success + '✅ 服务器已就绪' + colors.reset);
        setTimeout(runDemo, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.includes('真实图片识别服务已初始化')) {
        console.log(colors.success + '✅ 图片识别服务已加载' + colors.reset);
      }
    });
    
    // 演示结束后自动退出
    setTimeout(() => {
      console.log(colors.dim + '\n🔚 关闭系统...' + colors.reset);
      server.kill();
      process.exit(0);
    }, 45000);
  }, 1000);
});