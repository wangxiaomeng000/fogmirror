import { Message, AnalysisResult, LayerType } from '../../types';
import { ExtractedFacts, BiasIndicator } from './factExtractionEngine';

export interface Fact {
  id: string;
  content: string;
  type: 'temporal' | 'spatial' | 'personal' | 'quantitative' | 'behavioral' | 'observational';
  confidence: number;
  source: string; // message id
}

export interface Insight {
  id: string;
  content: string;
  type: 'pattern' | 'correlation' | 'causation' | 'contradiction' | 'assumption';
  relatedFacts: string[]; // fact ids
  confidence: number;
}

export interface Concept {
  id: string;
  content: string;
  type: 'belief' | 'value' | 'worldview' | 'identity' | 'expectation';
  relatedInsights: string[]; // insight ids
  strength: number;
}

export interface CognitiveMap {
  facts: Fact[];
  insights: Insight[];
  concepts: Concept[];
  biases: BiasIndicator[];
  connections: Connection[];
}

export interface Connection {
  from: string; // id
  to: string; // id
  type: 'supports' | 'contradicts' | 'implies' | 'questions';
  strength: number;
}

class CognitiveAnalysisEngine {
  private factIdCounter = 0;
  private insightIdCounter = 0;
  private conceptIdCounter = 0;
  
  buildCognitiveMap(messages: Message[], extractedFactsArray: ExtractedFacts[]): CognitiveMap {
    const facts: Fact[] = [];
    const insights: Insight[] = [];
    const concepts: Concept[] = [];
    const connections: Connection[] = [];
    
    // 第一步：从消息中提取所有事实
    messages.forEach((message, index) => {
      if (message.role === 'user' && extractedFactsArray[index]) {
        const extractedFacts = extractedFactsArray[index];
        const messageFacts = this.convertToFacts(extractedFacts, message.id);
        facts.push(...messageFacts);
      }
    });
    
    // 第二步：基于事实生成洞见
    const generatedInsights = this.generateInsights(facts);
    insights.push(...generatedInsights);
    
    // 第三步：从洞见中提炼观念
    const extractedConcepts = this.extractConcepts(insights, facts);
    concepts.push(...extractedConcepts);
    
    // 第四步：建立连接关系
    const factConnections = this.findFactConnections(facts);
    const insightConnections = this.findInsightConnections(insights, facts);
    const conceptConnections = this.findConceptConnections(concepts, insights);
    connections.push(...factConnections, ...insightConnections, ...conceptConnections);
    
    return {
      facts,
      insights,
      concepts,
      biases: [],
      connections
    };
  }
  
  private convertToFacts(extractedFacts: ExtractedFacts, messageId: string): Fact[] {
    const facts: Fact[] = [];
    
    // 时间事实
    if (extractedFacts.temporalInfo.time) {
      facts.push({
        id: `fact-${this.factIdCounter++}`,
        content: `时间：${extractedFacts.temporalInfo.time}`,
        type: 'temporal',
        confidence: 0.9,
        source: messageId
      });
    }
    
    // 地点事实
    if (extractedFacts.spatialInfo.location) {
      facts.push({
        id: `fact-${this.factIdCounter++}`,
        content: `地点：${extractedFacts.spatialInfo.location}`,
        type: 'spatial',
        confidence: 0.9,
        source: messageId
      });
    }
    
    // 人物事实
    if (extractedFacts.peopleInfo.who && extractedFacts.peopleInfo.who.length > 0) {
      extractedFacts.peopleInfo.who.forEach(person => {
        facts.push({
          id: `fact-${this.factIdCounter++}`,
          content: `涉及人物：${person}`,
          type: 'personal',
          confidence: 0.8,
          source: messageId
        });
      });
    }
    
    // 具体陈述的事实
    extractedFacts.facts.forEach(fact => {
      facts.push({
        id: `fact-${this.factIdCounter++}`,
        content: fact,
        type: 'observational',
        confidence: 0.85,
        source: messageId
      });
    });
    
    return facts;
  }
  
