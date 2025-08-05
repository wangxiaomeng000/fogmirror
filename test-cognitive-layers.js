const http = require('http');
const fs = require('fs');

// 认知考古对话剧本 - 探索"完美主义"主题
const dialogueScript = [
  {
    content: "最近总是在截止日期前一天通宵改方案，明明已经挺好了，但总觉得还能更完美",
    expectedExtraction: {
      facts: ["截止日期前一天", "通宵改方案"],
      insights: ["总觉得还能更完美"],
      tensionPoints: ["明明已经挺好了，但总觉得还能更完美"]
    }
  },
  {
    content: "上周五的提案，我改了12版，最后交的还是第3版，因为后面越改越觉得不对",
    image: "/Users/mac/Desktop/合照.jpg", // 使用真实图片增加复杂度
    expectedExtraction: {
      facts: ["上周五的提案", "改了12版", "最后交的还是第3版"],
      insights: ["后面越改越觉得不对"],
      concepts: ["追求完美导致的决策困难"]
    }
  },
  {
    content: "经理说我的方案很好，但我听到的时候，脑子里想的是'他只是在安慰我'",
    expectedExtraction: {
      facts: ["经理说我的方案很好"],
      insights: ["脑子里想的是'他只是在安慰我'"],
      tensionPoints: ["外部认可与内在怀疑的矛盾"]
    }
  },
  {
    content: "小时候爸妈常说'要做就做到最好'，现在我发现自己永远觉得不够好",
    expectedExtraction: {
      facts: ["小时候爸妈常说'要做就做到最好'"],
      insights: ["现在我发现自己永远觉得不够好"],
      concepts: ["童年教育对成年行为模式的影响", "完美主义的代际传递"]
    }
  },
  {
    content: "其实第3版确实是最平衡的，后面的修改都是在过度优化细节，反而失去了整体感",
    expectedExtraction: {
      facts: ["第3版确实是最平衡的", "后面的修改都是在过度优化细节"],
      insights: ["反而失去了整体感", "认识到过度优化的问题"],
      concepts: ["平衡感的重要性", "过度优化的陷阱"]
    }
  }
];

let sessionId = null;
let messageIndex = 0;

async function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cognitive/archaeology',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Bearer test-token'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response: ' + e.message));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runDialogue() {
  console.log('🎭 开始认知考古对话测试');
  console.log('📝 主题：探索完美主义的认知模式\n');
  
  for (const turn of dialogueScript) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📤 用户消息 ${messageIndex + 1}/${dialogueScript.length}:`);
    console.log(`"${turn.content}"`);
    if (turn.image) {
      console.log(`📷 附带图片: ${turn.image}`);
    }
    
    try {
      // 准备请求数据
      const requestData = {
        content: turn.content,
        sessionId: sessionId,
        history: []
      };
      
      // 如果有图片，添加图片数据
      if (turn.image && fs.existsSync(turn.image)) {
        const imageBuffer = fs.readFileSync(turn.image);
        requestData.image = imageBuffer.toString('base64');
      }
      
      // 发送请求
      const result = await makeRequest(requestData);
      
      // 保存sessionId供后续使用
      if (!sessionId && result.sessionId) {
        sessionId = result.sessionId;
        console.log(`\n🔑 会话ID: ${sessionId}`);
      }
      
      // 显示AI响应
      console.log(`\n🤖 AI响应:`);
      console.log(`"${result.response}"`);
      
      // 分析提取的内容
      if (result.analysis) {
        console.log(`\n📊 内容提取分析:`);
        console.log(`├─ 事实层 [${result.analysis.facts?.length || 0}项]:`, result.analysis.facts || []);
        console.log(`├─ 洞见层 [${result.analysis.insights?.length || 0}项]:`, result.analysis.insights || []);
        console.log(`├─ 观念层 [${result.analysis.concepts?.length || 0}项]:`, result.analysis.concepts || []);
        console.log(`└─ 情感基调: ${result.analysis.emotionalTone?.primary || 'N/A'} (强度: ${result.analysis.emotionalTone?.intensity || 0})`);
      }
      
      // 显示认知节点
      if (result.cognitiveNodes && result.cognitiveNodes.length > 0) {
        console.log(`\n🧠 认知节点 [${result.cognitiveNodes.length}个]:`);
        result.cognitiveNodes.forEach((node, idx) => {
          console.log(`  ${idx + 1}. [${node.type}] ${node.content.substring(0, 50)}... (张力: ${node.tensionLevel})`);
        });
      }
      
      // 验证提取是否符合预期
      if (turn.expectedExtraction) {
        console.log(`\n✅ 预期提取验证:`);
        const expected = turn.expectedExtraction;
        const actual = result.analysis || {};
        
        // 验证事实层
        if (expected.facts) {
          const foundFacts = expected.facts.filter(fact => 
            actual.facts?.some(f => f.includes(fact))
          );
          console.log(`├─ 事实层: ${foundFacts.length}/${expected.facts.length} 匹配`);
        }
        
        // 验证洞见层
        if (expected.insights) {
          const foundInsights = expected.insights.filter(insight => 
            actual.insights?.some(i => i.includes(insight))
          );
          console.log(`├─ 洞见层: ${foundInsights.length}/${expected.insights.length} 匹配`);
        }
        
        // 验证观念层
        if (expected.concepts) {
          const foundConcepts = expected.concepts.filter(concept => 
            actual.concepts?.some(c => c.includes(concept))
          );
          console.log(`└─ 观念层: ${foundConcepts.length}/${expected.concepts.length} 匹配`);
        }
      }
      
      messageIndex++;
      
      // 等待2秒再发送下一条消息
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`\n❌ 错误:`, error.message);
      break;
    }
  }
  
  // 最终总结
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📈 对话测试完成！`);
  console.log(`✅ 完成了 ${messageIndex} 轮对话`);
  
  if (sessionId) {
    console.log(`\n💡 提示：可以访问以下URL查看认知地图：`);
    console.log(`http://localhost:3000/cognitive-archaeology?sessionId=${sessionId}`);
  }
}

// 执行测试
runDialogue().catch(console.error);