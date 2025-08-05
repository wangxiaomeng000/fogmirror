// 生物体观念模型生成器
// 将用户的具体观念转化为动态生物体形态

export interface ConceptOrganism {
  // 核心观念
  coreInsight: string;
  insightType: 'systemic' | 'relational' | 'causal' | 'transformative';
  
  // 生物特征
  morphology: {
    // 基础形态
    baseShape: 'fluid' | 'crystalline' | 'organic' | 'networked';
    
    // 复杂度（基于观念涉及的维度数）
    complexity: number; // 0-1
    
    // 对称性（观念的内在一致性）
    symmetry: number; // 0-1
    
    // 分支（支撑这个观念的关键事实）
    branches: Array<{
      direction: [number, number, number];
      strength: number;
      content: string;
    }>;
    
    // 颜色基调（基于情绪）
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  
  // 动态行为
  dynamics: {
    // 脉动频率（观念的稳定性）
    pulsation: number; // Hz
    
    // 生长速度（观念的成熟度）
    growth: number; // 0-1
    
    // 流动性（观念的灵活性）
    fluidity: number; // 0-1
    
    // 旋转模式（思维的活跃度）
    rotation: {
      speed: number;
      axis: [number, number, number];
    };
  };
  
  // 环境反应
  environment: {
    // 光照反应（开放性）
    lightSensitivity: number;
    
    // 引力影响（依赖性）
    gravityResponse: number;
    
    // 温度变化（情绪敏感度）
    thermalVariation: number;
  };
}

export class ConceptOrganismGenerator {
  // 观念类型映射
  private insightTypeMap = {
    '系统': 'systemic',
    '关系': 'relational',
    '因果': 'causal',
    '转变': 'transformative'
  };
  
  // 生成生物体模型
  generateOrganism(
    concept: string,
    supportingFacts: string[],
    emotionalContext: any,
    cognitiveMap?: any
  ): ConceptOrganism {
    // 分析观念类型
    const insightType = this.analyzeInsightType(concept);
    
    // 生成形态学特征
    const morphology = this.generateMorphology(
      concept,
      supportingFacts,
      emotionalContext,
      insightType
    );
    
    // 生成动态行为
    const dynamics = this.generateDynamics(
      concept,
      emotionalContext,
      cognitiveMap
    );
    
    // 生成环境反应
    const environment = this.generateEnvironment(
      concept,
      insightType,
      emotionalContext
    );
    
    return {
      coreInsight: concept,
      insightType,
      morphology,
      dynamics,
      environment
    };
  }
  
  // 分析观念类型
  private analyzeInsightType(concept: string): ConceptOrganism['insightType'] {
    if (concept.includes('系统') || concept.includes('整体') || concept.includes('生态')) {
      return 'systemic';
    }
    if (concept.includes('关系') || concept.includes('之间') || concept.includes('连接')) {
      return 'relational';
    }
    if (concept.includes('因为') || concept.includes('导致') || concept.includes('所以')) {
      return 'causal';
    }
    if (concept.includes('变化') || concept.includes('成长') || concept.includes('转变')) {
      return 'transformative';
    }
    
    // 默认为系统性
    return 'systemic';
  }
  
  // 生成形态学特征
  private generateMorphology(
    concept: string,
    supportingFacts: string[],
    emotionalContext: any,
    insightType: ConceptOrganism['insightType']
  ): ConceptOrganism['morphology'] {
    // 基础形态映射
    const shapeMap = {
      'systemic': 'networked',
      'relational': 'fluid',
      'causal': 'crystalline',
      'transformative': 'organic'
    };
    
    // 复杂度基于支撑事实数量
    const complexity = Math.min(1, supportingFacts.length / 10);
    
    // 对称性基于观念的内部一致性
    const symmetry = this.calculateSymmetry(concept, supportingFacts);
    
    // 生成分支
    const branches = supportingFacts.slice(0, 6).map((fact, index) => ({
      direction: [
        Math.sin(index * Math.PI / 3),
        Math.cos(index * Math.PI / 4) * 0.5,
        Math.cos(index * Math.PI / 3)
      ] as [number, number, number],
      strength: 0.5 + Math.random() * 0.5,
      content: fact
    }));
    
    // 颜色方案基于情绪
    const colorScheme = this.generateColorScheme(emotionalContext);
    
    return {
      baseShape: shapeMap[insightType] as any,
      complexity,
      symmetry,
      branches,
      colorScheme
    };
  }
  
