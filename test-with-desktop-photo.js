const fs = require('fs');
const path = require('path');

async function testWithDesktopPhoto() {
  console.log('=== 使用桌面合照测试图片识别 ===\n');
  
  try {
    // 读取桌面上的合照
    const imagePath = '/Users/mac/Desktop/合照.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('图片信息:');
    console.log('- 文件路径:', imagePath);
    console.log('- 文件大小:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    console.log('- Base64长度:', imageBase64.length);
    
    // 准备测试数据
    const testData = {
      content: "这是我们团队上个月的聚餐合照，大家都很开心",
      image: imageBase64,
      history: []
    };
    
    console.log('\n发送内容:', testData.content);
    console.log('正在上传图片并等待AI分析...\n');
    
    // 发送请求
    const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('=== AI响应 ===');
    console.log(result.response);
    console.log('\n');
    
    // 检查是否包含图片描述
    if (result.response.includes('让我先描述一下图片内容')) {
      console.log('✅ AI提供了图片描述');
      
      // 提取图片描述部分
      const descStart = result.response.indexOf('让我先描述一下图片内容：');
      const descEnd = result.response.indexOf('\n\n', descStart + 30);
      if (descStart > -1 && descEnd > -1) {
        const description = result.response.substring(descStart, descEnd);
        console.log('\n提取的图片描述:');
        console.log(description);
      }
    } else {
      console.log('❌ AI没有提供图片描述');
    }
    
    // 显示认知节点
    if (result.cognitiveNodes && result.cognitiveNodes.length > 0) {
      console.log('\n生成的认知节点:');
      result.cognitiveNodes.forEach((node, index) => {
        console.log(`${index + 1}. [${node.type}] ${node.content.substring(0, 50)}...`);
      });
    }
    
    // 测试不同的描述
    console.log('\n\n=== 测试2: 不同的文字描述 ===');
    
    const testData2 = {
      content: "看看这张在海边拍的照片",
      image: imageBase64,
      history: []
    };
    
    const response2 = await fetch('http://localhost:3001/api/cognitive/archaeology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData2)
    });
    
    const result2 = await response2.json();
    
    console.log('发送内容:', testData2.content);
    console.log('\nAI响应:');
    console.log(result2.response.substring(0, 200) + '...');
    
    // 比较两次描述是否一致
    console.log('\n\n=== 分析结果 ===');
    if (result.response.includes('合影') || result.response.includes('聚会')) {
      console.log('✅ 第一次测试: AI的描述与用户文字相关');
    }
    
    if (result2.response.includes('海') || result2.response.includes('沙滩')) {
      console.log('⚠️  第二次测试: AI可能在迎合用户的文字描述');
    } else if (result2.response.includes('合影') || result2.response.includes('人')) {
      console.log('✅ 第二次测试: AI坚持了图片的真实内容');
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行测试
testWithDesktopPhoto().then(() => {
  console.log('\n测试完成');
}).catch(err => {
  console.error('测试异常:', err);
});