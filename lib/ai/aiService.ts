import { analysisEngine } from './analysisEngine';
import { responseGenerator } from './responseGenerator';
import { factualResponseGenerator } from './factualResponseGenerator';
import { factExtractionEngine } from './factExtractionEngine';
import { cognitiveAnalysisEngine } from './cognitiveAnalysisEngine';
import { Message, AnalysisResult } from '../../types';
import { generateLayerColor } from '../utils';

interface ProcessMessageOptions {
  includeAnalysis?: boolean;
  responseDelay?: number;
  imageAnalysisTime?: number;
  useFactualApproach?: boolean;
}

class AiService {
  // 处理用户消息
  async processMessage(
    content: string, 
    image?: string, 
    options: ProcessMessageOptions = {},
    conversationHistory: Array<{ content: string; role: 'user' | 'ai' }> = []
  ): Promise<{
    response: string;
    analysis: AnalysisResult | null;
  }> {
    const {
      includeAnalysis = true,
      responseDelay = 1000,
      imageAnalysisTime = 500,
      useFactualApproach = true // 默认使用事实导向方法
    } = options;
    
    const hasImage = !!image;
    
    // 添加延迟模拟处理时间
    await this.delay(responseDelay + (hasImage ? imageAnalysisTime : 0));
    
    // 根据配置选择不同的响应生成器
    let response: string;
    let analysis: AnalysisResult;
    
    if (useFactualApproach) {
      // 使用新的事实导向方法
      const result = await factualResponseGenerator.generateResponse(content, conversationHistory, hasImage, image);
      response = result.response;
      analysis = result.analysis;
    } else {
      // 使用原有的情感支持方法
      const result = responseGenerator.generateResponse(content, hasImage);
      response = result.response;
      analysis = result.analysis;
    }
    
    return {
      response,
      analysis: includeAnalysis ? analysis : null
    };
  }

  // 生成对多个消息的分析
  analyzeConversation(messages: Message[]): AnalysisResult[] {
    return messages
      .filter(m => m.role === 'user')
      .map(m => analysisEngine.analyzeMessage(m.content, !!m.image));
  }

  // 生成3D层数据（改进版，为生物体模型做准备）
  generateLayerData(messages: Message[]): any[] {
    const layerData: any[] = [];
    
    // 收集所有消息的事实、洞见和概念
    const allFacts: string[] = [];
    const allInsights: string[] = [];
    const allConcepts: string[] = [];
    
    messages.forEach(message => {
      if (message.role !== 'ai' || !message.analysis) return;
      
      const { facts, insights, concepts } = message.analysis;
      allFacts.push(...facts);
      allInsights.push(...insights);
      allConcepts.push(...concepts);
    });
    
    // 使用新的布局算法，准备过渡到生物体模型
    // 事实层 - 核心区域
    allFacts.forEach((fact, index) => {
      const angle = (index / allFacts.length) * Math.PI * 2;
      const radius = 2 + Math.random() * 1;
      layerData.push({
        id: `fact-${index}`,
        type: 'facts',
        content: fact,
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        color: generateLayerColor('facts'),
        intensity: 0.8 + Math.random() * 0.2,
        relatedMessageId: messages[messages.length - 1]?.id || ''
      });
    });
    
    // 洞见层 - 中间区域
    allInsights.forEach((insight, index) => {
      const angle = (index / allInsights.length) * Math.PI * 2;
      const radius = 4 + Math.random() * 1.5;
      layerData.push({
        id: `insight-${index}`,
        type: 'insights',
        content: insight,
        position: [
          Math.cos(angle) * radius,
          1,
          Math.sin(angle) * radius
        ],
        color: generateLayerColor('insights'),
        intensity: 0.7 + Math.random() * 0.2,
        relatedMessageId: messages[messages.length - 1]?.id || ''
      });
    });
    
    // 概念层 - 外围区域
    allConcepts.forEach((concept, index) => {
      const angle = (index / allConcepts.length) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      layerData.push({
        id: `concept-${index}`,
        type: 'concepts',
        content: concept,
        position: [
          Math.cos(angle) * radius,
          2,
          Math.sin(angle) * radius
        ],
        color: generateLayerColor('concepts'),
        intensity: 0.9 + Math.random() * 0.1,
        relatedMessageId: messages[messages.length - 1]?.id || ''
      });
    });
    
    return layerData;
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 生成随机位置
  private randomPosition(layer: number): [number, number, number] {
    const radius = 5;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = layer * 2; // 不同层级在不同高度
    
    return [x, y, z];
  }

  // 生成鼓励性响应
  getEncouragingResponse(): string {
    return responseGenerator.generateEncouragingResponse();
  }

  // 生成简短回应
  getShortResponse(message: string): string {
    return responseGenerator.generateShortResponse(message);
  }
}

export const aiService = new AiService();
export default aiService;