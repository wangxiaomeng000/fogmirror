require('dotenv').config();

console.log('=== 环境变量测试 ===');
console.log('AI_SERVICE_TYPE:', process.env.AI_SERVICE_TYPE);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '已设置' : '未设置');
console.log('工作目录:', process.cwd());
console.log('===================');

// 测试服务工厂
const { aiServiceFactory } = require('./dist/services/ai/aiServiceFactory');

console.log('\n=== 测试服务工厂 ===');
try {
  const service = aiServiceFactory.getCurrentService();
  console.log('获取的服务名称:', service.name);
  console.log('服务对象:', service.constructor.name);
} catch (error) {
  console.error('错误:', error.message);
}