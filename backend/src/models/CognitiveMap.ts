// 用户认知地图模型 - 航海地图式的认知建模

export interface CognitiveArea {
  id: string;
  topic: string;
  clarity: number; // 0-1 清晰度
  emotionalWeight: number; // 情绪负载
  avoidanceLevel: number; // 回避程度 0-1
  lastExplored: Date;
  keywords: string[];
  relatedFacts: string[]; // 关联的事实ID
}

export interface CognitiveConnection {
  from: string; // area id
  to: string; // area id
  type: 'causal' | 'temporal' | 'emotional' | 'logical' | 'contradictory';
  strength: number; // 0-1
  evidence: string[]; // 支撑这个连接的证据
}

export interface FoggyArea {
  topic: string;
  indicators: string[]; // 哪些话语暴露了这个模糊区
  avoidanceSignals: string[]; // "我不想谈这个" / 突然转话题
  importance: number; // 基于提及频率和情绪强度
}

export class CognitiveMap {
  private areas: Map<string, CognitiveArea> = new Map();
  private connections: CognitiveConnection[] = [];
  private foggyAreas: FoggyArea[] = [];
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // 添加或更新认知区域
  addOrUpdateArea(topic: string, clarity: number = 0.5, emotionalWeight: number = 0.5) {
    const existingArea = this.findAreaByTopic(topic);
    
    if (existingArea) {
      // 更新现有区域
      existingArea.clarity = Math.max(existingArea.clarity, clarity);
      existingArea.emotionalWeight = (existingArea.emotionalWeight + emotionalWeight) / 2;
      existingArea.lastExplored = new Date();
    } else {
      // 创建新区域
      const area: CognitiveArea = {
        id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        topic,
        clarity,
        emotionalWeight,
        avoidanceLevel: 0,
        lastExplored: new Date(),
        keywords: this.extractKeywords(topic),
        relatedFacts: []
      };
      this.areas.set(area.id, area);
    }
  }

  // 标记回避区域
  markAvoidance(topic: string, signal: string) {
    const area = this.findAreaByTopic(topic);
    if (area) {
      area.avoidanceLevel = Math.min(1, area.avoidanceLevel + 0.2);
    }

    // 更新迷雾区域
    let foggyArea = this.foggyAreas.find(f => f.topic === topic);
    if (!foggyArea) {
      foggyArea = {
        topic,
        indicators: [],
        avoidanceSignals: [],
        importance: 0.5
      };
      this.foggyAreas.push(foggyArea);
    }
    
    foggyArea.avoidanceSignals.push(signal);
    foggyArea.importance = Math.min(1, foggyArea.importance + 0.1);
  }

  // 添加连接
  addConnection(fromTopic: string, toTopic: string, type: CognitiveConnection['type'], evidence: string) {
    const fromArea = this.findAreaByTopic(fromTopic);
    const toArea = this.findAreaByTopic(toTopic);
    
    if (fromArea && toArea) {
      const existingConnection = this.connections.find(
        c => c.from === fromArea.id && c.to === toArea.id
      );
      
      if (existingConnection) {
        existingConnection.strength = Math.min(1, existingConnection.strength + 0.1);
        existingConnection.evidence.push(evidence);
      } else {
        this.connections.push({
          from: fromArea.id,
          to: toArea.id,
          type,
          strength: 0.5,
          evidence: [evidence]
        });
      }
    }
  }

  // 检测矛盾
  detectContradictions(): CognitiveConnection[] {
    return this.connections.filter(c => c.type === 'contradictory');
  }

  // 获取未探索区域
  getUnexploredAreas(): CognitiveArea[] {
    return Array.from(this.areas.values())
      .filter(area => area.clarity < 0.3)
      .sort((a, b) => b.emotionalWeight - a.emotionalWeight);
  }

  // 获取高回避区域
  getHighAvoidanceAreas(): CognitiveArea[] {
    return Array.from(this.areas.values())
      .filter(area => area.avoidanceLevel > 0.6)
      .sort((a, b) => b.avoidanceLevel - a.avoidanceLevel);
  }

  // 生成地图数据（用于可视化）
  generateMapData() {
    return {
      areas: Array.from(this.areas.values()).map(area => ({
        ...area,
        x: this.calculateX(area),
        y: this.calculateY(area),
        radius: this.calculateRadius(area),
        color: this.calculateColor(area)
      })),
      connections: this.connections.map(conn => ({
        ...conn,
        fromArea: this.areas.get(conn.from),
        toArea: this.areas.get(conn.to)
      })),
      foggyAreas: this.foggyAreas.map(foggy => ({
        ...foggy,
        x: Math.random() * 800,
        y: Math.random() * 600,
        radius: foggy.importance * 100
      }))
    };
  }

  // 压缩话题为关键词节点
  compressTopic(messages: string[]): string {
    // 提取高频词
    const wordFreq = new Map<string, number>();
    messages.forEach(msg => {
      const words = msg.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    // 返回最高频的词作为关键词
    const sorted = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sorted[0]?.[0] || '未知话题';
  }

  // 私有辅助方法
  private findAreaByTopic(topic: string): CognitiveArea | undefined {
    return Array.from(this.areas.values()).find(area => 
      area.topic === topic || 
      area.keywords.some(keyword => topic.includes(keyword))
    );
  }

  private extractKeywords(topic: string): string[] {
    // 简单的关键词提取
    return topic.split(/[，。！？\s]+/)
      .filter(word => word.length > 1)
      .slice(0, 5);
  }

  private calculateX(area: CognitiveArea): number {
    // 基于情绪强度计算X坐标
    return area.emotionalWeight * 800;
  }

  private calculateY(area: CognitiveArea): number {
    // 基于清晰度计算Y坐标
    return (1 - area.clarity) * 600;
  }

  private calculateRadius(area: CognitiveArea): number {
    // 基于重要性计算半径
    const importance = area.emotionalWeight * (1 - area.avoidanceLevel);
    return 20 + importance * 40;
  }

  private calculateColor(area: CognitiveArea): string {
    // 基于清晰度和回避度计算颜色
    if (area.avoidanceLevel > 0.6) {
      return `rgba(255, 0, 0, ${0.3 + area.avoidanceLevel * 0.4})`; // 红色 - 高回避
    } else if (area.clarity < 0.3) {
      return `rgba(128, 128, 128, ${0.5})`; // 灰色 - 模糊
    } else {
      return `rgba(0, 128, 255, ${area.clarity})`; // 蓝色 - 清晰
    }
  }

  // 导出为JSON
  toJSON() {
    return {
      sessionId: this.sessionId,
      areas: Array.from(this.areas.entries()),
      connections: this.connections,
      foggyAreas: this.foggyAreas,
      mapData: this.generateMapData()
    };
  }

  // 从JSON恢复
  static fromJSON(data: any): CognitiveMap {
    const map = new CognitiveMap(data.sessionId);
    data.areas.forEach(([id, area]: [string, CognitiveArea]) => {
      map.areas.set(id, area);
    });
    map.connections = data.connections;
    map.foggyAreas = data.foggyAreas;
    return map;
  }
}