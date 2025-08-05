const axios = require('axios');

async function testConversationFlow() {
  console.log('🧪 测试对话流程修复');
  console.log('=' . repeat(60));
  
  const baseUrl = 'http://localhost:3001/api';
  let sessionId;
  
  const testMessages = [
    '我想跟你聊聊最近发生的一件事',
    '是上周三，11月15号下午3点左右',
    '在中关村的一家星巴克',
    '我一个人在那写代码，然后我前同事王涛突然进来了',
    '他说他刚创业，想邀请我加入他的公司',
    '是做AI教育产品的，他说已经拿到天使投资500万',
    '我现在在一家大厂做高级工程师，月薪2.5万',
    '他希望我这周末之前给答复',
    '我和女朋友说了，她觉得风险太大'
  ];
  
  try {
    for (let i = 0; i < testMessages.length; i++) {
      console.log(`\n--- 第${i + 1}轮对话 ---`);
      console.log(`👤 用户: ${testMessages[i]}`);
      
      const payload = {
        content: testMessages[i]
      };
      
      if (sessionId) {
        payload.sessionId = sessionId;
      }
      
      const response = await axios.post(`${baseUrl}/chat/message`, payload);
      
      sessionId = response.data.sessionId;
      console.log(`🤖 AI: ${response.data.aiMessage.content}`);
      
      // 检查是否重复提问
      if (response.data.aiMessage.content.includes('能具体说说是什么时候') && i > 1) {
        console.error('❌ 错误：AI重复提问了！');
        break;
      }
      
      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ 对话流程测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
console.log('启动对话流程测试...\n');
testConversationFlow();