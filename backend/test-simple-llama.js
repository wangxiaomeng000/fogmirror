const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testSimple() {
  console.log('=== 简单Llama Vision测试 ===\n');
  
  try {
    // 创建简单测试图片
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync('test-dot.png', imageBuffer);
    
    console.log('1. 健康检查...');
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('服务状态:', health.data);
    
    console.log('\n2. 发送图片分析请求...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test-dot.png'));
    
    const response = await axios.post('http://localhost:3001/api/vision/analyze', formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    console.log('\n3. 分析结果:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 清理
    fs.unlinkSync('test-dot.png');
    
    console.log('\n✅ 测试成功！Llama Vision正常工作');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应:', error.response.data);
    } else if (error.request) {
      console.error('无响应，请检查服务器是否运行');
    } else {
      console.error('错误:', error.message);
    }
    
    // 清理
    if (fs.existsSync('test-dot.png')) {
      fs.unlinkSync('test-dot.png');
    }
  }
}

testSimple();