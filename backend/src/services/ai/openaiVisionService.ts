import { BaseAIService } from './aiInterface';
import { AnalysisResult } from '../../types';
import axios from 'axios';

export class OpenAIVisionService extends BaseAIService {
  name = 'openai-vision';
  
  constructor(config: any) {
    super(config);
    console.log('\n✅ OpenAI视觉识别服务已初始化 ✅\n');
  }

  async analyzeMessage(
    content: string, 
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    console.log('OpenAIVisionService: 开始分析，有图片:', !!imageBase64);
    
    try {
      // 如果有图片，使用OpenAI的视觉模型
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

        console.log('调用OpenAI Vision API...');
        // 尝试使用代理或其他配置
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-vision-preview', // 使用视觉预览模型
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000
          },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 60000,
            proxy: false
          }
        );

        console.log('OpenAI API响应成功');
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
      console.error('OpenAI Vision API Error:', error.response?.data || error.message);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
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
    // 使用OpenAI API处理纯文本
    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的心理咨询师。请分析用户的消息，提供温暖、理解的回应。
请用JSON格式返回：
{
  "response": "你的回应",
  "facts": ["事实"],
  "insights": ["洞察"],
  "concepts": ["概念"],
  "emotionalTone": {"primary": "情绪", "intensity": 0.1-1.0, "confidence": 0.1-1.0},
  "suggestions": ["建议"]
}`
        },
        { role: 'user', content }
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model || 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
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
            primary: '理解',
            intensity: 0.7,
            confidence: 0.8
          },
          suggestions: result.suggestions || []
        }
      };
    } catch (error) {
      console.error('OpenAI Text API Error:', error);
      // 最终降级
      return {
        response: '我在倾听你的心声。',
        analysis: {
          facts: ['用户分享了想法'],
          insights: ['需要理解和支持'],
          concepts: ['倾听', '理解'],
          emotionalTone: {
            primary: '理解',
            intensity: 0.7,
            confidence: 0.8
          },
          suggestions: []
        }
      };
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    // 使用OpenAI API检测图片内容
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: '请检查图片中是否有不适当的内容，返回JSON数组格式的问题列表。如果没有问题，返回空数组[]。'
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
          max_tokens: 500,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = JSON.parse(response.data.choices[0].message.content);
      return result.issues || result.problems || [];
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