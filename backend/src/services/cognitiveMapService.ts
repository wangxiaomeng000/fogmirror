// 认知地图服务 - 管理用户的认知建模

import { CognitiveMap } from '../models/CognitiveMap';

export class CognitiveMapService {
  private maps: Map<string, CognitiveMap> = new Map();

  // 获取或创建认知地图
  getOrCreateMap(sessionId: string): CognitiveMap {
    if (!this.maps.has(sessionId)) {
      this.maps.set(sessionId, new CognitiveMap(sessionId));
    }
    return this.maps.get(sessionId)!;
  }

  // 分析消息并更新认知地图
  analyzeAndUpdate(sessionId: string, message: string, analysis: any) {
    const map = this.getOrCreateMap(sessionId);

    // 1. 从分析中提取主题
    const topics = this.extractTopics(message, analysis);
    
    // 2. 更新认知区域
    topics.forEach(topic => {
      const clarity = analysis.sceneDetails ? 0.7 : 0.3;
      const emotionalWeight = analysis.emotionalTone?.intensity || 0.5;
      map.addOrUpdateArea(topic.name, clarity, emotionalWeight);
    });

    // 3. 检测回避信号
    const avoidanceSignals = this.detectAvoidance(message);
    avoidanceSignals.forEach(signal => {
      map.markAvoidance(signal.topic, signal.indicator);
    });

    // 4. 发现连接
    if (analysis.facts && analysis.facts.length > 1) {
      // 连接相关的事实
      for (let i = 0; i < analysis.facts.length - 1; i++) {
        const fact1 = analysis.facts[i];
        const fact2 = analysis.facts[i + 1];
        const connectionType = this.inferConnectionType(fact1, fact2);
        if (connectionType) {
          map.addConnection(
            this.extractMainTopic(fact1),
            this.extractMainTopic(fact2),
            connectionType,
            `${fact1} → ${fact2}`
          );
        }
      }
    }

    return map.generateMapData();
  }

  // 提取话题
  private extractTopics(message: string, analysis: any): Array<{name: string, type: string}> {
    const topics: Array<{name: string, type: string}> = [];

    // 从场景细节中提取
    if (analysis.sceneDetails) {
      if (analysis.sceneDetails.place) {
        topics.push({ name: analysis.sceneDetails.place, type: 'location' });
      }
      if (analysis.sceneDetails.people?.length > 0) {
        analysis.sceneDetails.people.forEach((person: string) => {
          topics.push({ name: person, type: 'person' });
        });
      }
    }

    // 从情绪中提取
    if (analysis.emotionalTone?.primary) {
      topics.push({ name: analysis.emotionalTone.primary, type: 'emotion' });
    }

    // 从关键词中提取
    const keywords = this.extractKeywords(message);
    keywords.forEach(keyword => {
      topics.push({ name: keyword, type: 'keyword' });
    });

    return topics;
  }

  // 检测回避信号
  private detectAvoidance(message: string): Array<{topic: string, indicator: string}> {
    const signals: Array<{topic: string, indicator: string}> = [];
    
    if (!message || typeof message !== 'string') {
      return signals;
    }
    
    const avoidancePatterns = [
      { pattern: /不想(说|谈|提)/g, indicator: '直接回避' },
      { pattern: /算了|没什么/g, indicator: '放弃表达' },
      { pattern: /\.{3,}|。{3,}/g, indicator: '欲言又止' },
      { pattern: /其实没|也没/g, indicator: '否认情绪' },
      { pattern: /换个话题|不说这个/g, indicator: '转移话题' }
    ];

    avoidancePatterns.forEach(({ pattern, indicator }) => {
      try {
        const matches = message.match(pattern);
        if (matches && matches.length > 0 && matches[0]) {
          // 尝试从上下文推断话题
          const topic = this.inferTopicFromContext(message, matches[0]);
          signals.push({ topic, indicator });
        }
      } catch (error) {
        console.error('Error in detectAvoidance:', error);
      }
    });

    return signals;
  }

  // 推断连接类型
  private inferConnectionType(fact1: string, fact2: string): 'causal' | 'temporal' | 'emotional' | 'logical' | 'contradictory' | null {
    // 因果关系
    if (fact1.includes('因为') || fact2.includes('所以')) return 'causal';
    
    // 时间关系
    if (fact1.includes('后') || fact2.includes('前') || fact2.includes('然后')) return 'temporal';
    
    // 情绪关系
    const emotionWords = ['生气', '难过', '开心', '失望', '感动', '愤怒'];
    if (emotionWords.some(word => fact1.includes(word) || fact2.includes(word))) return 'emotional';
    
    // 矛盾关系
    if ((fact1.includes('但是') || fact2.includes('可是')) ||
        (fact1.includes('不') && !fact2.includes('不'))) return 'contradictory';
    
    // 默认逻辑关系
    return 'logical';
  }

  // 提取关键词
  private extractKeywords(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    // 移除标点符号
    const cleaned = text.replace(/[，。！？、：；""''（）]/g, ' ');
    
    // 分词并过滤
    const words = cleaned.split(/\s+/)
      .filter(word => word.length > 1)
      .filter(word => !['的', '了', '是', '在', '我', '他', '她', '和', '与'].includes(word));
    
    // 统计词频
    const freq = new Map<string, number>();
    words.forEach(word => {
      freq.set(word, (freq.get(word) || 0) + 1);
    });
    
    // 返回高频词
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  // 从上下文推断话题
  private inferTopicFromContext(message: string, avoidancePhrase: string): string {
    const index = message.indexOf(avoidancePhrase);
    const before = message.substring(Math.max(0, index - 50), index);
    const keywords = this.extractKeywords(before);
    return keywords[0] || '未知话题';
  }

  // 提取主要话题
  private extractMainTopic(fact: string): string {
    const keywords = this.extractKeywords(fact);
    return keywords[0] || fact.substring(0, 10);
  }

  // 获取地图数据
  getMapData(sessionId: string) {
    const map = this.maps.get(sessionId);
    return map ? map.generateMapData() : null;
  }

  // 获取会话数据（别名方法）
  getSessionData(sessionId: string) {
    return this.getMapData(sessionId);
  }

  // 获取建议的探索方向
  getSuggestedExplorations(sessionId: string): string[] {
    const map = this.maps.get(sessionId);
    if (!map) return [];

    const suggestions: string[] = [];
    
    // 1. 高回避区域
    const avoidanceAreas = map.getHighAvoidanceAreas();
    if (avoidanceAreas.length > 0) {
      suggestions.push(`我注意到关于"${avoidanceAreas[0].topic}"你似乎不太想深入...`);
    }

    // 2. 模糊区域
    const unexplored = map.getUnexploredAreas();
    if (unexplored.length > 0) {
      suggestions.push(`"${unexplored[0].topic}"这部分还不太清楚...`);
    }

    // 3. 矛盾连接
    const contradictions = map.detectContradictions();
    if (contradictions.length > 0) {
      suggestions.push(`这里似乎有些矛盾的地方...`);
    }

    return suggestions;
  }
}

// 导出单例
export const cognitiveMapService = new CognitiveMapService();