  // 生成动态行为
  private generateDynamics(
    concept: string,
    emotionalContext: any,
    cognitiveMap?: any
  ): ConceptOrganism['dynamics'] {
    // 脉动频率 - 稳定的观念脉动较慢
    const stability = cognitiveMap?.conceptStability || 0.5;
    const pulsation = 0.5 + (1 - stability) * 2;
    
    // 生长速度 - 基于观念的成熟度
    const maturity = this.assessMaturity(concept, cognitiveMap);
    const growth = maturity;
    
    // 流动性 - 基于观念的灵活性
    const fluidity = concept.includes('也许') || concept.includes('可能') ? 0.8 : 0.3;
    
    // 旋转模式 - 基于思维活跃度
    const rotation = {
      speed: emotionalContext?.intensity || 0.5,
      axis: [0, 1, 0.2] as [number, number, number]
    };
    
    return {
      pulsation,
      growth,
      fluidity,
      rotation
    };
  }
  
  // 生成环境反应
  private generateEnvironment(
    concept: string,
    insightType: ConceptOrganism['insightType'],
    emotionalContext: any
  ): ConceptOrganism['environment'] {
    // 光照敏感度 - 开放性观念对光更敏感
    const lightSensitivity = insightType === 'transformative' ? 0.9 : 0.5;
    
    // 引力响应 - 依赖性观念受引力影响更大
    const gravityResponse = insightType === 'causal' ? 0.8 : 0.3;
    
    // 温度变化 - 情绪敏感度
    const thermalVariation = emotionalContext?.volatility || 0.5;
    
    return {
      lightSensitivity,
      gravityResponse,
      thermalVariation
    };
  }
  
  // 计算对称性
  private calculateSymmetry(concept: string, facts: string[]): number {
    // 简单的一致性检查
    if (facts.length < 2) return 0.5;
    
    // 检查是否有矛盾
    const hasContradiction = facts.some(fact => 
      fact.includes('但是') || fact.includes('然而') || fact.includes('相反')
    );
    
    return hasContradiction ? 0.3 : 0.8;
  }
  
  // 评估成熟度
  private assessMaturity(concept: string, cognitiveMap?: any): number {
    if (!cognitiveMap) return 0.5;
    
    // 基于支撑证据的数量和质量
    const evidenceCount = cognitiveMap.supportingEvidence?.length || 0;
    const evidenceQuality = cognitiveMap.evidenceStrength || 0.5;
    
    return Math.min(1, (evidenceCount / 10) * evidenceQuality);
  }
  
  // 生成颜色方案
  private generateColorScheme(emotionalContext: any): ConceptOrganism['morphology']['colorScheme'] {
    const emotion = emotionalContext?.primary || 'neutral';
    
    const colorMap = {
      'joy': { primary: '#FFD700', secondary: '#FFA500', accent: '#FF6347' },
      'sadness': { primary: '#4682B4', secondary: '#5F9EA0', accent: '#6495ED' },
      'anger': { primary: '#DC143C', secondary: '#B22222', accent: '#FF0000' },
      'fear': { primary: '#8B4513', secondary: '#A0522D', accent: '#D2691E' },
      'love': { primary: '#FF69B4', secondary: '#FF1493', accent: '#C71585' },
      'neutral': { primary: '#708090', secondary: '#778899', accent: '#B0C4DE' }
    };
    
    return colorMap[emotion as keyof typeof colorMap] || colorMap.neutral;
  }
  
  // 更新生物体状态
  updateOrganism(
    organism: ConceptOrganism,
    newFacts: string[],
    emotionalShift?: any
  ): ConceptOrganism {
    // 添加新分支
    if (newFacts.length > 0) {
      const newBranches = newFacts.map((fact, index) => ({
        direction: [
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ] as [number, number, number],
        strength: 0.3 + Math.random() * 0.4,
        content: fact
      }));
      
      organism.morphology.branches.push(...newBranches);
      organism.morphology.complexity = Math.min(1, organism.morphology.complexity + 0.1);
    }
    
    // 调整动态行为
    if (emotionalShift) {
      organism.dynamics.pulsation *= (1 + emotionalShift.intensityChange);
      organism.dynamics.fluidity = Math.min(1, organism.dynamics.fluidity + emotionalShift.uncertaintyChange);
    }
    
    // 增加成熟度
    organism.dynamics.growth = Math.min(1, organism.dynamics.growth + 0.05);
    
    return organism;
  }
}

// 导出单例
export const conceptOrganismGenerator = new ConceptOrganismGenerator();