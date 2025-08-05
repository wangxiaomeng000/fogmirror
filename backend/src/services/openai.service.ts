import OpenAI from 'openai';
import { AnalysisResult, EmotionalTone } from '../types';

class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeMessage(content: string, imageBase64?: string): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `你是一个专业的心理情感支持AI助手。你的任务是：
1. 深入理解用户的情感状态和心理需求
2. 提供温暖、支持性的回应
3. 帮助用户识别事实、洞察和深层观念
4. 引导用户客观地看待问题，避免偏见

分析时请提供：
- facts: 用户陈述中的客观事实（3-5个）
- insights: 从事实中得出的洞察（2-3个）
- concepts: 潜在的深层观念或信念（1-2个）
- emotionalTone: 主要情绪及其强度
- suggestions: 建设性的建议（2-3个）`
        }
      ];

      if (imageBase64) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: content },
            { 
              type: 'image_url', 
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: content
        });
      }

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_message',
            description: '分析用户消息的情感和内容',
            parameters: {
              type: 'object',
              properties: {
                response: { type: 'string', description: '对用户的温暖支持性回应' },
                facts: { type: 'array', items: { type: 'string' }, description: '客观事实' },
                insights: { type: 'array', items: { type: 'string' }, description: '洞察' },
                concepts: { type: 'array', items: { type: 'string' }, description: '深层观念' },
                emotionalTone: {
                  type: 'object',
                  properties: {
                    primary: { type: 'string', description: '主要情绪' },
                    intensity: { type: 'number', description: '强度0-1' },
                    confidence: { type: 'number', description: '置信度0-1' }
                  }
                },
                suggestions: { type: 'array', items: { type: 'string' }, description: '建议' }
              },
              required: ['response', 'facts', 'insights', 'concepts', 'emotionalTone', 'suggestions']
            }
          }
        }]
      });

      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function.name === 'analyze_message') {
        const result = JSON.parse(toolCall.function.arguments);
        return {
          response: result.response,
          analysis: {
            facts: result.facts,
            insights: result.insights,
            concepts: result.concepts,
            emotionalTone: result.emotionalTone,
            suggestions: result.suggestions
          }
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '分析图片中的异常点或重点，返回3-5个观察结果。关注情感相关的细节、环境、表情、物品等。'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'image_url', 
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              { type: 'text', text: '请分析这张图片中的重要细节和异常点' }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = completion.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  async generateDynamicModelParameters(messages: any[]): Promise<{
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  }> {
    try {
      const conversationSummary = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '基于对话内容，生成3D生物体模型的参数。返回JSON格式。'
          },
          {
            role: 'user',
            content: `分析以下对话，生成模型参数：\n${conversationSummary}`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        complexity: result.complexity || 0.5,
        coherence: result.coherence || 0.5,
        evolution: result.evolution || 0.5,
        patterns: result.patterns || []
      };
    } catch (error) {
      console.error('Model parameter generation error:', error);
      return {
        complexity: 0.5,
        coherence: 0.5,
        evolution: 0.5,
        patterns: []
      };
    }
  }
}

export const openaiService = new OpenAIService();
export default openaiService;