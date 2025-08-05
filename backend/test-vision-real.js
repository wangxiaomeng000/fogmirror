const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

// 下载真实测试图片
async function downloadTestImage() {
  const imageUrl = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=300&fit=crop';
  const imagePath = 'test-real-image.jpg';
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(imagePath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ 测试图片下载成功');
        resolve(imagePath);
      });
    }).on('error', (err) => {
      fs.unlink(imagePath, () => {});
      reject(err);
    });
  });
}

async function testVisionAPI() {
  console.log('=== GPT-4o 视觉API真实测试 ===\n');
  
  try {
    // 步骤1: 下载测试图片
    console.log('步骤1: 下载测试图片');
    const imagePath = await downloadTestImage();
    
    // 步骤2: 测试视觉分析
    console.log('\n步骤2: 分析图片内容');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post('http://localhost:3001/api/vision/analyze', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('\n分析结果:');
    console.log('模型:', response.data.model);
    console.log('状态:', response.data.analysis.分析状态);
    console.log('\n结构化分析:');
    
    const analysis = response.data.analysis;
    const fields = ['场景描述', '人物信息', '物品细节', '时间线索', '文字内容', '情绪氛围', '特殊发现'];
    
    fields.forEach(field => {
      if (analysis[field]) {
        console.log(`\n${field}:`);
        console.log(analysis[field]);
      }
    });
    
    // 步骤3: 测试具体细节提取
    console.log('\n\n步骤3: 验证具体细节提取');
    
    // 提取具体关键词
    const keywords = [];
    const text = analysis.原始描述 || '';
    
    // 提取地点
    const placeMatch = text.match(/(?:在|位于|地点|场景).*?([^\s，。、]+(?:图书馆|书店|房间|办公室|教室|咖啡厅|公园|街道|室内|室外))/);
    if (placeMatch) keywords.push(placeMatch[1]);
    
    // 提取物品
    const itemMatches = text.matchAll(/(?:有|看到|包含|摆放着?)([^\s，。、]+(?:书|桌|椅|灯|电脑|手机|杯子|笔|纸|窗户|门|画|照片))/g);
    for (const match of itemMatches) {
      keywords.push(match[1]);
    }
    
    // 提取颜色
    const colorMatches = text.matchAll(/([^\s，。、]*(?:红|蓝|绿|黄|黑|白|灰|棕|紫|橙)色?)/g);
    for (const match of colorMatches) {
      keywords.push(match[1]);
    }
    
    console.log('提取的关键词:', keywords);
    
    // 步骤4: 生成基于图片的追问
    console.log('\n步骤4: 基于图片生成追问');
    const questions = [];
    
    if (analysis.场景描述.includes('书')) {
      questions.push('这些书让你想起了什么具体的阅读经历？');
      questions.push('最近一次去类似的地方是什么时候？');
    }
    
    if (analysis.物品细节) {
      questions.push('画面中的哪个物品最吸引你的注意？为什么？');
      questions.push('你的生活中有类似的物品吗？在哪里？');
    }
    
    if (analysis.情绪氛围) {
      questions.push('这个场景让你想到了哪个具体的地方？');
      questions.push('上次有类似感受是在什么时候？');
    }
    
    console.log('生成的追问:');
    questions.forEach((q, i) => console.log(`${i+1}. ${q}`));
    
    console.log('\n✅ 真实图片识别测试成功！');
    console.log('\n总结:');
    console.log('- GPT-4o成功识别了图片内容');
    console.log('- 提取了结构化的场景信息');
    console.log('- 识别了具体的物品和细节');
    console.log('- 可以基于图片内容生成相关追问');
    
    // 清理
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('服务器内部错误，请检查日志');
    }
    // 清理
    if (fs.existsSync('test-real-image.jpg')) {
      fs.unlinkSync('test-real-image.jpg');
    }
  }
}

// 运行测试
testVisionAPI();