  generateInsights(facts: Fact[]): Insight[] {
    const insights: Insight[] = [];
    
    // 寻找时间模式
    const temporalFacts = facts.filter(f => f.type === 'temporal');
    if (temporalFacts.length > 1) {
      const timePattern = this.findTimePattern(temporalFacts);
      if (timePattern) {
        insights.push({
          id: `insight-${this.insightIdCounter++}`,
          content: timePattern,
          type: 'pattern',
          relatedFacts: temporalFacts.map(f => f.id),
          confidence: 0.7
        });
      }
    }
    
    // 寻找人物关系模式
    const personalFacts = facts.filter(f => f.type === 'personal');
    if (personalFacts.length > 1) {
      const relationshipPattern = this.findRelationshipPattern(personalFacts);
      if (relationshipPattern) {
        insights.push({
          id: `insight-${this.insightIdCounter++}`,
          content: relationshipPattern,
          type: 'correlation',
          relatedFacts: personalFacts.map(f => f.id),
          confidence: 0.75
        });
      }
    }
    
    // 寻找因果关系
    const causalRelations = this.findCausalRelations(facts);
    causalRelations.forEach(relation => {
      insights.push({
        id: `insight-${this.insightIdCounter++}`,
        content: relation.description,
        type: 'causation',
        relatedFacts: relation.factIds,
        confidence: relation.confidence
      });
    });
    
    // 寻找矛盾
    const contradictions = this.findContradictions(facts);
    contradictions.forEach(contradiction => {
      insights.push({
        id: `insight-${this.insightIdCounter++}`,
        content: contradiction.description,
        type: 'contradiction',
        relatedFacts: contradiction.factIds,
        confidence: 0.8
      });
    });
    
    return insights;
  }
  
  private findTimePattern(temporalFacts: Fact[]): string | null {
    // 简化的时间模式识别
    const times = temporalFacts.map(f => f.content);
    
    if (times.some(t => t.includes('晚上')) && times.length > 1) {
      return '事件多发生在晚上，可能与日常作息或压力释放时间有关';
    }
    
    if (times.some(t => t.includes('最近')) && times.length > 2) {
      return '问题集中在近期出现，可能有特定的触发因素';
    }
    
    return null;
  }
  
  private findRelationshipPattern(personalFacts: Fact[]): string | null {
    const people = personalFacts.map(f => f.content);
    
    if (people.some(p => p.includes('同事')) && people.length > 1) {
      return '问题主要涉及职场人际关系';
    }
    
    if (people.some(p => p.includes('家人') || p.includes('父母'))) {
      return '家庭关系是核心议题';
    }
    
    return null;
  }
  
  private findCausalRelations(facts: Fact[]): Array<{description: string; factIds: string[]; confidence: number}> {
    const relations: Array<{description: string; factIds: string[]; confidence: number}> = [];
    
    // 简化的因果关系识别
    facts.forEach((fact1, i) => {
      facts.slice(i + 1).forEach(fact2 => {
        if (this.isPotentialCause(fact1, fact2)) {
          relations.push({
            description: `${fact1.content} 可能导致了 ${fact2.content}`,
            factIds: [fact1.id, fact2.id],
            confidence: 0.6
          });
        }
      });
    });
    
    return relations;
  }
  
  private isPotentialCause(fact1: Fact, fact2: Fact): boolean {
    // 简化的因果判断逻辑
    const causalKeywords = ['导致', '因为', '所以', '结果', '引起'];
    return causalKeywords.some(keyword => 
      fact1.content.includes(keyword) || fact2.content.includes(keyword)
    );
  }
  
  private findContradictions(facts: Fact[]): Array<{description: string; factIds: string[]; confidence: number}> {
    const contradictions: Array<{description: string; factIds: string[]; confidence: number}> = [];
    
    // 简化的矛盾识别
    facts.forEach((fact1, i) => {
      facts.slice(i + 1).forEach(fact2 => {
        if (this.isContradictory(fact1, fact2)) {
          contradictions.push({
            description: `发现矛盾：${fact1.content} vs ${fact2.content}`,
            factIds: [fact1.id, fact2.id],
            confidence: 0.7
          });
        }
      });
    });
    
    return contradictions;
  }
  
  private isContradictory(fact1: Fact, fact2: Fact): boolean {
    // 简化的矛盾判断
    const opposites = [
      ['总是', '从不'],
      ['很多', '很少'],
      ['经常', '偶尔'],
      ['喜欢', '讨厌']
    ];
    
    return opposites.some(([word1, word2]) => 
      (fact1.content.includes(word1) && fact2.content.includes(word2)) ||
      (fact1.content.includes(word2) && fact2.content.includes(word1))
    );
  }
  
  private extractConcepts(insights: Insight[], facts: Fact[]): Concept[] {
    const concepts: Concept[] = [];
    
    // 基于洞见提取核心观念
    insights.forEach(insight => {
      const concept = this.insightToConcept(insight);
      if (concept) {
        concepts.push(concept);
      }
    });
    
    // 识别隐含的价值观
    const values = this.identifyValues(insights, facts);
    concepts.push(...values);
    
    // 识别世界观
    const worldviews = this.identifyWorldviews(insights, facts);
    concepts.push(...worldviews);
    
    return concepts;
  }
  
