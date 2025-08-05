import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIService } from './aiInterface';
import { AnalysisResult } from '../../types';
import { minimalDialogueEngine } from '../../config/dialogueEngine';

export class GeminiService extends BaseAIService {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: any) {
    super(config);
    console.error('\n\n✅✅✅ GEMINI服务已初始化，将使用真实图片识别 ✅✅✅\n\n');
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeMessage(content: string, imageBase64?: string, conversationHistory?: any[]) {
    try {
      console.log('GeminiService: 开始分析消息, 有图片:', !!imageBase64);
      let fullContent = content;
      let imageDescription = '';
      
      // 如果有图片，先分析图片内容
      if (imageBase64) {
        try {
          const imageAnalysis = await this.model.generateContent([
            '请详细描述这张图片的内容，包括场景、人物、物品、氛围等，以便进行情感分析。用中文回复。',
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
              }
            }
          ]);
          
          imageDescription = await imageAnalysis.response.text();
          console.log('GeminiService: 图片描述:', imageDescription);
          // 将图片描述整合到用户内容中
          fullContent = `${content}\n\n[用户分享的图片内容: ${imageDescription}]`;
        } catch (error) {
          console.error('图片分析失败:', error);
          // 如果图片分析失败，继续处理文字内容
        }
      }
      
      const prompt = `${minimalDialogueEngine.systemPrompt}

请以JSON格式返回：
{
  "response": "你的极简回应（必须少于10个字）",
  "facts": ["具体事实"],
  "insights": ["洞察"],
  "concepts": ["深层观念"],
  "emotionalTone": {"primary": "情绪", "intensity": 0-1, "confidence": 0-1},
  "sceneDetails": {"time": "", "place": "", "people": [], "dialogues": [], "actions": []},
  "gaps": ["待澄清细节"]
}

对话历史：
${conversationHistory?.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n') || '无'}

用户: ${fullContent}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 提取JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 如果有图片描述，将其添加到facts中
      const facts = parsed.facts || [];
      if (imageDescription) {
        facts.unshift(`图片识别: ${imageDescription.substring(0, 100)}...`);
        console.log('GeminiService: 添加图片fact:', facts[0]);
      }
      
      return {
        response: parsed.response || '请继续说',
        analysis: {
          facts: facts,
          insights: parsed.insights || [],
          concepts: parsed.concepts || [],
          emotionalTone: parsed.emotionalTone || {
            primary: '中性',
            intensity: 0.5,
            confidence: 0.8
          },
          suggestions: [],
          imageAnalysis: imageDescription || undefined
        }
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`AI分析服务暂时不可用: ${error.message}`);
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        '分析这张图片的重要细节，返回JSON数组格式的3-5个观察结果',
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return ['图片包含情感相关内容'];
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('图片分析服务暂时不可用');
    }
  }

  async generateDynamicModelParameters(messages: any[]) {
    return {
      complexity: 0.5 + Math.random() * 0.3,
      coherence: 0.6 + Math.random() * 0.3,
      evolution: 0.3 + Math.random() * 0.4,
      patterns: ['对话模式', '情绪变化']
    };
  }
}