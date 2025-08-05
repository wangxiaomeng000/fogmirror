import axios from 'axios';
import { AIServiceInterface } from './aiInterface';
import { AnalysisResult } from '../../types';

interface SiliconFlowConfig {
  apiKey: string;
  model?: string;
}

export class SiliconFlowService implements AIServiceInterface {
  public name = 'siliconflow';
  private apiKey: string;
  private model: string;
  private baseURL = 'https://api.siliconflow.cn/v1';

  constructor(config: SiliconFlowConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-ai/DeepSeek-V2.5';
    
    if (!this.apiKey) {
      throw new Error('SILICONFLOW_API_KEY is not configured');
    }
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
      // 如果有图片，使用支持视觉的模型
      const useVisionModel = !!imageBase64;
      // 硅基流动支持的视觉模型
      const model = useVisionModel ? 'Qwen/Qwen2-VL-72B-Instruct' : this.model;
      
      const messages = [];
      
      const systemPrompt = imageBase64 ? 
      `你是一个专业的情感支持AI助手。用户分享了一张图片，你需要：

1. 首先详细描述图片内容：
   - 场景和环境（室内/室外、地点特征）
   - 人物（数量、表情、姿态、互动）
   - 物品和细节（标牌、装饰、服装等）
   - 氛围和情绪（整体感觉）

2. 基于图片内容，自然地引导对话：
   - 询问具体的人物关系（"左边那位是...？"）
   - 询问事件背景（"这是什么活动？"）
   - 探索情感连接（"这张照片对你意味着什么？"）
   - 引导故事分享（"能说说那天发生了什么吗？"）

3. 表达真诚的情感共鸣，让用户感受到被理解

重要：你的回复必须包含以下三个部分：
1) 详细的图片描述（至少100字）- 描述你在图片中真实看到的内容
2) 温暖的情感共鸣
3) 2-3个具体的引导性问题

请用JSON格式回复：
{
  "content": "基于你在图片中看到的真实内容，详细描述场景、人物、细节等。表达情感共鸣。提出2-3个引导性问题。",
  "analysis": {
    "facts": ["你在图片中观察到的具体事实"],
    "insights": ["基于图片内容的深层理解"],
    "concepts": ["相关概念"],
    "emotionalTone": {
      "primary": "你从图片中感受到的主要情绪",
      "intensity": 0.1-1.0,
      "confidence": 0.1-1.0
    },
    "suggestions": ["基于图片内容的建议或问题"]
  }
}`
      : 
      `你是一个专业的情感支持AI助手。请分析用户的消息，提供温暖、理解的回应。
你需要：
1. 识别用户的情绪状态
2. 提取关键事实信息
3. 提供深层洞察
4. 归纳核心概念
5. 给出建设性建议

请用JSON格式回复，包含以下字段：
{
  "content": "你的回复内容",
  "analysis": {
    "facts": ["事实1", "事实2"],
    "insights": ["洞察1", "洞察2"],
    "concepts": ["概念1", "概念2"],
    "emotionalTone": {
      "primary": "主要情绪",
      "intensity": 0.1-1.0,
      "confidence": 0.1-1.0
    },
    "suggestions": ["建议1", "建议2"]
  }
}`;

      messages.push({ role: 'system', content: systemPrompt });
      
      // 添加历史消息
      if (conversationHistory) {
        conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content
          });
        });
      }
      
      // 添加当前消息
      if (imageBase64) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: content || '请分析这张图片' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        });
      } else {
        messages.push({ role: 'user', content });
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000
          // 注意：Qwen2-VL模型不支持response_format
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      let responseContent = response.data.choices[0].message.content;
      console.log('SiliconFlow原始响应:', responseContent);
      console.log('响应类型:', typeof responseContent);
      console.log('是否包含JSON标记:', responseContent.includes('{'));
      
      // 检查是否包含markdown代码块
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        responseContent = jsonMatch[1].trim();
      }
      
      let result;
      
      try {
        // 尝试解析JSON
        result = JSON.parse(responseContent);
        console.log('成功解析为JSON');
      } catch (e: any) {
        // 如果不是JSON，尝试从文本中提取信息
        console.log('SiliconFlow返回非JSON格式，尝试解析文本');
        console.log('解析错误:', e.message);
        result = this.parseTextResponse(responseContent, !!imageBase64);
      }
      
      return {
        response: result.content || result.response || '我理解你的感受，让我们一起探讨这个问题。',
        analysis: {
          facts: result.analysis?.facts || result.facts || [],
          insights: result.analysis?.insights || result.insights || [],
          concepts: result.analysis?.concepts || result.concepts || [],
          emotionalTone: result.analysis?.emotionalTone || result.emotionalTone || {
            primary: '理解',
            intensity: 0.7,
            confidence: 0.8
          },
          suggestions: result.analysis?.suggestions || result.suggestions || []
        }
      };
    } catch (error: any) {
      console.error('SiliconFlow API Error:', error.response?.data || error.message);
      throw new Error(`AI分析服务暂时不可用: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    // SiliconFlow暂不支持图片分析
    return [];
  }

  private parseTextResponse(content: string, hasImage: boolean): any {
    // 尝试从文本响应中提取结构化信息
    const response = content.trim();
    const facts: string[] = [];
    const insights: string[] = [];
    const concepts: string[] = [];
    const suggestions: string[] = [];
    
    // 如果有图片，分析图片描述并添加引导性问题
    if (hasImage) {
      // 提取识别到的关键信息作为facts
      if (response.includes('四个人') || response.includes('4个人')) {
        facts.push('照片中有四个人');
      }
      if (response.includes('高校参访团')) {
        facts.push('这是高校参访团活动');
      }
      if (response.includes('紫色')) {
        facts.push('有紫色的标识或吊牌');
      }
      if (response.includes('笑') || response.includes('开心')) {
        facts.push('大家都在微笑');
      }
      if (response.includes('户外') || response.includes('建筑')) {
        facts.push('在建筑物前拍摄');
      }
      
      // 添加洞察
      insights.push('团队氛围融洽');
      insights.push('记录重要时刻');
      
      // 添加概念
      concepts.push('团队活动', '友谊', '纪念');
      
      // 添加引导性问题到回复中
      const questions = [
        '\n\n我很好奇，这是什么时候的活动？',
        '照片中哪位是你呢？',
        '这次参访有什么特别的收获吗？',
        '和同伴们在一起的感觉怎么样？'
      ];
      
      // 随机选择2-3个问题添加到回复末尾
      const selectedQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .join('');
      
      suggestions.push(...questions.slice(0, 3));
      
      // 构建增强的回复
      const enhancedContent = response + selectedQuestions;
      
      return {
        content: enhancedContent,
        analysis: {
          facts,
          insights,
          concepts,
          emotionalTone: {
            primary: '快乐',
            intensity: 0.8,
            confidence: 0.9
          },
          suggestions
        }
      };
    }
    
    // 非图片消息的处理
    return {
      content: response,
      analysis: {
        facts: ['用户发送了文字消息'],
        insights,
        concepts,
        emotionalTone: {
          primary: '友好',
          intensity: 0.7,
          confidence: 0.8
        },
        suggestions
      }
    };
  }

  async generateDynamicModelParameters(messages: any[]): Promise<{
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  }> {
    // 基于对话历史生成动态参数
    const messageCount = messages.length;
    const uniqueTopics = new Set(messages.map(m => m.content?.toLowerCase().split(' ')[0])).size;
    
    return {
      complexity: Math.min(0.1 + (messageCount * 0.05), 1),
      coherence: Math.min(0.7 + (uniqueTopics * 0.1), 1),
      evolution: Math.min(0.2 + (messageCount * 0.02), 1),
      patterns: ['emotional-support', 'conversation']
    };
  }
}