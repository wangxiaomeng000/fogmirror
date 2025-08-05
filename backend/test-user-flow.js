const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const readline = require('readline');

const API_BASE = 'http://localhost:3001/api';
const PHOTO_PATH = '/Users/mac/Desktop/合照.jpg';

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 模拟打字效果
function typeEffect(text, callback) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      process.stdout.write(text[index]);
      index++;
    } else {
      clearInterval(interval);
      console.log('');
      if (callback) callback();
    }
  }, 30);
}

// 等待用户输入
function waitForEnter() {
  return new Promise((resolve) => {
    rl.question('\n按 Enter 继续...', () => {
      resolve();
    });
  });
}

async function simulateUserFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('🎭 心理支持系统 - 完整用户流程测试');
  console.log('='.repeat(60) + '\n');
  
  try {
    // 1. 系统检查
    console.log('⚙️  系统初始化...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 系统状态:', health.data.status);
    console.log('   AI服务:', health.data.services.ai);
    console.log('   数据库:', health.data.services.database);
    await waitForEnter();
    
    // 2. 用户注册/登录
    console.log('\n📝 模拟用户注册...');
    typeEffect('用户名: 小明\n邮箱: xiaoming@example.com\n', async () => {
      const register = await axios.post(`${API_BASE}/auth/register`, {
        email: `user${Date.now()}@example.com`,
        password: 'password123',
        name: '小明'
      });
      const authToken = register.data.token;
      console.log('✅ 注册成功，已获得登录凭证');
      await waitForEnter();
      
      // 3. 创建会话
      console.log('\n💬 创建新的咨询会话...');
      const session = await axios.post(`${API_BASE}/chat/session`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const sessionId = session.data.sessionId;
      console.log('✅ 会话创建成功');
      await waitForEnter();
      
      // 4. 用户上传照片（只上传，不说话）
      console.log('\n🖼️ 场景：用户打开聊天界面，上传了一张照片...');
      console.log('📷 上传照片: 合照.jpg');
      
      const imageBuffer = fs.readFileSync(PHOTO_PATH);
      const formData = new FormData();
      formData.append('content', ''); // 用户没有说话，只是上传图片
      formData.append('sessionId', sessionId);
      formData.append('image', imageBuffer, {
        filename: 'group-photo.jpg',
        contentType: 'image/jpeg'
      });
      
      console.log('\n正在分析照片...\n');
      
      const response1 = await axios.post(`${API_BASE}/chat/message`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('🤖 AI助手:');
      typeEffect(response1.data.aiMessage.content + '\n', async () => {
        await waitForEnter();
        
        // 5. 用户被吸引，开始分享
        console.log('\n👤 用户（被AI的描述吸引，开始分享）:');
        const userReply1 = '是的，你观察得很仔细！这是我们大学毕业时的合照，那天刚好是答辩结束，大家都特别激动。';
        typeEffect(userReply1 + '\n', async () => {
          
          const response2 = await axios.post(`${API_BASE}/chat/message`, {
            content: userReply1,
            sessionId: sessionId
          }, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('\n🤖 AI助手:');
          typeEffect(response2.data.aiMessage.content + '\n', async () => {
            await waitForEnter();
            
            // 6. 用户继续分享更多细节
            console.log('\n👤 用户（开始打开心扉）:');
            const userReply2 = '左边第二个是我，旁边的是我最好的朋友小李。我们四年来一直是室友，经历了很多。现在想想，真的很舍不得分开...';
            typeEffect(userReply2 + '\n', async () => {
              
              const response3 = await axios.post(`${API_BASE}/chat/message`, {
                content: userReply2,
                sessionId: sessionId
              }, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('\n🤖 AI助手:');
              typeEffect(response3.data.aiMessage.content + '\n', async () => {
                console.log('\n💭 情绪分析:', response3.data.aiMessage.analysis.emotionalTone);
                await waitForEnter();
                
                // 7. 用户表达更深层的情感
                console.log('\n👤 用户（情感流露）:');
                const userReply3 = '其实我一直很害怕分离。从小到大，每次和重要的人分开都让我很难过。这次毕业，感觉又要面对一次分离了...';
                typeEffect(userReply3 + '\n', async () => {
                  
                  const response4 = await axios.post(`${API_BASE}/chat/message`, {
                    content: userReply3,
                    sessionId: sessionId
                  }, {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  console.log('\n🤖 AI助手:');
                  typeEffect(response4.data.aiMessage.content + '\n', async () => {
                    console.log('\n💭 情绪变化:', response4.data.aiMessage.analysis.emotionalTone);
                    
                    // 8. 显示会话摘要
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 会话分析摘要');
                    console.log('='.repeat(60));
                    
                    const sessionHistory = await axios.get(`${API_BASE}/chat/session/${sessionId}`, {
                      headers: { Authorization: `Bearer ${authToken}` }
                    });
                    
                    console.log('\n💬 对话轮次:', sessionHistory.data.messages.length);
                    console.log('\n🎯 识别到的关键主题:');
                    const allConcepts = new Set();
                    sessionHistory.data.messages.forEach(msg => {
                      if (msg.analysis && msg.analysis.concepts) {
                        msg.analysis.concepts.forEach(c => allConcepts.add(c));
                      }
                    });
                    console.log('  ', Array.from(allConcepts).join(', '));
                    
                    console.log('\n😊 情绪轨迹:');
                    sessionHistory.data.messages.forEach((msg, index) => {
                      if (msg.analysis && msg.analysis.emotionalTone) {
                        console.log(`   第${index + 1}轮: ${msg.analysis.emotionalTone.primary} (强度: ${msg.analysis.emotionalTone.intensity})`);
                      }
                    });
                    
                    console.log('\n✅ 测试完成！系统成功完成了以下流程:');
                    console.log('   1. AI主动描述图片内容，吸引用户分享');
                    console.log('   2. 根据用户回应，逐步深入对话');
                    console.log('   3. 识别情绪变化，提供适当的情感支持');
                    console.log('   4. 引导用户表达深层感受');
                    
                    rl.close();
                  });
                });
              });
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    rl.close();
  }
}

// 主程序
const { exec } = require('child_process');

console.log('🚀 启动心理支持系统...\n');

// 确保使用 real-image 服务
exec('pkill -f "nodemon"', () => {
  setTimeout(() => {
    const server = exec('npm run dev');
    let ready = false;
    
    server.stdout.on('data', (data) => {
      if (!ready && data.includes('Server is running on port')) {
        ready = true;
        console.log('✅ 服务器已就绪\n');
        setTimeout(() => {
          simulateUserFlow().then(() => {
            setTimeout(() => {
              console.log('\n🔚 关闭服务器...');
              server.kill();
              process.exit(0);
            }, 2000);
          });
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.includes('真实图片识别服务已初始化')) {
        console.log('✅ 图片识别服务已加载');
      }
    });
  }, 1000);
});