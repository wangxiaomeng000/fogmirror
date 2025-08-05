// 实时话语分析器 - 区分事实与主观判断

export interface UtteranceAnalysis {
  // 事实提取
  facts: Array<{
    content: string;
    certainty: number; // 0-1 确定性
    temporal: 'past' | 'present' | 'future';
    source?: string; // 信息来源
  }>;
  
  // 主观判断识别
  judgments: Array<{
    content: string;
    type: 'moral' | 'emotional' | 'assumptive' | 'evaluative';
    underlyingFacts: string[]; // 可能基于哪些事实
    bias?: string; // 识别的偏见类型
  }>;
  
  // 回避信号
  avoidanceSignals: Array<{
    topic: string;
    indicator: string; // "我不想谈这个" / 突然转话题
    importance: number;
  }>;
  
  // 情绪标记
  emotionalMarkers: Array<{
    emotion: string;
    intensity: number;
    trigger?: string;
  }>;
  
  // 场景细节
  sceneDetails: {
    time?: string;
    place?: string;
    people?: string[];
    dialogues?: string[];
    actions?: string[];
    sensory?: string[]; // 感官细节
  };
}

export class UtteranceAnalyzer {
  // 事实指示词
  private factIndicators = {
    time: ['点', '分', '秒', '年', '月', '日', '昨天', '今天', '明天', '上周', '去年'],
    place: ['在', '到', '去', '来', '家', '公司', '学校', '店', '路'],
    action: ['做', '说', '走', '跑', '看', '听', '拿', '放', '打', '写'],
    sensory: ['看到', '听到', '闻到', '摸到', '尝到', '感觉到']
  };
  
  // 判断指示词
  private judgmentIndicators = {
    moral: ['应该', '不应该', '对', '错', '好', '坏', '善', '恶'],
    emotional: ['喜欢', '讨厌', '爱', '恨', '生气', '开心', '难过', '害怕'],
    assumptive: ['可能', '也许', '大概', '应该是', '肯定', '一定', '估计'],
    evaluative: ['很', '非常', '特别', '格外', '太', '最', '更']
  };
  
  // 回避模式
  private avoidancePatterns = [
    { pattern: /不想(说|谈|提)/g, indicator: '直接回避' },
    { pattern: /算了|没什么/g, indicator: '放弃表达' },
    { pattern: /\.{3,}|。{3,}/g, indicator: '欲言又止' },
    { pattern: /其实没|也没/g, indicator: '否认情绪' },
    { pattern: /换个话题|不说这个/g, indicator: '转移话题' },
    { pattern: /不重要|无所谓/g, indicator: '淡化处理' }
  ];
  
  // 分析话语
  analyze(utterance: string): UtteranceAnalysis {
    const facts = this.extractFacts(utterance);
    const judgments = this.extractJudgments(utterance);
    const avoidanceSignals = this.detectAvoidance(utterance);
    const emotionalMarkers = this.extractEmotions(utterance);
    const sceneDetails = this.extractSceneDetails(utterance);
    
    // 建立事实与判断的关联
    this.linkFactsToJudgments(facts, judgments);
    
    return {
      facts,
      judgments,
      avoidanceSignals,
      emotionalMarkers,
      sceneDetails
    };
  }
  
  // 提取事实
  private extractFacts(text: string): UtteranceAnalysis['facts'] {
    const facts: UtteranceAnalysis['facts'] = [];
    if (!text || typeof text !== 'string') {
      return facts;
    }
    const sentences = this.splitSentences(text);
    
    sentences.forEach(sentence => {
      // 检查是否包含具体细节
      const hasTimeDetail = this.factIndicators.time.some(word => sentence.includes(word));
      const hasPlaceDetail = this.factIndicators.place.some(word => sentence.includes(word));
      const hasActionDetail = this.factIndicators.action.some(word => sentence.includes(word));
      const hasSensoryDetail = this.factIndicators.sensory.some(word => sentence.includes(word));
      
      // 如果包含具体细节且不包含判断词，认为是事实
      if ((hasTimeDetail || hasPlaceDetail || hasActionDetail || hasSensoryDetail) &&
          !this.containsJudgment(sentence)) {
        facts.push({
          content: sentence,
          certainty: this.calculateCertainty(sentence),
          temporal: this.detectTemporal(sentence)
        });
      }
    });
    
    return facts;
  }
  
