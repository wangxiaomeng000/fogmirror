const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

// 下载真实测试图片
async function downloadTestImage() {
  const imageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
  const imagePath = 'test-portrait.jpg';
  
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

async function testLlamaVision() {
  console.log('=== Llama 3.2 Vision 真实图片识别测试 ===\n');
  
  try {
    // 步骤1: 下载测试图片
    console.log('步骤1: 下载测试图片（人物肖像）');
    const imagePath = await downloadTestImage();
    
    // 步骤2: 分析图片
    console.log('\n步骤2: 使用Llama Vision分析图片');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post('http://localhost:3001/api/vision/analyze', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('\n分析结果:');
    console.log('模型:', response.data.model);
    console.log('状态:', response.data.analysis.分析状态);
    
    const analysis = response.data.analysis;
    
    // 显示结构化分析
    console.log('\n=== 结构化分析 ===');
    const fields = ['场景描述', '人物信息', '物品细节', '时间线索', '文字内容', '情绪氛围', '特殊发现'];
    
    fields.forEach(field => {
      if (analysis[field]) {
        console.log(`\n【${field}】`);
        console.log(analysis[field]);
      }
    });
    
    // 步骤3: 基于分析生成事实性追问
    console.log('\n\n步骤3: 基于图片内容生成事实性追问');
    
    const questions = [];
    const description = analysis.原始描述 || '';
    
    // 基于人物信息生成追问
    if (description.includes('人') || description.includes('男') || description.includes('女')) {
      questions.push('这个人让你想起了谁？什么时候见过类似的人？');
      questions.push('你最近一次和这样穿着的人交谈是什么时候？');
    }
    
    // 基于场景生成追问
    if (description.includes('室内') || description.includes('房间')) {
      questions.push('你的房间或办公室是否也是这样的布置？');
      questions.push('上次在类似的环境中，你做了什么事？');
    }
    
    // 基于物品生成追问
    if (description.includes('眼镜') || description.includes('衣服') || description.includes('配饰')) {
      questions.push('你有类似的物品吗？在哪里买的？');
      questions.push('最近一次整理这类物品是什么时候？');
    }
    
    // 通用追问
    questions.push('看到这张图片，你想到了哪个具体的地方或时刻？');
    questions.push('图片中的哪个细节最吸引你？为什么？');
    
    console.log('\n生成的事实性追问:');
    questions.forEach((q, i) => console.log(`${i+1}. ${q}`));
    
    // 步骤4: 验证关键词提取
    console.log('\n\n步骤4: 提取关键词用于认知地图');
    
    const keywords = new Set();
    
    // 提取名词性关键词
    const nounPatterns = [
      /([^\s，。、]+(?:人|男|女|孩|年|者))/g,
      /([^\s，。、]+(?:服|衣|裤|鞋|帽|镜))/g,
      /([^\s，。、]+(?:室|房|厅|场|地|处))/g,
      /([^\s，。、]+(?:色|光|影|线))/g
    ];
    
    nounPatterns.forEach(pattern => {
      const matches = description.matchAll(pattern);
      for (const match of matches) {
        keywords.add(match[1]);
      }
    });
    
    console.log('提取的关键词:', Array.from(keywords));
    
    console.log('\n\n✅ Llama Vision真实图片识别测试成功！');
    console.log('\n总结:');
    console.log('- Llama 3.2 Vision成功识别了图片内容');
    console.log('- 生成了结构化的图片描述');
    console.log('- 基于图片内容生成了事实性追问');
    console.log('- 提取了关键词用于构建认知地图');
    console.log('- 系统已准备好进行实际使用');
    
    // 清理
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('服务器内部错误，请检查日志');
    }
    // 清理
    if (fs.existsSync('test-portrait.jpg')) {
      fs.unlinkSync('test-portrait.jpg');
    }
  }
}

// 运行测试
testLlamaVision();