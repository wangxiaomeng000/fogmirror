const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testVisionModels() {
  console.log('=== 寻找可用的视觉模型 ===\n');
  
  try {
    // 创建一个简单的测试图片
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFElEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    fs.writeFileSync('test-simple.png', imageBuffer);
    
    // 测试所有模型
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test-simple.png'));
    
    console.log('测试所有可用的视觉模型...\n');
    
    const response = await axios.post('http://localhost:3001/api/vision/test-all', formData, {
      headers: formData.getHeaders()
    });
    
    console.log(`总模型数: ${response.data.totalModels}`);
    console.log(`成功模型数: ${response.data.successCount}\n`);
    
    console.log('测试结果:');
    response.data.results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.model}`);
        console.log(`   响应: ${result.content.substring(0, 100)}...`);
      } else {
        console.log(`❌ ${result.model}`);
        console.log(`   错误: ${JSON.stringify(result.error).substring(0, 100)}...`);
      }
      console.log();
    });
    
    if (response.data.recommendation) {
      console.log(`\n推荐使用: ${response.data.recommendation}`);
      
      // 使用推荐的模型进行详细测试
      console.log('\n使用推荐模型进行详细测试...');
      
      const formData2 = new FormData();
      formData2.append('image', fs.createReadStream('test-simple.png'));
      formData2.append('model', response.data.recommendation);
      
      const detailResponse = await axios.post('http://localhost:3001/api/vision/analyze', formData2, {
        headers: formData2.getHeaders()
      });
      
      console.log('\n详细分析结果:');
      console.log(JSON.stringify(detailResponse.data, null, 2));
    } else {
      console.log('\n❌ 没有找到可用的视觉模型');
    }
    
    // 清理
    fs.unlinkSync('test-simple.png');
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testVisionModels();