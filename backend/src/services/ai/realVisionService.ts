import { BaseAIService } from './aiInterface';
import { AnalysisResult } from '../../types';
import axios from 'axios';

export class RealVisionService extends BaseAIService {
  name = 'real-vision';
  
  constructor(config: any) {
    super(config);
    console.log('\n✅ 真实视觉识别服务已初始化 ✅\n');
  }

  async analyzeMessage(
    content: string, 
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    console.log('RealVisionService: 开始分析，有图片:', !!imageBase64);
    
    try {
      // 如果有图片，使用OpenRouter的视觉模型
      if (imageBase64) {
        const messages = [
          {
            role: 'system',
            content: `你是一个专业的心理咨询师。请分析用户发送的图片和消息，提供温暖、理解的回应。
请用JSON格式返回：
{
  "response": "你的回应（体现理解和共情）",
  "facts": ["观察到的事实", "图片中的细节"],
  "insights": ["深层洞察", "情感联系"],
  "concepts": ["核心概念"],
  "emotionalTone": {"primary": "主要情绪", "intensity": 0.1-1.0, "confidence": 0.1-1.0},
  "suggestions": ["建设性建议"]
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: content || '请分析这张图片' },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${imageBase64}` 
                } 
              }
            ]
          }
        ];

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'anthropic/claude-3-haiku',  // 使用支持视觉的模型
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ai-emotional-support.app',
              'X-Title': 'AI Emotional Support Chat'
            },
            timeout: 30000
          }
        );

        const result = JSON.parse(response.data.choices[0].message.content);
        
        return {
          response: result.response,
          analysis: {
            facts: result.facts || [],
            insights: result.insights || [],
            concepts: result.concepts || [],
            emotionalTone: result.emotionalTone || {
              primary: '友好',
              intensity: 0.7,
              confidence: 0.8
            },
            suggestions: result.suggestions || []
          }
        };
      } else {
        // 纯文本对话处理
        return this.handleTextMessage(content, conversationHistory);
      }
    } catch (error: any) {
      console.error('Vision API Error:', error.response?.data || error.message);
      
      // 降级到基本文本分析
      return this.handleTextMessage(content, conversationHistory);
    }
  }

  private async handleTextMessage(
    content: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    // 基于内容的智能回应
    let response = '我在倾听你的心声。';
    let facts: string[] = [];
    let insights: string[] = [];
    let concepts: string[] = [];
    let emotionalTone = {
      primary: '理解',
      intensity: 0.7,
      confidence: 0.8
    };
    
    if (content.includes('焦虑')) {
      response = '我理解你的焦虑感受，让我们一起面对。';
      facts.push('用户表达了焦虑情绪');
      insights.push('需要情感支持和理解');
      concepts.push('焦虑', '情绪管理');
      emotionalTone.primary = '焦虑';
    } else if (content.includes('开心') || content.includes('快乐')) {
      response = '看到你这么开心，我也为你感到高兴！';
      facts.push('用户表达了积极情绪');
      insights.push('正在经历美好时刻');
      concepts.push('快乐', '积极情绪');
      emotionalTone.primary = '快乐';
      emotionalTone.intensity = 0.8;
    }
    
    return {
      response,
      analysis: {
        facts,
        insights,
        concepts,
        emotionalTone,
        suggestions: []
      }
    };
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    // 使用视觉API检测图片内容
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: '请检查图片中是否有不适当的内容，返回JSON数组格式的问题列表。'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return JSON.parse(response.data.choices[0].message.content) || [];
    } catch (error) {
      console.error('图片检测失败:', error);
      return [];
    }
  }

  async generateDynamicModelParameters(messages: any[]): Promise<{
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  }> {
    const messageCount = messages.length;
    const hasImages = messages.some(m => m.image);
    
    return {
      complexity: Math.min(0.3 + (messageCount * 0.1), 0.9),
      coherence: 0.85,
      evolution: Math.min(0.2 + (messageCount * 0.05), 0.8),
      patterns: hasImages ? ['visual-emotional', 'image-sharing'] : ['text-conversation']
    };
  }
}