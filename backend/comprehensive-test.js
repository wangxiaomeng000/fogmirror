const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

class TestSuite {
  constructor() {
    this.results = [];
    this.authToken = null;
    this.sessionId = null;
    this.userId = null;
  }

  log(message, status = 'info') {
    const symbols = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ '
    };
    console.log(`${symbols[status]} ${message}`);
  }

  async test(name, fn) {
    try {
      console.log(`\n🧪 测试: ${name}`);
      await fn();
      this.results.push({ name, status: 'pass' });
      this.log(`${name} - 通过`, 'success');
    } catch (error) {
      this.results.push({ name, status: 'fail', error: error.message });
      this.log(`${name} - 失败: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           AI心理支持系统 - 综合功能测试                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // 1. 系统健康检查
    await this.test('系统健康检查', async () => {
      const res = await axios.get(`${API_BASE}/health`);
      if (res.data.status !== 'ok') throw new Error('系统状态异常');
      if (res.data.services.ai !== 'siliconflow') throw new Error('AI服务配置错误');
    });

    // 2. 用户注册
    await this.test('用户注册', async () => {
      const email = `test-${Date.now()}@example.com`;
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password: 'Test123456!',
        name: '测试用户'
      });
      if (!res.data.token) throw new Error('注册未返回token');
      this.authToken = res.data.token;
      this.userId = res.data.user._id;
    });

    // 3. 用户登录
    await this.test('用户登录', async () => {
      // 先创建一个用户
      const email = `login-test-${Date.now()}@example.com`;
      await axios.post(`${API_BASE}/auth/register`, {
        email,
        password: 'Test123456!',
        name: '登录测试'
      });
      
      // 测试登录
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password: 'Test123456!'
      });
      if (!res.data.token) throw new Error('登录未返回token');
    });

    // 4. 获取用户信息
    await this.test('获取用户信息', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const res = await axios.get(`${API_BASE}/auth/profile`, config);
      if (!res.data._id) throw new Error('未返回用户信息');
    });

    // 5. 创建会话
    await this.test('创建会话', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const res = await axios.post(`${API_BASE}/chat/session`, {}, config);
      if (!res.data.sessionId) throw new Error('未返回会话ID');
      this.sessionId = res.data.sessionId;
    });

    // 6. 发送纯文本消息
    await this.test('发送纯文本消息', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const res = await axios.post(`${API_BASE}/chat/message`, {
        sessionId: this.sessionId,
        content: '你好，我今天心情有点低落'
      }, config);
      if (!res.data.aiMessage?.content) throw new Error('AI未响应');
      this.log(`AI回复: ${res.data.aiMessage.content.substring(0, 50)}...`, 'info');
    });

    // 7. 发送图片消息
    await this.test('发送图片消息', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const imageBuffer = fs.readFileSync(IMAGE_PATH);
      const base64Image = imageBuffer.toString('base64');
      
      const res = await axios.post(`${API_BASE}/chat/message`, {
        sessionId: this.sessionId,
        content: '看看这张照片',
        image: base64Image
      }, config);
      
      if (!res.data.aiMessage?.content) throw new Error('AI未响应');
      
      // 检查是否识别到关键内容
      const content = res.data.aiMessage.content;
      if (!content.includes('四') && !content.includes('4')) {
        throw new Error('未识别到4个人');
      }
      if (!content.includes('紫色') && !content.includes('证件')) {
        throw new Error('未识别到紫色证件');
      }
      if (!content.includes('高校参访团')) {
        throw new Error('未识别到"高校参访团"文字');
      }
      this.log('AI成功识别图片内容', 'success');
    });

    // 8. 多轮对话上下文
    await this.test('多轮对话上下文保持', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      
      // 第一轮
      await axios.post(`${API_BASE}/chat/message`, {
        sessionId: this.sessionId,
        content: '我叫小明'
      }, config);
      
      // 第二轮 - 测试是否记住名字
      const res = await axios.post(`${API_BASE}/chat/message`, {
        sessionId: this.sessionId,
        content: '你还记得我的名字吗？'
      }, config);
      
      // AI应该能够从上下文中理解
      if (!res.data.aiMessage?.content) throw new Error('AI未响应');
      this.log('AI保持了对话上下文', 'success');
    });

    // 9. 获取会话历史
    await this.test('获取会话历史', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const res = await axios.get(`${API_BASE}/chat/session/${this.sessionId}`, config);
      if (!res.data.messages || res.data.messages.length === 0) {
        throw new Error('未返回会话历史');
      }
      this.log(`会话包含 ${res.data.messages.length} 条消息`, 'info');
    });

    // 10. 获取会话列表
    await this.test('获取会话列表', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const res = await axios.get(`${API_BASE}/chat/sessions`, config);
      if (!res.data.sessions) throw new Error('未返回会话列表');
      this.log(`用户有 ${res.data.sessions.length} 个会话`, 'info');
    });

    // 11. 错误处理测试
    await this.test('错误处理 - 无效token', async () => {
      const config = { headers: { 'Authorization': 'Bearer invalid-token' } };
      try {
        await axios.get(`${API_BASE}/auth/profile`, config);
        throw new Error('应该返回401错误');
      } catch (error) {
        if (error.response?.status !== 401) {
          throw new Error('错误状态码不正确');
        }
      }
    });

    // 12. 并发请求测试
    await this.test('并发请求处理', async () => {
      const config = { headers: { 'Authorization': `Bearer ${this.authToken}` } };
      const promises = [];
      
      // 同时发送3个消息
      for (let i = 0; i < 3; i++) {
        promises.push(
          axios.post(`${API_BASE}/chat/message`, {
            sessionId: this.sessionId,
            content: `并发测试消息 ${i + 1}`
          }, config)
        );
      }
      
      const results = await Promise.all(promises);
      if (results.some(r => !r.data.success)) {
        throw new Error('部分并发请求失败');
      }
    });

    // 打印测试结果
    this.printResults();
  }

  printResults() {
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('                      测试结果汇总');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   └─ 错误: ${result.error}`);
      }
    });
    
    console.log('\n───────────────────────────────────────────────────────────');
    console.log(`总计: ${this.results.length} 项测试`);
    console.log(`通过: ${passed} 项 (${(passed/this.results.length*100).toFixed(1)}%)`);
    console.log(`失败: ${failed} 项`);
    
    if (failed === 0) {
      console.log('\n🎉 所有测试通过！系统运行正常。');
    } else {
      console.log('\n⚠️  部分测试失败，需要修复。');
    }
  }
}

// 运行测试
async function main() {
  const suite = new TestSuite();
  await suite.runAllTests();
}

main().catch(console.error);