  private insightToConcept(insight: Insight): Concept | null {
    if (insight.type === 'pattern' && insight.content.includes('职场')) {
      return {
        id: `concept-${this.conceptIdCounter++}`,
        content: '工作定义了我的价值',
        type: 'belief',
        relatedInsights: [insight.id],
        strength: 0.7
      };
    }
    
    if (insight.type === 'correlation' && insight.content.includes('家庭')) {
      return {
        id: `concept-${this.conceptIdCounter++}`,
        content: '家庭和谐是幸福的基础',
        type: 'value',
        relatedInsights: [insight.id],
        strength: 0.8
      };
    }
    
    return null;
  }
  
  private identifyValues(insights: Insight[], facts: Fact[]): Concept[] {
    const values: Concept[] = [];
    
    // 基于模式识别核心价值观
    if (insights.some(i => i.content.includes('完美'))) {
      values.push({
        id: `concept-${this.conceptIdCounter++}`,
        content: '追求完美主义',
        type: 'value',
        relatedInsights: insights.filter(i => i.content.includes('完美')).map(i => i.id),
        strength: 0.75
      });
    }
    
    return values;
  }
  
  private identifyWorldviews(insights: Insight[], facts: Fact[]): Concept[] {
    const worldviews: Concept[] = [];
    
    // 基于整体模式识别世界观
    if (insights.filter(i => i.type === 'causation').length > 3) {
      worldviews.push({
        id: `concept-${this.conceptIdCounter++}`,
        content: '相信事物之间存在必然的因果关系',
        type: 'worldview',
        relatedInsights: insights.filter(i => i.type === 'causation').map(i => i.id),
        strength: 0.6
      });
    }
    
    return worldviews;
  }
  
  private findFactConnections(facts: Fact[]): Connection[] {
    const connections: Connection[] = [];
    
    // 时间顺序连接
    const temporalFacts = facts.filter(f => f.type === 'temporal');
    for (let i = 0; i < temporalFacts.length - 1; i++) {
      connections.push({
        from: temporalFacts[i].id,
        to: temporalFacts[i + 1].id,
        type: 'implies',
        strength: 0.5
      });
    }
    
    return connections;
  }
  
  private findInsightConnections(insights: Insight[], facts: Fact[]): Connection[] {
    const connections: Connection[] = [];
    
    // 洞见之间的支持或矛盾关系
    insights.forEach((insight1, i) => {
      insights.slice(i + 1).forEach(insight2 => {
        if (insight1.type === 'contradiction' && insight2.type === 'pattern') {
          connections.push({
            from: insight1.id,
            to: insight2.id,
            type: 'questions',
            strength: 0.7
          });
        }
      });
    });
    
    return connections;
  }
  
  private findConceptConnections(concepts: Concept[], insights: Insight[]): Connection[] {
    const connections: Connection[] = [];
    
    // 概念之间的关系
    concepts.forEach((concept1, i) => {
      concepts.slice(i + 1).forEach(concept2 => {
        if (concept1.type === 'value' && concept2.type === 'worldview') {
          connections.push({
            from: concept1.id,
            to: concept2.id,
            type: 'supports',
            strength: 0.6
          });
        }
      });
    });
    
    return connections;
  }
  
  // 将认知地图转换为分析结果（兼容现有接口）
  cognitiveMapToAnalysisResult(map: CognitiveMap): AnalysisResult {
    return {
      facts: map.facts.map(f => f.content),
      insights: map.insights.map(i => i.content),
      concepts: map.concepts.map(c => c.content),
      emotionalTone: {
        primary: '理性分析',
        intensity: 0.5,
        confidence: 0.8
      },
      suggestions: this.generateSuggestions(map)
    };
  }
  
  private generateSuggestions(map: CognitiveMap): string[] {
    const suggestions: string[] = [];
    
    if (map.facts.length < 5) {
      suggestions.push('建议提供更多具体的事实信息，以便进行更深入的分析');
    }
    
    if (map.biases.length > 0) {
      suggestions.push('注意到一些认知偏见，建议从多角度审视问题');
    }
    
    if (map.insights.some(i => i.type === 'contradiction')) {
      suggestions.push('发现了一些矛盾点，这可能是理解问题的关键');
    }
    
    if (map.concepts.filter(c => c.type === 'worldview').length > 0) {
      suggestions.push('你的世界观影响着对问题的理解，试着跳出固有框架思考');
    }
    
    return suggestions;
  }
}

export const cognitiveAnalysisEngine = new CognitiveAnalysisEngine();
export default cognitiveAnalysisEngine;