  // 提取判断
  private extractJudgments(text: string): UtteranceAnalysis['judgments'] {
    const judgments: UtteranceAnalysis['judgments'] = [];
    if (!text || typeof text !== 'string') {
      return judgments;
    }
    const sentences = this.splitSentences(text);
    
    sentences.forEach(sentence => {
      Object.entries(this.judgmentIndicators).forEach(([type, indicators]) => {
        if (indicators.some(word => sentence.includes(word))) {
          const bias = this.detectBias(sentence, type);
          judgments.push({
            content: sentence,
            type: type as any,
            underlyingFacts: [],
            bias
          });
        }
      });
    });
    
    return judgments;
  }
  
  // 检测回避
  private detectAvoidance(text: string): UtteranceAnalysis['avoidanceSignals'] {
    const signals: UtteranceAnalysis['avoidanceSignals'] = [];
    if (!text || typeof text !== 'string') {
      return signals;
    }
    
    this.avoidancePatterns.forEach(({ pattern, indicator }) => {
      const matches = text.match(pattern);
      if (matches) {
        const topic = this.inferAvoidedTopic(text, matches[0]);
        signals.push({
          topic,
          indicator,
          importance: this.calculateImportance(text, matches[0])
        });
      }
    });
    
    return signals;
  }
  
  // 提取情绪
  private extractEmotions(text: string): UtteranceAnalysis['emotionalMarkers'] {
    const emotions: UtteranceAnalysis['emotionalMarkers'] = [];
    if (!text || typeof text !== 'string') {
      return emotions;
    }
    const emotionWords = {
      '生气': ['生气', '愤怒', '火大', '恼火'],
      '难过': ['难过', '伤心', '痛苦', '悲伤'],
      '开心': ['开心', '高兴', '快乐', '愉快'],
      '害怕': ['害怕', '恐惧', '担心', '紧张'],
      '失望': ['失望', '沮丧', '灰心', '无奈']
    };
    
    Object.entries(emotionWords).forEach(([emotion, words]) => {
      words.forEach(word => {
        if (text.includes(word)) {
          emotions.push({
            emotion,
            intensity: this.calculateEmotionIntensity(text, word),
            trigger: this.findEmotionTrigger(text, word)
          });
        }
      });
    });
    
    return emotions;
  }
  
