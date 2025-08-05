import { AIServiceInterface } from './aiInterface';
import { AnalysisResult } from '../../types';

export class DemoVisionService implements AIServiceInterface {
  public name = 'demo-vision';

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
        // 为了演示，我们创建一些多样化的描述
        const descriptions = [
          '这是一张室内照片，可以看到一个现代化的办公空间，有几个人正在电脑前工作。墙上有白板，上面写着一些项目规划。光线明亮，氛围专业。',
          '照片显示了一个户外场景，看起来像是在公园或花园。有绿色的植物和树木，阳光透过树叶洒下来，创造出斑驳的光影效果。',
          '这是一张美食照片，桌上摆放着精致的菜肴。可以看到色彩丰富的食物摆盘，背景是温馨的餐厅环境。',
          '图片展示了一个城市街景，有高楼大厦和繁忙的街道。人们在人行道上行走，车辆在道路上行驶，充满都市生活气息。',
          '这是一张合影照片，几个人站在一起微笑。背景看起来像是在某个活动或聚会上，大家看起来都很开心。'
        ];
        
        // 根据图片数据的特征选择描述
        const imageSize = Buffer.from(imageBase64, 'base64').length;
        const index = Math.floor((imageSize % 100) / 20);
        imageAnalysis = descriptions[Math.min(index, descriptions.length - 1)];
        
        // 如果用户提到了特定内容，调整描述
        if (content.includes('展会')) {
          imageAnalysis = '这是一张展会现场的照片。可以看到宽敞的展厅，多个展位整齐排列。有很多参观者在浏览展品，工作人员在介绍产品。展位上有各种展示屏幕和宣传资料。整体氛围专业而热闹。';
        } else if (content.includes('海边') || content.includes('度假')) {
          imageAnalysis = '这是一张海边度假的照片。可以看到蔚蓝的海水和金色的沙滩，远处有几艘帆船。天空晴朗，阳光灿烂。海浪轻轻拍打着海岸，营造出宁静放松的氛围。';
        } else if (content.includes('朋友') || content.includes('聚会')) {
          imageAnalysis = '这是一张朋友聚会的照片。大家围坐在一起，脸上都洋溢着笑容。桌上有美食和饮料，背景是温馨的室内环境。可以感受到欢乐和友谊的氛围。';
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
      
      const result: any = {
        response: '',
        analysis
      };
      
      if (imageAnalysis) {
        result.analysis.imageAnalysis = imageAnalysis;
      }
      
      return result;
      
    } catch (error) {
      console.error('DemoVisionService error:', error);
      throw new Error('演示图片分析服务错误');
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
      patterns: ['demo-vision']
    };
  }
}