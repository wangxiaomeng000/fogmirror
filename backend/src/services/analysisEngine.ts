import { AnalysisResult, LayerData, Message } from '../types';
import { aiServiceFactory } from './ai/aiServiceFactory';
import { utteranceAnalyzer } from './utteranceAnalyzer';

export class AnalysisEngine {
  private readonly LAYER_COLORS = {
    facts: '#4A90E2',     // 蓝色 - 事实层
    insights: '#F5A623',  // 金色 - 洞见层  
    concepts: '#E85D75'   // 红色 - 观念层
  };

  async analyzeConversation(messages: Message[]): Promise<{
    analysis: AnalysisResult;
    layerData: LayerData[];
  }> {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      throw new Error('No user message to analyze');
    }

    // 先进行话语分析
    const utteranceAnalysis = utteranceAnalyzer.analyze(lastUserMessage.content);
    
    const aiService = aiServiceFactory.getCurrentService();
    const { response, analysis } = await aiService.analyzeMessage(
      lastUserMessage.content,
      lastUserMessage.image
    );
    
    // 增强分析结果
    const enhancedAnalysis = this.enhanceAnalysis(analysis, utteranceAnalysis);

    const layerData = this.generateLayerData(enhancedAnalysis, lastUserMessage.id);

    return { analysis: enhancedAnalysis, layerData };
  }

  generateLayerData(analysis: AnalysisResult, messageId: string): LayerData[] {
    const layers: LayerData[] = [];

    // 事实层 - 第一层（高度 y=1）
    analysis.facts.forEach((fact, index) => {
      layers.push({
        id: `fact-${messageId}-${index}`,
        type: 'facts',
        content: fact,
        position: this.generatePosition(1, index, analysis.facts.length),
        color: this.LAYER_COLORS.facts,
        intensity: 0.8,
        relatedMessageId: messageId
      });
    });

    // 洞见层 - 第二层（高度 y=3）
    analysis.insights.forEach((insight, index) => {
      layers.push({
        id: `insight-${messageId}-${index}`,
        type: 'insights',
        content: insight,
        position: this.generatePosition(3, index, analysis.insights.length),
        color: this.LAYER_COLORS.insights,
        intensity: 0.9,
        relatedMessageId: messageId
      });
    });

    // 观念层 - 第三层（高度 y=5）
    analysis.concepts.forEach((concept, index) => {
      layers.push({
        id: `concept-${messageId}-${index}`,
        type: 'concepts',
        content: concept,
        position: this.generatePosition(5, index, analysis.concepts.length),
        color: this.LAYER_COLORS.concepts,
        intensity: 1.0,
        relatedMessageId: messageId
      });
    });

    return layers;
  }

  private generatePosition(height: number, index: number, total: number): [number, number, number] {
    const angle = (index / total) * Math.PI * 2;
    const radius = 3 + (height * 0.5);
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = height;

    return [x, y, z];
  }

  identifyPatterns(messages: Message[]): string[] {
    const patterns: string[] = [];
    
    // 识别重复出现的主题
    const themes = new Map<string, number>();
    messages.forEach(msg => {
      if (msg.analysis) {
        [...msg.analysis.facts, ...msg.analysis.insights, ...msg.analysis.concepts]
          .forEach(item => {
            const words = item.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 4) {
                themes.set(word, (themes.get(word) || 0) + 1);
              }
            });
          });
      }
    });

    // 找出高频主题
    Array.from(themes.entries())
      .filter(([_, count]) => count > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([theme]) => patterns.push(theme));

    return patterns;
  }

  calculateConversationMetrics(messages: Message[]): {
    emotionalIntensity: number;
    insightDepth: number;
    conceptualComplexity: number;
  } {
    let totalIntensity = 0;
    let insightCount = 0;
    let conceptCount = 0;
    let messageCount = 0;

    messages.forEach(msg => {
      if (msg.analysis) {
        totalIntensity += msg.analysis.emotionalTone.intensity;
        insightCount += msg.analysis.insights.length;
        conceptCount += msg.analysis.concepts.length;
        messageCount++;
      }
    });

    return {
      emotionalIntensity: messageCount > 0 ? totalIntensity / messageCount : 0,
      insightDepth: messageCount > 0 ? insightCount / messageCount : 0,
      conceptualComplexity: messageCount > 0 ? conceptCount / messageCount : 0
    };
  }

  // 增强分析结果
  private enhanceAnalysis(analysis: AnalysisResult, utteranceAnalysis: any): AnalysisResult {
    // 合并事实
    const enhancedFacts = [
      ...analysis.facts,
      ...utteranceAnalysis.facts.map((f: any) => f.content)
    ];
    
    // 识别主观判断并转化为洞见
    const judgmentInsights = utteranceAnalysis.judgments.map((j: any) => 
      `认知模式: ${j.type === 'moral' ? '道德判断' : 
                  j.type === 'emotional' ? '情绪化' : 
                  j.type === 'assumptive' ? '假设性' : '评价性'} - ${j.content}`
    );
    
    // 合并洞见
    const enhancedInsights = [
      ...analysis.insights,
      ...judgmentInsights
    ];
    
    // 添加回避主题作为潜在概念
    const avoidanceConcepts = utteranceAnalysis.avoidanceSignals.map((a: any) =>
      `回避主题: ${a.topic} (${a.indicator})`
    );
    
    const enhancedConcepts = [
      ...analysis.concepts,
      ...avoidanceConcepts
    ];
    
    // 增强情绪分析
    const emotionalTone = {
      ...analysis.emotionalTone,
      markers: utteranceAnalysis.emotionalMarkers
    };
    
    // 添加场景细节
    const sceneDetails = utteranceAnalysis.sceneDetails;
    
    return {
      ...analysis,
      facts: [...new Set(enhancedFacts)], // 去重
      insights: [...new Set(enhancedInsights)],
      concepts: [...new Set(enhancedConcepts)],
      emotionalTone,
      sceneDetails
    };
  }
}

export const analysisEngine = new AnalysisEngine();
export default analysisEngine;