  // 提取场景细节
  private extractSceneDetails(text: string): UtteranceAnalysis['sceneDetails'] {
    const details: UtteranceAnalysis['sceneDetails'] = {};
    if (!text || typeof text !== 'string') {
      return details;
    }
    
    // 时间提取
    const timeMatch = text.match(/([0-9]+[点分秒])|([上下]午)|([早中晚]上?)/);
    if (timeMatch) details.time = timeMatch[0];
    
    // 地点提取
    const placeMatch = text.match(/在(.{1,10})(里|上|下|前|后|旁)/);
    if (placeMatch) details.place = placeMatch[1];
    
    // 人物提取
    const peopleMatches = text.match(/(他|她|我|你|们|大家|所有人)/g);
    if (peopleMatches) details.people = [...new Set(peopleMatches)];
    
    // 对话提取（引号内内容）
    const dialogueMatches = text.match(/["""]([^"""]+)["""]/g);
    if (dialogueMatches) {
      details.dialogues = dialogueMatches.map(d => d.replace(/["""]/g, ''));
    }
    
    // 动作提取
    const actionWords = this.factIndicators.action.filter(word => text.includes(word));
    if (actionWords.length > 0) details.actions = actionWords;
    
    // 感官细节
    const sensoryWords = this.factIndicators.sensory.filter(word => text.includes(word));
    if (sensoryWords.length > 0) details.sensory = sensoryWords;
    
    return details;
  }
  
  // 辅助方法
  private splitSentences(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return text.split(/[。！？；]/).filter(s => s.trim().length > 0);
  }
  
  private containsJudgment(sentence: string): boolean {
    return Object.values(this.judgmentIndicators)
      .flat()
      .some(word => sentence.includes(word));
  }
  
  private calculateCertainty(sentence: string): number {
    if (sentence.includes('肯定') || sentence.includes('确实')) return 0.9;
    if (sentence.includes('可能') || sentence.includes('也许')) return 0.5;
    if (sentence.includes('不确定') || sentence.includes('不知道')) return 0.3;
    return 0.7;
  }
  
  private detectTemporal(sentence: string): 'past' | 'present' | 'future' {
    if (sentence.includes('了') || sentence.includes('过') || sentence.includes('昨') || sentence.includes('去年')) {
      return 'past';
    }
    if (sentence.includes('将') || sentence.includes('要') || sentence.includes('明') || sentence.includes('后')) {
      return 'future';
    }
    return 'present';
  }
  
  private detectBias(sentence: string, type: string): string | undefined {
    const biasPatterns = {
      '绝对化': ['所有', '全部', '每个', '永远', '从不'],
      '标签化': ['就是', '都是', '典型的'],
      '灾难化': ['完了', '毁了', '最糟糕'],
      '读心术': ['肯定在想', '一定是', '他们都']
    };
    
    for (const [bias, patterns] of Object.entries(biasPatterns)) {
      if (patterns.some(p => sentence.includes(p))) {
        return bias;
      }
    }
    
    return undefined;
  }
  
  private inferAvoidedTopic(text: string, avoidancePhrase: string): string {
    const index = text.indexOf(avoidancePhrase);
    const before = text.substring(Math.max(0, index - 50), index);
    const keywords = before.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    return keywords[keywords.length - 1] || '未知话题';
  }
  
  private calculateImportance(text: string, avoidancePhrase: string): number {
    // 基于回避的强度和上下文情绪强度
    const intensity = text.includes('真的') || text.includes('确实') ? 0.8 : 0.5;
    return intensity;
  }
  
  private calculateEmotionIntensity(text: string, emotionWord: string): number {
    const intensifiers = ['很', '非常', '特别', '太', '极其', '超级'];
    const hasIntensifier = intensifiers.some(word => 
      text.includes(word + emotionWord) || text.includes(emotionWord + word)
    );
    return hasIntensifier ? 0.8 : 0.5;
  }
  
  private findEmotionTrigger(text: string, emotionWord: string): string | undefined {
    const index = text.indexOf(emotionWord);
    const before = text.substring(Math.max(0, index - 30), index);
    if (before.includes('因为')) {
      const trigger = before.split('因为')[1];
      return trigger?.trim();
    }
    return undefined;
  }
  
  private linkFactsToJudgments(
    facts: UtteranceAnalysis['facts'],
    judgments: UtteranceAnalysis['judgments']
  ): void {
    // 简单的关联：如果判断和事实在相近位置，建立关联
    judgments.forEach(judgment => {
      facts.forEach(fact => {
        if (this.areRelated(judgment.content, fact.content)) {
          judgment.underlyingFacts.push(fact.content);
        }
      });
    });
  }
  
  private areRelated(judgment: string, fact: string): boolean {
    // 简单的相关性判断：共享关键词
    const judgmentWords: string[] = judgment.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    const factWords: string[] = fact.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    
    let sharedCount = 0;
    for (const word of judgmentWords) {
      if (factWords.includes(word)) {
        sharedCount++;
      }
    }
    return sharedCount >= 2;
  }
}

// 导出单例
export const utteranceAnalyzer = new UtteranceAnalyzer();