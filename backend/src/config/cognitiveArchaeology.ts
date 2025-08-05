// 认知考古配置 - 基于苏格拉底式对话的认知重构系统

export interface CognitiveNode {
  id: string;
  content: string;
  type: 'fact' | 'insight' | 'belief';
  timestamp: number;
  position: { x: number; y: number; z: number };
  connections: string[];
  tensionLevel?: number; // 张力点强度
}

export const socraticPrompts = {
  // 初始引导
  opening: [
    "让我们从一个具体的画面开始。你现在想到的是什么？",
    "有什么具体的场景或瞬间，让你觉得需要重新理解？",
    "如果要选择一个最困扰你的时刻，那会是什么时候？"
  ],

  // 细节深挖
  detailProbing: {
    time: [
      "这发生在什么时候？具体是哪一年、哪个季节？",
      "那天是什么时间？早上、下午还是晚上？",
      "在那之前和之后，分别发生了什么？"
    ],
    space: [
      "这是在哪里发生的？能描述一下那个地方吗？",
      "当时周围有什么？声音、气味、光线如何？",
      "你站在哪里？其他人在什么位置？"
    ],
    action: [
      "具体发生了什么？谁先做了什么？",
      "然后呢？接下来的动作顺序是怎样的？",
      "有什么具体的话语或手势让你印象深刻？"
    ],
    emotion: [
      "在那个瞬间，你的身体有什么感觉？",
      "如果要用一个画面来形容当时的感受，会是什么？",
      "现在回想起来，哪个细节最让你有情绪波动？"
    ]
  },

  // 张力点探索
  tensionExploration: [
    "在你的描述中，哪个部分让你感觉最矛盾？",
    "有什么是你一直想知道但不确定的？",
    "如果可以问当时的某个人一个问题，你会问什么？"
  ],

  // 认知缺口识别
  gapIdentification: [
    "在这个故事里，有什么是你觉得'不对劲'但说不清的？",
    "如果要填补这个画面的空白，还缺少什么信息？",
    "有哪些你的推测，但其实并不确定是否真实？"
  ],

  // 洞见引导（不给答案，引导发现）
  insightGuidance: [
    "当你把这些细节放在一起看，注意到了什么？",
    "如果从另一个人的角度看这件事，可能会怎么理解？",
    "这让你想起了什么其他的经历或模式吗？"
  ]
};

export const responseRules = {
  // 对话原则
  principles: [
    "永远不给建议或评判",
    "保持好奇和开放",
    "聚焦具体细节而非抽象概念",
    "允许矛盾和不确定性存在",
    "跟随用户的情绪线索但不解读情绪"
  ],

  // 回应策略
  strategies: {
    whenVague: "请求更具体的描述",
    whenEmotional: "引导回到事实细节",
    whenInsightful: "请求更多支撑这个洞见的事实",
    whenStuck: "换个角度询问同一事件"
  }
};

export const visualizationConfig = {
  // 三层颜色定义
  nodeColors: {
    fact: '#3B82F6',      // 蓝色 - 事实层
    insight: '#F59E0B',   // 金色 - 洞见层
    belief: '#EF4444'     // 红色 - 观念层
  },

  // 节点大小
  nodeSizes: {
    fact: 1,
    insight: 1.5,
    belief: 2
  },

  // 力导向布局参数
  forceLayout: {
    chargeStrength: -300,
    linkDistance: 100,
    centerStrength: 0.1,
    velocityDecay: 0.4
  }
};

// 张力点识别算法
export function identifyTensionPoints(nodes: CognitiveNode[]): string[] {
  const tensionPoints: string[] = [];
  
  nodes.forEach(node => {
    // 情绪词汇但缺乏事实支撑
    const emotionWords = ['感觉', '觉得', '好像', '可能', '也许', '应该'];
    const hasEmotion = emotionWords.some(word => node.content.includes(word));
    const factualSupport = nodes.filter(n => 
      n.type === 'fact' && 
      n.connections.includes(node.id)
    ).length;
    
    if (hasEmotion && factualSupport < 2) {
      tensionPoints.push(node.id);
    }
  });
  
  return tensionPoints;
}

// 问题生成算法
export function generateNextQuestion(
  nodes: CognitiveNode[], 
  lastUserInput: string
): string {
  // 1. 检查是否有张力点
  const tensionPoints = identifyTensionPoints(nodes);
  if (tensionPoints.length > 0) {
    const tensionNode = nodes.find(n => n.id === tensionPoints[0]);
    if (tensionNode) {
      return `你提到"${tensionNode.content.substring(0, 20)}..."，能说说具体发生了什么吗？`;
    }
  }

  // 2. 检查认知缺口
  const factNodes = nodes.filter(n => n.type === 'fact');
  const insightNodes = nodes.filter(n => n.type === 'insight');
  
  if (insightNodes.length > factNodes.length / 3) {
    return "让我们回到更多细节。在你刚才说的这些里面，哪个场景最清晰？";
  }

  // 3. 深挖最新话题
  const keywords = extractKeywords(lastUserInput);
  if (keywords.length > 0) {
    const keyword = keywords[0];
    return `关于"${keyword}"，还有什么具体的画面或对话吗？`;
  }

  // 4. 默认深挖策略
  const prompts = socraticPrompts.detailProbing;
  const categories = Object.keys(prompts);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const questions = prompts[category as keyof typeof prompts];
  return questions[Math.floor(Math.random() * questions.length)];
}

function extractKeywords(text: string): string[] {
  // 简单的关键词提取
  const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  return words
    .filter(word => word.length > 2 && word.length < 8)
    .slice(0, 3);
}