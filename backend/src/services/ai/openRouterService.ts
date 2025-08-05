import axios from 'axios';
import { BaseAIService } from './aiInterface';
import { AnalysisResult } from '../../types';
import { minimalDialogueEngine, MinimalResponseGenerator } from '../../config/dialogueEngine';

export class OpenRouterService extends BaseAIService {
  name = 'openrouter';
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private responseGenerator = new MinimalResponseGenerator();

  async analyzeMessage(content: string, imageBase64?: string, conversationHistory?: any[]) {
    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个心理咨询师。请用简短的话回应用户（少于10个字）。
如果用户分享了图片，请在facts中描述图片内容（如人物、场景、氛围等）。
返回JSON格式：
{
  "response": "简短回应",
  "facts": ["事实1", "事实2", "图片描述"],
  "insights": ["洞察1"],
  "concepts": ["概念1"],
  "emotionalTone": {"primary": "情绪", "intensity": 0.7, "confidence": 0.8}
}`
        }
      ];

      // 添加对话历史上下文
      if (conversationHistory && conversationHistory.length > 0) {
        // 只取最近的10条消息作为上下文
        const recentHistory = conversationHistory.slice(-10);
        recentHistory.forEach(msg => {
          if (msg.role === 'user') {
            messages.push({
              role: 'user',
              content: msg.content
            });
          } else if (msg.role === 'ai' && msg.content) {
            messages.push({
              role: 'assistant',
              content: msg.content
            });
          }
        });
      }

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
          ] as any
        });
      } else {
        messages.push({
          role: 'user',
          content: content
        });
      }

      // 添加提示确保返回 JSON
      const lastMessage = messages[messages.length - 1];
      if (typeof lastMessage.content === 'string') {
        lastMessage.content += '\n\n请确保返回有效的JSON格式。';
      }
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: imageBase64 ? 'anthropic/claude-3.5-sonnet' : (this.config.model || 'anthropic/claude-3-opus'),
          messages,
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://ai-emotional-support.app',
            'X-Title': 'AI Emotional Support Chat',
            'Content-Type': 'application/json'
          }
        }
      );

      // 提取 JSON 内容
      const responseContent = response.data.choices[0].message.content;
      console.log('AI Response:', responseContent);
      
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      let result;
      try {
        // 先尝试直接解析
        result = JSON.parse(responseContent);
      } catch (e) {
        // 如果失败，尝试从 markdown 代码块中提取
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          result = JSON.parse(jsonStr);
        } else {
          throw new Error('Failed to extract JSON from response');
        }
      }
      
      return {
        response: result.response || '我理解你的感受，让我们一起探讨。',
        analysis: {
          facts: result.facts || [],
          insights: result.insights || [],
          concepts: result.concepts || [],
          emotionalTone: result.emotionalTone || {
            primary: '关切',
            intensity: 0.7,
            confidence: 0.8
          },
          suggestions: result.suggestions || []
        }
      };
    } catch (error: any) {
      console.error('OpenRouter API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request config:', {
        model: this.config.model,
        apiKeyPresent: !!this.config.apiKey,
        apiKeyLength: this.config.apiKey?.length,
        apiKeyFirst6: this.config.apiKey?.substring(0, 6),
        apiKeyLast4: this.config.apiKey?.substring(this.config.apiKey.length - 4),
        url: this.apiUrl
      });
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Unknown error';
      
      throw new Error(`AI分析服务暂时不可用: ${errorMessage}`);
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.config.model || 'openai/chatgpt-4o-latest',
          messages: [
            {
              role: 'system',
              content: '分析图片中的异常点或重点，返回3-5个观察结果。关注情感相关的细节、环境、表情、物品等。以JSON数组格式返回。'
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
                { type: 'text', text: '请分析这张图片中的重要细节和异常点，返回JSON数组格式' }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://ai-emotional-support.app',
            'X-Title': 'AI Emotional Support Chat'
          }
        }
      );

      // 提取 JSON 内容
      const responseContent = response.data.choices[0].message.content;
      console.log('AI Response:', responseContent);
      
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      let result;
      try {
        // 先尝试直接解析
        result = JSON.parse(responseContent);
      } catch (e) {
        // 如果失败，尝试从 markdown 代码块中提取
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          result = JSON.parse(jsonStr);
        } else {
          throw new Error('Failed to extract JSON from response');
        }
      }
      return Array.isArray(result) ? result : result.observations || ['图片包含情感相关内容'];
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('图片分析服务暂时不可用');
    }
  }

  async generateDynamicModelParameters(messages: any[]) {
    try {
      const conversationSummary = messages
        .slice(-10) // 只取最近10条消息
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.config.model || 'openai/chatgpt-4o-latest',
          messages: [
            {
              role: 'system',
              content: '基于对话内容，生成3D生物体模型的参数。返回JSON格式，包含complexity(0-1)、coherence(0-1)、evolution(0-1)和patterns(字符串数组)。'
            },
            {
              role: 'user',
              content: `分析以下对话，生成模型参数：\n${conversationSummary}`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://ai-emotional-support.app',
            'X-Title': 'AI Emotional Support Chat'
          }
        }
      );

      // 提取 JSON 内容
      const responseContent = response.data.choices[0].message.content;
      console.log('AI Response:', responseContent);
      
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      let result;
      try {
        // 先尝试直接解析
        result = JSON.parse(responseContent);
      } catch (e) {
        // 如果失败，尝试从 markdown 代码块中提取
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          result = JSON.parse(jsonStr);
        } else {
          throw new Error('Failed to extract JSON from response');
        }
      }
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