require('dotenv').config();
const fs = require('fs');

console.log('\n🔍 测试所有AI服务\n');

// 测试配置
const services = ['local', 'siliconflow', 'openrouter'];
const testImage = fs.readFileSync('/tmp/test_landscape.jpg').toString('base64');

async function testService(serviceName) {
  console.log(`\n=== 测试 ${serviceName} 服务 ===`);
  
  // 临时修改环境变量
  process.env.AI_SERVICE_TYPE = serviceName;
  
  // 清除require缓存以重新加载模块
  delete require.cache[require.resolve('./dist/services/ai/aiServiceFactory')];
  const { aiServiceFactory } = require('./dist/services/ai/aiServiceFactory');
  
  try {
    const service = aiServiceFactory.getCurrentService();
    console.log(`服务名称: ${service.name}`);
    console.log(`服务类型: ${service.constructor.name}`);
    
    // 测试文本
    console.log('\n1. 测试纯文本:');
    const textResult = await service.analyzeMessage('我今天很累');
    console.log(`回复: ${textResult.response}`);
    console.log(`事实: ${textResult.analysis.facts.join(', ')}`);
    
    // 测试图片
    console.log('\n2. 测试图片识别:');
    const imageResult = await service.analyzeMessage('这是风景照片', testImage);
    console.log(`回复: ${imageResult.response}`);
    console.log(`事实: ${imageResult.analysis.facts.join(', ')}`);
    const hasImageFact = imageResult.analysis.facts.some(f => 
      f.includes('图片') || f.includes('风景') || f.includes('照片')
    );
    console.log(`包含图片识别: ${hasImageFact ? '✅' : '❌'}`);
    
    console.log(`\n${serviceName} 测试完成 ✅`);
  } catch (error) {
    console.error(`\n❌ ${serviceName} 服务错误:`, error.message);
  }
}

// 运行测试
async function runTests() {
  for (const service of services) {
    await testService(service);
    console.log('\n' + '='.repeat(50));
  }
  
  // 恢复原始配置
  delete process.env.AI_SERVICE_TYPE;
  console.log('\n✅ 所有测试完成');
  process.exit(0);
}

runTests();