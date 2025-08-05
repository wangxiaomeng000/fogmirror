const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUserScenario() {
  console.log('=== 模拟用户场景测试 ===\n');
  console.log('模拟: 用户上传照片并输入文字\n');
  
  const sessionId = 'user-test-' + Date.now();
  
  try {
    // 创建测试图片
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync('user-test.png', imageBuffer);
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('content', '看到这个红点，让我想起了夕阳');
    formData.append('sessionId', sessionId);
    formData.append('image', fs.createReadStream('user-test.png'));
    
    console.log('发送内容:');
    console.log('- 文字: "看到这个红点，让我想起了夕阳"');
    console.log('- 图片: 红色圆点测试图片');
    console.log('- 会话ID:', sessionId);
    console.log();
    
    // 发送请求
    console.log('正在发送请求...');
    const response = await axios.post('http://localhost:3001/api/chat/message', formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    console.log('\n✅ 收到响应!');
    console.log('响应数据结构:', Object.keys(response.data));
    
    if (response.data.message) {
      console.log('\nAI回复:', response.data.message.content);
      console.log('消息角色:', response.data.message.role);
    }
    
    if (response.data.imageAnalysis) {
      console.log('\n图片分析结果:');
      console.log(response.data.imageAnalysis.substring(0, 200) + '...');
    }
    
    if (response.data.sessionId) {
      console.log('\n会话ID确认:', response.data.sessionId);
    }
    
    // 稍等片刻后获取认知地图
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n获取认知地图...');
    const mapResponse = await axios.get(`http://localhost:3001/api/cognitive-map/${sessionId}`);
    
    if (mapResponse.data.cognitiveMap) {
      const map = mapResponse.data.cognitiveMap;
      console.log('\n认知地图状态:');
      console.log('- 节点数:', map.nodes.length);
      console.log('- 连接数:', map.links.length);
      console.log('- 消息数:', mapResponse.data.messageCount);
      
      if (map.nodes.length > 0) {
        console.log('\n前5个节点:');
        map.nodes.slice(0, 5).forEach(node => {
          console.log(`  - ${node.text} (${node.type})`);
        });
      }
    }
    
    console.log('\n✅ 测试成功！系统正常响应用户请求');
    
    // 清理
    fs.unlinkSync('user-test.png');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到服务器，请确保服务器在运行');
    } else {
      console.error('错误:', error.message);
    }
    
    // 清理
    if (fs.existsSync('user-test.png')) {
      fs.unlinkSync('user-test.png');
    }
  }
}

// 运行测试
testUserScenario();