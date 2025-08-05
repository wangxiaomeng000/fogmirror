const fs = require('fs');
const http = require('http');

async function testCognitiveWithImage() {
  try {
    // 读取桌面合照
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('测试认知考古系统 - 使用真实图片API');
    console.log('图片大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    const postData = JSON.stringify({
      content: '这是我们的高校参访团合照，看到这张照片让我想起很多事情',
      image: imageBase64,
      history: []
    });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cognitive/archaeology',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Bearer test-token'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n响应结果:');
          console.log(JSON.stringify(result, null, 2));
          
          if (result.success && result.response) {
            console.log('\n🎯 认知考古回复:');
            console.log(result.response);
            
            if (result.analysis) {
              console.log('\n📊 分析结果:');
              console.log('- 事实:', result.analysis.facts);
              console.log('- 洞见:', result.analysis.insights);
              console.log('- 情感基调:', result.analysis.emotionalTone);
            }
          }
        } catch (e) {
          console.error('解析响应失败:', e.message);
          console.log('原始响应:', data);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('请求失败:', e.message);
    });
    
    req.write(postData);
    req.end();
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 先检查后端日志
console.log('\n========== 测试开始 ==========');
console.log('请查看后端日志以确认使用的AI服务');
console.log('=============================\n');

testCognitiveWithImage();