const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const readline = require('readline');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let authToken = null;
let sessionId = null;

// 颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function print(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

async function initialize() {
  try {
    // 注册用户
    const register = await axios.post(`${API_BASE}/auth/register`, {
      email: `demo${Date.now()}@example.com`,
      password: 'password123',
      name: 'Demo User'
    });
    authToken = register.data.token;
    
    // 创建会话
    const session = await axios.post(`${API_BASE}/chat/session`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    sessionId = session.data.sessionId;
    
    print('\n✅ 系统初始化成功', 'green');
    print('💬 现在可以开始对话了\n', 'cyan');
    
  } catch (error) {
    print('❌ 初始化失败: ' + error.message, 'red');
    process.exit(1);
  }
}

async function sendImage() {
  try {
    print('\n📷 正在上传照片...', 'yellow');
    
    const imageBuffer = fs.readFileSync(PHOTO_PATH);
    const formData = new FormData();
    formData.append('content', ''); // 只上传图片，不说话
    formData.append('sessionId', sessionId);
    formData.append('image', imageBuffer, {
      filename: 'photo.jpg',
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post(`${API_BASE}/chat/message`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    print('\n🤖 AI助手:', 'magenta');
    print(response.data.aiMessage.content, 'bright');
    
    if (response.data.aiMessage.analysis) {
      print('\n💭 情绪分析: ' + response.data.aiMessage.analysis.emotionalTone.primary, 'dim');
    }
    
  } catch (error) {
    print('❌ 发送失败: ' + error.message, 'red');
  }
}

async function sendMessage(text) {
  try {
    const response = await axios.post(`${API_BASE}/chat/message`, {
      content: text,
      sessionId: sessionId
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    print('\n🤖 AI助手:', 'magenta');
    print(response.data.aiMessage.content, 'bright');
    
    if (response.data.aiMessage.analysis) {
      print('\n💭 情绪: ' + response.data.aiMessage.analysis.emotionalTone.primary + 
            ' (强度: ' + response.data.aiMessage.analysis.emotionalTone.intensity + ')', 'dim');
    }
    
  } catch (error) {
    print('❌ 发送失败: ' + error.message, 'red');
  }
}

async function interactive() {
  print('\n' + '='.repeat(60), 'bright');
  print('🎭 心理支持系统 - 交互式演示', 'bright');
  print('='.repeat(60), 'bright');
  print('\n命令说明:', 'yellow');
  print('  /image  - 上传测试照片', 'dim');
  print('  /exit   - 退出程序', 'dim');
  print('  其他    - 发送文字消息\n', 'dim');
  
  await initialize();
  
  const ask = () => {
    rl.question('\n👤 你: ', async (input) => {
      if (input === '/exit') {
        print('\n👋 再见！', 'cyan');
        rl.close();
        process.exit(0);
      } else if (input === '/image') {
        await sendImage();
        ask();
      } else {
        await sendMessage(input);
        ask();
      }
    });
  };
  
  ask();
}

// 主程序
const { exec } = require('child_process');

print('🚀 启动心理支持系统...', 'cyan');

exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        print('✅ 服务器已就绪', 'green');
        setTimeout(interactive, 1000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.includes('真实图片识别服务已初始化')) {
        print('✅ 图片识别服务已加载', 'green');
      }
    });
    
    // 处理退出
    process.on('SIGINT', () => {
      print('\n\n🔚 关闭服务器...', 'dim');
      server.kill();
      rl.close();
      process.exit(0);
    });
  }, 1000);
});