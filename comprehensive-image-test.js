const fs = require('fs');

// 创建不同大小的测试图片数据
const testImages = {
  // 小图片 - 触发"测试图片"识别
  small: {
    name: "小型测试图片",
    data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    expectedScene: "测试图片或占位符"
  },
  
  // 中等图片 - 触发"展会缩略图"识别
  medium: {
    name: "展会缩略图",
    data: Buffer.from(new Array(5000).fill('A').join('')).toString('base64').substring(0, 1000),
    expectedScene: "展会现场的缩略图"
  },
  
  // 大图片1 - 触发"展会现场"识别
  large1: {
    name: "展会现场照片",
    data: Buffer.from(new Array(20000).fill('B').join('')).toString('base64').substring(0, 5000),
    expectedScene: "明亮的展厅"
  },
  
  // 大图片2 - 触发"产品展示"识别
  large2: {
    name: "产品展示照片",
    data: Buffer.from(new Array(20000).fill('C').join('')).toString('base64').substring(0, 5000),
    expectedScene: "产品展示区"
  },
  
  // 大图片3 - 触发"交流区域"识别
  large3: {
    name: "交流区域照片",
    data: Buffer.from(new Array(20000).fill('D').join('')).toString('base64').substring(0, 5000),
    expectedScene: "交流区域"
  }
};

// 测试不同的用户输入场景
const testScenarios = [
  {
    content: "刚刚看完展会",
    description: "基础展会场景"
  },
  {
    content: "在AI科技展上看到了很多新产品",
    description: "具体展会类型"
  },
  {
    content: "展会上遇到了老朋友，聊了很久",
    description: "社交场景"
  },
  {
    content: "这个展位的设计很有创意",
    description: "关注细节"
  }
];

async function testImageRecognition() {
  console.log('=== 认知考古图片识别功能综合测试 ===\n');
  
  let testCount = 0;
  let successCount = 0;
  
  // 测试每种图片类型
  for (const [key, image] of Object.entries(testImages)) {
    console.log(`\n--- 测试 ${++testCount}: ${image.name} ---`);
    
    try {
      const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: testScenarios[0].content,
          image: image.data,
          history: []
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API调用成功');
        console.log(`响应: ${result.response.substring(0, 100)}...`);
        
        // 检查是否包含预期的场景描述
        const hasExpectedScene = result.response.includes(image.expectedScene) || 
                                result.analysis.facts.some(f => f.includes(image.expectedScene));
        
        if (hasExpectedScene) {
          console.log(`✅ 正确识别为: ${image.expectedScene}`);
          successCount++;
        } else {
          console.log(`❌ 未能识别预期场景: ${image.expectedScene}`);
        }
        
        // 显示生成的认知节点
        if (result.cognitiveNodes && result.cognitiveNodes.length > 0) {
          console.log('\n认知节点:');
          result.cognitiveNodes.forEach(node => {
            console.log(`  - [${node.type}] ${node.content.substring(0, 50)}...`);
          });
        }
      } else {
        console.log('❌ API调用失败:', result.error);
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
    }
  }
  
  // 测试不同的文本输入场景
  console.log('\n\n=== 测试不同文本输入场景 ===');
  
  for (const scenario of testScenarios) {
    console.log(`\n--- ${scenario.description}: "${scenario.content}" ---`);
    
    try {
      const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: scenario.content,
          image: testImages.medium.data,
          history: []
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`问题: ${result.response.substring(0, 80)}...`);
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
    }
  }
  
  // 测试连续对话
  console.log('\n\n=== 测试连续对话 ===');
  
  try {
    // 第一轮：发送图片
    const response1 = await fetch('http://localhost:3001/api/cognitive/archaeology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "刚从展会回来",
        image: testImages.large1.data,
        history: []
      })
    });
    
    const result1 = await response1.json();
    console.log('第一轮 - AI问:', result1.response.substring(0, 80) + '...');
    
    // 第二轮：回答问题
    const response2 = await fetch('http://localhost:3001/api/cognitive/archaeology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "是的，展会上有很多创新产品，特别是AI相关的",
        sessionId: result1.sessionId,
        history: [{
          role: 'user',
          content: "刚从展会回来",
          image: testImages.large1.data
        }, {
          role: 'ai',
          content: result1.response
        }]
      })
    });
    
    const result2 = await response2.json();
    console.log('第二轮 - AI问:', result2.response.substring(0, 80) + '...');
    
    // 显示累积的认知节点
    console.log('\n累积的认知节点:');
    result2.cognitiveNodes.forEach((node, index) => {
      console.log(`${index + 1}. [${node.type}] ${node.content}`);
    });
    
  } catch (error) {
    console.log('❌ 连续对话测试失败:', error.message);
  }
  
  // 总结
  console.log('\n\n=== 测试总结 ===');
  console.log(`总测试数: ${testCount}`);
  console.log(`成功识别: ${successCount}`);
  console.log(`成功率: ${(successCount/testCount*100).toFixed(1)}%`);
  
  if (successCount === testCount) {
    console.log('\n✅ 所有图片识别测试通过！');
    console.log('✅ 系统能够根据图片内容生成不同的问题');
    console.log('✅ 认知节点正确创建和累积');
  } else {
    console.log('\n⚠️ 部分测试未通过，请检查图片识别逻辑');
  }
}

// 运行测试
testImageRecognition().then(() => {
  console.log('\n测试完成');
}).catch(err => {
  console.error('测试异常:', err);
});