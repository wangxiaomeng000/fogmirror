import axios from 'axios';
import { AIServiceInterface } from './aiInterface';
import { AnalysisResult } from '../../types';

export class QwenVisionService implements AIServiceInterface {
  public name = 'qwen-vision';
  private apiKey: string;
  private baseURL = 'https://dashscope.aliyuncs.com/api/v1';
  private model = 'qwen-vl-plus';
  
  constructor(config: any) {
    this.apiKey = config.apiKey || process.env.QWEN_API_KEY || '';
    console.log('\n\n✅ 通义千问视觉服务已初始化（真实API）✅\n\n');
  }

  async analyzeMessage(
    content: string,
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    try {
      console.log('QwenVision: 开始分析，有图片:', !!imageBase64);
      
      // 构建消息
      const messages = [];
      
      // 添加系统提示
      messages.push({
        role: 'system',
        content: `你是一个专业的心理咨询师。请分析用户的消息和图片，提供温暖、理解的回应。
如果用户分享了图片，请：
1. 详细描述图片内容（人物数量、场景、氛围等）
2. 表达情感共鸣
3. 提出2-3个引导性问题

请用JSON格式回复：
{
  "content": "你的回复内容（包含图片描述、情感共鸣和引导问题）",
  "analysis": {
    "facts": ["观察到的事实"],
    "insights": ["深层理解"],
    "concepts": ["相关概念"],
    "emotionalTone": {
      "primary": "主要情绪",
      "intensity": 0.1-1.0,
      "confidence": 0.1-1.0
    },
    "suggestions": ["建议或引导问题"]
  }
}`
      });
      
      // 构建用户消息
      if (imageBase64) {
        const userContent = [
          { type: 'text', text: content || '请帮我看看这张照片' }
        ];
        
        // 添加图片（通义千问格式）
        userContent.push({
          type: 'image',
          image: `data:image/jpeg;base64,${imageBase64}`
        } as any);
        
        messages.push({
          role: 'user',
          content: userContent
        });
      } else {
        messages.push({
          role: 'user',
          content: content
        });
      }
      
      // 调用通义千问API
      console.log('调用通义千问Vision API...');
      const response = await axios.post(
        `${this.baseURL}/services/aigc/multimodal-generation/generation`,
        {
          model: this.model,
          input: {
            messages: messages
          },
          parameters: {
            result_format: 'message',
            temperature: 0.7,
            max_tokens: 1500
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': 'disable'
          },
          timeout: 30000
        }
      );
      
      if (response.data.output && response.data.output.choices) {
        const messageContent = response.data.output.choices[0].message.content;
        console.log('通义千问响应:', messageContent);
        
        // 尝试解析JSON响应
        try {
          const parsed = JSON.parse(messageContent);
          return {
            response: parsed.content || '我理解你的感受',
            analysis: parsed.analysis || this.getDefaultAnalysis()
          };
        } catch (e) {
          // 如果不是JSON，作为普通文本处理
          return {
            response: messageContent,
            analysis: this.generateAnalysisFromText(messageContent, content, !!imageBase64)
          };
        }
      } else {
        throw new Error('Invalid response from Qwen API');
      }
      
    } catch (error: any) {
      console.error('QwenVision API Error:', error.response?.data || error.message);
      
      // 如果是认证错误，使用备用方案
      if (error.response?.status === 401 || !this.apiKey) {
        console.log('使用备用图片分析方案...');
        return this.getFallbackImageAnalysis(content, imageBase64);
      }
      
      throw new Error(`通义千问服务暂时不可用: ${error.message}`);
    }
  }
  
  private getFallbackImageAnalysis(content: string, imageBase64?: string) {
    if (imageBase64) {
      // 使用基础的图片分析
      const imageSize = Buffer.from(imageBase64, 'base64').length;
      const isLargeImage = imageSize > 200000;
      
      const response = `我看到你分享了一张${isLargeImage ? '清晰的' : ''}照片。虽然我现在无法看到具体细节，但我能感受到这张照片对你的重要性。${content.includes('朋友') ? '和朋友在一起的时光总是珍贵的。' : ''}你愿意和我分享更多关于这张照片的故事吗？比如这是在什么场合拍的？当时的心情如何？`;
      
      return {
        response,
        analysis: {
          facts: ['用户分享了照片', content],
          insights: ['照片承载着重要的回忆', '用户愿意分享个人经历'],
          concepts: ['回忆', '分享', '情感连接'],
          emotionalTone: {
            primary: '怀念',
            intensity: 0.7,
            confidence: 0.6
          },
          suggestions: [
            '分享照片背后的故事',
            '描述当时的感受',
            '探讨这段经历的意义'
          ]
        }
      };
    }
    
    // 纯文本响应
    return {
      response: '我在认真听你说，请继续分享。',
      analysis: this.getDefaultAnalysis()
    };
  }
  
  private generateAnalysisFromText(text: string, userContent: string, hasImage: boolean): AnalysisResult {
    const facts = [];
    const insights = [];
    const concepts = [];
    
    if (hasImage) {
      facts.push('用户分享了图片');
      if (text.includes('人') || text.includes('朋友') || text.includes('同学')) {
        facts.push('图片中有人物');
        concepts.push('社交', '关系');
      }
      if (text.includes('开心') || text.includes('笑')) {
        insights.push('氛围积极正面');
      }
    }
    
    if (userContent) {
      facts.push(`用户说: ${userContent}`);
    }
    
    // 情绪检测
    let emotion = '平静';
    let intensity = 0.5;
    
    if (text.includes('开心') || text.includes('快乐') || userContent.includes('开心')) {
      emotion = '快乐';
      intensity = 0.8;
    } else if (text.includes('难过') || text.includes('悲伤') || userContent.includes('难过')) {
      emotion = '悲伤';
      intensity = 0.7;
    } else if (text.includes('担心') || text.includes('焦虑') || userContent.includes('焦虑')) {
      emotion = '焦虑';
      intensity = 0.7;
    }
    
    return {
      facts,
      insights: insights.length > 0 ? insights : ['用户在表达感受'],
      concepts: concepts.length > 0 ? concepts : ['情感', '分享'],
      emotionalTone: {
        primary: emotion,
        intensity,
        confidence: 0.7
      },
      suggestions: ['继续分享你的感受', '告诉我更多细节']
    };
  }
  
  private getDefaultAnalysis(): AnalysisResult {
    return {
      facts: ['对话进行中'],
      insights: ['用户需要倾听和理解'],
      concepts: ['支持', '倾听'],
      emotionalTone: {
        primary: '平静',
        intensity: 0.5,
        confidence: 0.5
      },
      suggestions: ['继续对话']
    };
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
      complexity: 0.5,
      coherence: 0.7,
      evolution: 0.3,
      patterns: ['emotional-support']
    };
  }
}