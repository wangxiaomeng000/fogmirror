import { AIServiceInterface } from './aiInterface';
import { AnalysisResult } from '../../types';
import * as crypto from 'crypto';

export class MockVisionService implements AIServiceInterface {
  public name = 'mock-vision';

  async analyzeMessage(
    content: string,
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    try {
      let imageAnalysis = '';
      
      if (imageBase64) {
        // 为了演示真实的图片分析流程，我们模拟API返回的结果
        const imageSize = Buffer.from(imageBase64, 'base64').length;
        const imageHash = crypto.createHash('md5').update(imageBase64).digest('hex');
        
        // 模拟真实的图片分析结果
        imageAnalysis = `[图片分析结果]
这是一张包含多人的合照。画面中可以看到:
- 场景：室内环境，背景有装饰和灯光
- 人物：画面中有多位人物，大家面带微笑，气氛融洽
- 细节：可以看到一些桌椅和装饰品，整体环境温馨
- 氛围：欢乐、友好、团聚的氛围

技术信息：
- 图片大小：${(imageSize / 1024).toFixed(2)} KB
- 图片指纹：${imageHash.substring(0, 8)}
- 分析时间：${new Date().toISOString()}

注：这是模拟的分析结果。在实际应用中，将使用真实的AI视觉API（如GPT-4V、Claude-3 Vision等）来分析图片内容。`;
      }
      
      const analysis: AnalysisResult = {
        facts: imageAnalysis ? [
          `图片分析完成`,
          `检测到合照场景`,
          `识别到多人群体`
        ] : [],
        insights: imageAnalysis ? [
          '这似乎是一个重要的团聚时刻',
          '照片记录了美好的回忆'
        ] : [],
        concepts: [],
        emotionalTone: {
          primary: '怀念',
          intensity: 0.8,
          confidence: 0.9
        },
        suggestions: []
      };
      
      const result: any = {
        response: '',
        analysis
      };
      
      if (imageAnalysis) {
        result.analysis.imageAnalysis = imageAnalysis;
      }
      
      return result;
      
    } catch (error) {
      console.error('MockVisionService error:', error);
      throw new Error('模拟图片分析服务错误');
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    return [
      '检测到人物：多人',
      '场景类型：室内聚会',
      '情绪氛围：欢乐'
    ];
  }

  async generateDynamicModelParameters(messages: any[]): Promise<{ 
    complexity: number; 
    coherence: number; 
    evolution: number; 
    patterns: string[]; 
  }> {
    return {
      complexity: 0.8,
      coherence: 0.9,
      evolution: 0.7,
      patterns: ['mock-vision']
    };
  }
}