const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

// 下载咖啡店测试图片
async function downloadCoffeeShopImage() {
  const imageUrl = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop';
  const imagePath = 'coffee-shop-test.jpg';
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(imagePath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(imagePath);
      });
    }).on('error', (err) => {
      fs.unlink(imagePath, () => {});
      reject(err);
    });
  });
}

// 对话脚本
const dialogueScript = [
  {
    type: 'image_and_text',
    content: '这是我上周在咖啡店拍的，那天发生了一件让我很纠结的事',
    expectResponse: '时间'
  },
  {
    type: 'text',
    content: '是上周三，11月15号下午3点左右，在中关村的一家星巴克',
    expectResponse: '活动|人物'
  },
  {
    type: 'text',
    content: '我一个人在那写代码，准备下周的项目演示。然后我前同事王涛突然进来了',
    expectResponse: '聊|谈话|内容'
  },
  {
    type: 'text',
    content: '他看到我在写代码，就过来打招呼。我们聊了大概40分钟。他说他刚从原公司离职，正在创业，想邀请我加入',
    expectResponse: '项目|条件|什么'
  },
  {
    type: 'text',
    content: '是做AI教育产品的，他说已经拿到天使投资500万。说如果我加入，可以给我15%股份，还有月薪3万',
    expectResponse: '现在|工作|月薪'
  },
  {
    type: 'text',
    content: '我现在在一家大厂做高级工程师，月薪2.5万，年终奖能有10万左右。合同还有8个月到期',
    expectResponse: '时间|考虑|联系'
  },
  {
    type: 'text',
    content: '他说希望我这周末之前给答复，因为他们下周一要开董事会确定团队。他给了我他的新名片，我们互加了微信',
    expectResponse: '其他人|讨论|家人'
  },
  {
    type: 'text',
    content: '我和女朋友说了，她觉得风险太大。我爸妈肯定反对，所以还没告诉他们。我还问了另一个朋友李明，他去年也创业了',
    expectResponse: '建议|李明|经历'
  },
  {
    type: 'text',
    content: '李明说创业确实很累，他去年烧了200万，项目失败了，现在又回去上班了。但他说如果团队靠谱，还是值得试试',
    expectResponse: '团队|成员|背景'
  },
  {
    type: 'text',
    content: '他说CTO是他在腾讯的前同事，有10年经验。还有一个做市场的合伙人，之前在新东方。团队现在有7个人',
    expectResponse: '其他'
  }
];

async function runAutomatedDialogue() {
  console.log('🎭 自动化对话测试开始');
  console.log('场景：咖啡店偶遇引发的职业困惑');
  console.log('='.repeat(60));
  console.log();
  
  const sessionId = 'auto-dialogue-' + Date.now();
  
  try {
    // 下载测试图片
    console.log('📥 下载测试图片...');
    const imagePath = await downloadCoffeeShopImage();
    console.log('✅ 图片准备完成\n');
    
    let messageCount = 0;
    
    // 执行对话脚本
    for (const script of dialogueScript) {
      messageCount++;
      console.log(`\n--- 第${messageCount}轮对话 ---`);
      
      if (script.type === 'image_and_text') {
        // 发送图片和文字
        const formData = new FormData();
        formData.append('content', script.content);
        formData.append('sessionId', sessionId);
        formData.append('image', fs.createReadStream(imagePath));
        
        console.log('👤 用户: [上传图片] ' + script.content);
        
        const response = await axios.post('http://localhost:3001/api/chat/message', formData, {
          headers: formData.getHeaders()
        });
        
        console.log('🤖 AI: ' + response.data.message.content);
        
        if (response.data.imageAnalysis) {
          console.log('📸 [图片分析] ' + response.data.imageAnalysis.substring(0, 100) + '...');
        }
      } else {
        // 只发送文字
        console.log('👤 用户: ' + script.content);
        
        const response = await axios.post('http://localhost:3001/api/chat/message', {
          content: script.content,
          sessionId: sessionId
        });
        
        console.log('🤖 AI: ' + response.data.message.content);
      }
      
      // 短暂延迟，模拟真实对话节奏
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 获取最终的认知地图
    console.log('\n' + '='.repeat(60));
    console.log('📊 对话结束，分析认知地图...\n');
    
    const mapResponse = await axios.get(`http://localhost:3001/api/cognitive-map/${sessionId}`);
    const map = mapResponse.data.cognitiveMap;
    
    // 分析提取的关键信息
    console.log('🔍 关键信息提取:');
    
    // 时间相关
    const timeNodes = map.nodes.filter(n => 
      n.text.includes('周') || n.text.includes('月') || n.text.includes('点') || 
      n.text.includes('分钟') || n.text.includes('年')
    );
    console.log(`\n⏰ 时间信息 (${timeNodes.length}个):`);
    timeNodes.forEach(n => console.log(`   - ${n.text}`));
    
    // 人物相关
    const personNodes = map.nodes.filter(n => 
      n.text.includes('王涛') || n.text.includes('女朋友') || n.text.includes('李明') ||
      n.text.includes('同事') || n.text.includes('爸妈') || n.text.includes('CTO')
    );
    console.log(`\n👥 人物信息 (${personNodes.length}个):`);
    personNodes.forEach(n => console.log(`   - ${n.text}`));
    
    // 数字相关
    const numberNodes = map.nodes.filter(n => 
      /\d+/.test(n.text)
    );
    console.log(`\n💯 数字信息 (${numberNodes.length}个):`);
    numberNodes.forEach(n => console.log(`   - ${n.text}`));
    
    // 地点相关
    const placeNodes = map.nodes.filter(n => 
      n.text.includes('中关村') || n.text.includes('星巴克') || n.text.includes('咖啡店') ||
      n.text.includes('大厂') || n.text.includes('腾讯') || n.text.includes('新东方')
    );
    console.log(`\n📍 地点信息 (${placeNodes.length}个):`);
    placeNodes.forEach(n => console.log(`   - ${n.text}`));
    
    // 统计
    console.log('\n📈 认知地图统计:');
    console.log(`   - 总节点数: ${map.nodes.length}`);
    console.log(`   - 事实节点: ${map.nodes.filter(n => n.type === 'fact').length}`);
    console.log(`   - 洞见节点: ${map.nodes.filter(n => n.type === 'insight').length}`);
    console.log(`   - 连接关系: ${map.links.length}`);
    console.log(`   - 对话轮次: ${messageCount}`);
    console.log(`   - 复杂度: ${map.organism.complexity}`);
    console.log(`   - 进化度: ${map.organism.evolution}`);
    
    // 显示洞见
    const insights = map.nodes.filter(n => n.type === 'insight');
    if (insights.length > 0) {
      console.log('\n💡 生成的洞见:');
      insights.forEach((n, i) => console.log(`   ${i + 1}. ${n.text}`));
    }
    
    console.log('\n✅ 自动化对话测试完成！');
    console.log('🌐 访问 http://localhost:3001 查看完整的3D认知地图');
    
    // 清理
    fs.unlinkSync(imagePath);
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (fs.existsSync('coffee-shop-test.jpg')) {
      fs.unlinkSync('coffee-shop-test.jpg');
    }
  }
}

// 运行测试
console.log('🚀 启动雾镜系统自动化对话测试\n');
runAutomatedDialogue();