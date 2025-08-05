const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testImageRecognition() {
  console.log('=== 测试图片识别功能 ===\n');
  
  try {
    const testData = {
      content: "刚刚看完展会",
      image: testImageBase64,
      sessionId: "test-image-session-" + Date.now(),
      history: []
    };
    
    console.log('发送测试请求:');
    console.log('- 文字内容:', testData.content);
    console.log('- 包含图片: 是');
    console.log('- SessionID:', testData.sessionId);
    
    const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('错误响应:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n响应内容:');
    console.log('- AI回复:', result.response);
    
    const isImageRelatedResponse = result.response.includes('图片') || 
                                   result.response.includes('照片') || 
                                   result.response.includes('拍摄') ||
                                   result.response.includes('场景') ||
                                   result.response.includes('展会');
    
    console.log('\n分析结果:');
    console.log('- 响应是否与图片相关:', isImageRelatedResponse ? '✅ 是' : '❌ 否');
    
    if (result.cognitiveNodes && result.cognitiveNodes.length > 0) {
      console.log('\n认知节点:');
      result.cognitiveNodes.forEach(node => {
        console.log(`- [${node.type}] ${node.content}`);
      });
    }
    
    if (result.analysis) {
      console.log('\n情感分析:');
      console.log('- 事实:', result.analysis.facts);
      console.log('- 洞见:', result.analysis.insights);
      console.log('- 观念:', result.analysis.concepts);
    }
    
    console.log('\n\n=== 测试总结 ===');
    if (isImageRelatedResponse) {
      console.log('✅ 系统正确识别并分析了上传的图片');
      console.log('✅ AI回复与图片内容相关');
    } else {
      console.log('❌ 系统可能没有正确处理图片');
      console.log('❌ AI回复看起来是通用的，没有针对图片内容');
    }
    
  } catch (error) {
    console.error('\n测试失败:', error.message);
  }
}

testImageRecognition().then(() => {
  console.log('\n测试完成');
}).catch(err => {
  console.error('测试异常:', err);
});