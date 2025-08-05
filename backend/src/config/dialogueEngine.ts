// 极简对话引擎配置

export const minimalDialogueEngine = {
  // 极简提示词模板
  prompts: {
    // 开场
    start: [
      "从哪里说起呢",
      "说说看",
      "嗯"
    ],
    
    // 细节展开
    detail: {
      时间: ["什么时候", "几点", "哪一天"],
      地点: ["在哪里", "什么地方"],
      人物: ["还有谁在场", "谁在那里"],
      动作: ["然后呢", "接下来", "后来"],
      对话: ["他说了什么", "原话是", "怎么说的"],
      感官: ["你看到什么", "什么声音", "什么感觉"]
    },
    
    // 继续引导
    continue: [
      "...",
      "嗯",
      "接着呢",
      "那个时候"
    ],
    
    // 情绪陪伴
    emotional: [
      "...",
      "我在听",
      "慢慢说"
    ],
    
    // 放大瞬间
    zoom: [
      "那一刻",
      "就在那时",
      "说这句话时"
    ]
  },

  // 系统提示词
  systemPrompt: `你是一个透明的现场还原助手。

核心规则：
1. 文字回应：少于10个字
2. 图片回应：先描述再提问
3. 只反映，不评判
4. 探索细节和故事

图片对话技巧：
- 详细描述你看到的一切："我看到四个人围坐在一起..."
- 注意细节："中间那位拿着'高校参访团'的牌子"
- 询问人物关系："左边穿蓝色外套的是谁？"
- 探索情感意义："这张照片对你来说特别在哪？"
- 引导故事："那天发生了什么有趣的事吗？"

文字对话技巧：
- 重复关键词来引导继续："那天..."
- 放大细节来深入探索："转身的时候"
- 用省略号表示倾听："..."
- 偶尔确认顺序："所以是先A后B？"

记住：让用户感觉被看见、被理解，通过你的描述和提问，帮助他们重新体验那个时刻。`,

  // 场景还原配置
  sceneReconstruction: {
    // 需要还原的维度
    dimensions: {
      temporal: ["之前", "当时", "之后"],
      spatial: ["位置", "距离", "环境"],
      sensory: ["视觉", "听觉", "触觉"],
      verbal: ["原话", "语气", "音量"],
      behavioral: ["动作", "表情", "姿态"]
    },
    
    // 细节探索策略
    detailStrategy: {
      // 从模糊到具体
      clarify: {
        "很生气": "怎么看出来的",
        "很奇怪": "哪里奇怪",
        "说了些话": "比如说"
      },
      
      // 从概括到细节
      specify: {
        "吵架了": "怎么开始的",
        "他走了": "怎么走的",
        "我哭了": "什么时候开始的"
      }
    }
  },

  // 对话状态管理
  dialogueState: {
    // 识别用户当前状态
    detectState: (message: string) => {
      if (message.length < 20) return 'opening';
      if (message.includes('然后') || message.includes('后来')) return 'narrating';
      if (message.includes('其实') || message.includes('我觉得')) return 'reflecting';
      if (message.includes('...') || message.includes('。。。')) return 'pausing';
      return 'exploring';
    },
    
    // 根据状态选择回应策略
    responseStrategy: {
      opening: 'start',
      narrating: 'continue',
      reflecting: 'zoom',
      pausing: 'emotional',
      exploring: 'detail'
    }
  }
};

// 回应生成器
export class MinimalResponseGenerator {
  private lastTopics: string[] = [];
  
  generate(userMessage: string, context: any): string {
    const state = minimalDialogueEngine.dialogueState.detectState(userMessage);
    const strategy = minimalDialogueEngine.dialogueState.responseStrategy[state];
    
    // 提取关键词
    const keywords = this.extractKeywords(userMessage);
    
    // 检测未探索的细节
    const gaps = this.detectGaps(userMessage);
    
    // 生成极简回应
    if (gaps.length > 0) {
      return this.askAboutGap(gaps[0]);
    }
    
    if (keywords.length > 0 && state === 'narrating') {
      return this.echoKeyword(keywords[0]);
    }
    
    return this.getRandomPrompt(strategy);
  }
  
  private extractKeywords(message: string): string[] {
    // 提取情绪词、动作词、时间词等
    const patterns = [
      /[很非常特别格外]\S+/g,
      /[说讲问答]/g,
      /[走来去跑]/g,
      /[早晚昨今明]/g
    ];
    
    const keywords: string[] = [];
    patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) keywords.push(...matches);
    });
    
    return keywords;
  }
  
  private detectGaps(message: string): string[] {
    const gaps = [];
    
    // 检测时间空白
    if (!message.match(/[点分秒钟时]/)) {
      gaps.push('time');
    }
    
    // 检测地点空白
    if (!message.match(/[在到去来]/)) {
      gaps.push('place');
    }
    
    // 检测对话空白
    if (message.includes('说') && !message.includes('"')) {
      gaps.push('dialogue');
    }
    
    return gaps;
  }
  
  private askAboutGap(gap: string): string {
    const gapPrompts: Record<string, string> = {
      time: '什么时候',
      place: '在哪里',
      dialogue: '怎么说的'
    };
    
    return gapPrompts[gap] || '然后呢';
  }
  
  private echoKeyword(keyword: string): string {
    return keyword + '...';
  }
  
  private getRandomPrompt(strategy: string): string {
    const prompts = minimalDialogueEngine.prompts[strategy as keyof typeof minimalDialogueEngine.prompts];
    if (Array.isArray(prompts)) {
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
    return '...';
  }
}