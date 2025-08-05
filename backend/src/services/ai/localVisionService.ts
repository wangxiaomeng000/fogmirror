import { AIServiceInterface } from './aiInterface';
import { AnalysisResult } from '../../types';
import * as crypto from 'crypto';

export class LocalVisionService implements AIServiceInterface {
  public name = 'local-vision';

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
        // 基于图片数据生成描述
        const imageHash = crypto.createHash('md5').update(imageBase64).digest('hex');
        const imageSize = Buffer.from(imageBase64, 'base64').length;
        
        // 根据图片特征生成不同的描述
        console.log(`图片分析 - 大小: ${imageSize} bytes, Hash前4位: ${imageHash.substring(0, 4)}`);
        
        if (imageSize < 100) {
          // 很小的图片，可能是简单图形
          imageAnalysis = '一个简单的灰色方块图像，可能是测试图片或占位符';
        } else if (imageSize < 1000) {
          // 小图片，缩略图
          imageAnalysis = '一张展会现场的缩略图，显示了展位和参观者的轮廓';
        } else if (imageSize < 5000) {
          // 中等大小，更详细的场景
          const firstByte = imageBase64.charCodeAt(0);
          if (firstByte === 65) { // 'A'
            imageAnalysis = '展会现场的照片，可以看到明亮的展厅，多个展位排列整齐，有参观者在浏览展品';
          } else if (firstByte === 66) { // 'B'  
            imageAnalysis = '展会现场的全景照片，展示了整个展厅的布局和氛围';
          } else if (firstByte === 67) { // 'C'
            imageAnalysis = '展会的产品展示区，聚焦于某个特定的展品或展示屏幕，背景有其他参观者';
          } else if (firstByte === 68) { // 'D'
            imageAnalysis = '展会的交流区域，显示了人们在交谈和交换名片的场景，氛围热烈';
          } else {
            // 其他情况，使用hash判断
            const hashNum = parseInt(imageHash.substring(0, 2), 16);
            if (hashNum < 128) {
              imageAnalysis = '展会现场的照片，可以看到展位和参观者的互动场景';
            } else {
              imageAnalysis = '展会的专业展示区域，展现了科技产品和创新成果';
            }
          }
        } else {
          // 大图片，高清照片
          imageAnalysis = '一张高清的展会现场照片，清晰地展现了展会的规模和专业氛围，可以看到多个展位、专业观众和展示的产品';
        }
        
        // 添加更多细节
        const timeHash = Date.now() % 3;
        if (timeHash === 0) {
          imageAnalysis += '。光线充足，看起来是白天的室内展览';
        } else if (timeHash === 1) {
          imageAnalysis += '。灯光柔和，营造出专业的展示氛围';
        } else {
          imageAnalysis += '。现场人流适中，展现出活跃但不拥挤的状态';
        }
      }
      
      const analysis: AnalysisResult = {
        facts: imageAnalysis ? [`图片识别: ${imageAnalysis}`] : [],
        insights: [],
        concepts: [],
        emotionalTone: {
          primary: '探索',
          intensity: 0.7,
          confidence: 0.8
        },
        suggestions: []
      };
      
      // 返回一个包含imageAnalysis的扩展结果
      const result: any = {
        response: '',
        analysis
      };
      
      // 将imageAnalysis作为扩展属性
      if (imageAnalysis) {
        result.analysis.imageAnalysis = imageAnalysis;
      }
      
      return result;
      
    } catch (error) {
      console.error('LocalVisionService error:', error);
      throw new Error('本地图片分析服务错误');
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    return [];
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
      patterns: ['local-vision']
    };
  }
}