const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api';
const IMAGE_PATH = '/Users/mac/Desktop/合照.jpg';

async function testCognitiveArchaeology() {
  console.log('🧠 认知考古系统测试');
  console.log('===================\n');

  try {
    // 1. 健康检查
    console.log('1️⃣ 健康检查...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ 服务状态:', health.data.status);
    console.log('   AI服务:', health.data.services.ai);
    
    // 2. 测试文本对话
    console.log('\n2️⃣ 测试苏格拉底式对话...');
    const textResponse = await axios.post(`${API_URL}/cognitive/archaeology`, {
      content: '我和前任分手已经三年了，但还是会想起她',
      sessionId: null,
      history: []
    });
    
    console.log('✅ AI响应:', textResponse.data.response);
    console.log('   会话ID:', textResponse.data.sessionId);
    
    const sessionId = textResponse.data.sessionId;
    
    // 3. 测试深入对话
    console.log('\n3️⃣ 测试深入提问...');
    const deepResponse = await axios.post(`${API_URL}/cognitive/archaeology`, {
      content: '最后一次见面是在咖啡店，她说了一些让我困惑的话',
      sessionId: sessionId,
      history: []
    });
    
    console.log('✅ 深入提问:', deepResponse.data.response);
    
    // 4. 测试图片分析
    console.log('\n4️⃣ 测试图片分析...');
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const imageBase64 = imageBuffer.toString('base64');
    
    const imageResponse = await axios.post(`${API_URL}/cognitive/archaeology`, {
      content: '这是我们以前的合照',
      image: imageBase64,
      sessionId: sessionId,
      history: []
    });
    
    console.log('✅ 图片分析响应:', imageResponse.data.response);
    
    // 5. 检查认知节点
    if (imageResponse.data.cognitiveNodes) {
      console.log('\n5️⃣ 认知节点分析:');
      const nodes = imageResponse.data.cognitiveNodes;
      console.log(`   总节点数: ${nodes.length}`);
      console.log(`   事实节点: ${nodes.filter(n => n.type === 'fact').length}`);
      console.log(`   洞见节点: ${nodes.filter(n => n.type === 'insight').length}`);
      console.log(`   观念节点: ${nodes.filter(n => n.type === 'belief').length}`);
      
      const tensionNodes = nodes.filter(n => n.tensionLevel && n.tensionLevel > 0.7);
      if (tensionNodes.length > 0) {
        console.log(`   ⚡ 张力点: ${tensionNodes.length}个`);
        tensionNodes.forEach(node => {
          console.log(`      - "${node.content.substring(0, 30)}..."`);
        });
      }
    }
    
    // 6. 获取认知地图
    console.log('\n6️⃣ 获取认知地图数据...');
    const mapResponse = await axios.get(`${API_URL}/cognitive/cognitive-map/${sessionId}`);
    console.log('✅ 地图数据获取成功');
    console.log(`   节点数: ${mapResponse.data.nodes?.length || 0}`);
    console.log(`   连接数: ${mapResponse.data.connections?.length || 0}`);
    
    console.log('\n✨ 所有测试通过！');
    console.log('\n访问以下地址体验完整系统:');
    console.log('🌐 http://localhost:3000/cognitive-archaeology');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error(error.message);
    }
    
    console.log('\n💡 提示:');
    console.log('1. 确保后端服务运行在 3001 端口');
    console.log('2. 检查环境变量配置');
    console.log('3. 运行: cd backend && npm start');
  }
}

// 运行测试
testCognitiveArchaeology();