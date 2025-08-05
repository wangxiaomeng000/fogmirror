import { responseTemplates, emotionalKeywords } from './mockResponses';
import { analysisEngine } from './analysisEngine';
import { AnalysisResult } from '../../types';

class ResponseGenerator {
  // 生成AI响应
  generateResponse(userMessage: string, hasImage: boolean = false): {
    response: string;
    analysis: AnalysisResult;
  } {
    const theme = this.detectTheme(userMessage);
    const analysis = analysisEngine.analyzeMessage(userMessage, hasImage);
    
    // 生成响应文本
    const response = this.generateResponseText(userMessage, theme, analysis);
    
    return {
      response,
      analysis
    };
  }

  // 检测主题
  private detectTheme(content: string): string {
    let maxScore = 0;
    let detectedTheme = 'general';
    
    for (const [theme, keywords] of Object.entries(emotionalKeywords)) {
      const score = keywords.reduce((sum, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        return sum + (matches ? matches.length : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedTheme = theme;
      }
    }
    
    return detectedTheme;
  }

  // 生成响应文本
  private generateResponseText(userMessage: string, theme: string, analysis: AnalysisResult): string {
    const templates = responseTemplates[theme as keyof typeof responseTemplates] || responseTemplates.general;
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // 提取变量
    const variables = {
      emotion: analysis.emotionalTone.primary,
      feeling: this.getFeeling(analysis.emotionalTone.primary),
      situation: this.getSituation(userMessage),
      difficulty: this.getDifficulty(analysis.emotionalTone.intensity),
      challenge: this.getChallenge(userMessage)
    };
    
    // 填充模板
    let response = this.fillTemplate(selectedTemplate, variables);
    
    // 根据情感强度调整语气
    response = this.adjustTone(response, analysis.emotionalTone.intensity);
    
    // 添加后续引导
    response += this.addFollowUp(theme, analysis);
    
    return response;
  }

  // 填充模板
  private fillTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // 获取感受描述
  private getFeeling(emotion: string): string {
    const feelings = {
      '焦虑': '不确定和担忧',
      '悲伤': '沉重和失落',
      '愤怒': '被冒犯和挫败',
      '恐惧': '威胁和不安',
      '绝望': '无助和迷茫',
      '孤独': '被隔离和疏远',
      '沮丧': '被击败和无力'
    };
    
    return feelings[emotion as keyof typeof feelings] || '复杂和困难';
  }

  // 获取情况描述
  private getSituation(userMessage: string): string {
    const situations = [
      '这种情况',
      '这样的经历',
      '这种体验',
      '这个阶段',
      '这些挑战'
    ];
    
    return situations[Math.floor(Math.random() * situations.length)];
  }

  // 获取困难程度
  private getDifficulty(intensity: number): string {
    if (intensity > 0.8) return '极其困难';
    if (intensity > 0.6) return '非常困难';
    if (intensity > 0.4) return '困难';
    if (intensity > 0.2) return '具有挑战性';
    return '需要关注';
  }

  // 获取挑战描述
  private getChallenge(userMessage: string): string {
    const challenges = [
      '这些挑战',
      '这种压力',
      '这些困难',
      '这种情况',
      '这些感受'
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  // 调整语气
  private adjustTone(response: string, intensity: number): string {
    if (intensity > 0.8) {
      // 高强度情感，使用更温和和支持性的语言
      const supportWords = ['我完全理解', '这确实很困难', '你并不孤单'];
      const supportWord = supportWords[Math.floor(Math.random() * supportWords.length)];
      return `${supportWord}。${response}`;
    } else if (intensity < 0.3) {
      // 低强度情感，使用更积极的语言
      const encouragingWords = ['很高兴你愿意分享', '这是一个很好的开始'];
      const encouragingWord = encouragingWords[Math.floor(Math.random() * encouragingWords.length)];
      return `${encouragingWord}。${response}`;
    }
    
    return response;
  }

  // 添加后续引导
  private addFollowUp(theme: string, analysis: AnalysisResult): string {
    const followUps = {
      general: [
        ' 你希望我们深入探讨这个话题的哪个方面？',
        ' 你觉得什么时候这种感受最强烈？',
        ' 你之前是如何应对类似情况的？'
      ],
      anxiety: [
        ' 你能描述一下当焦虑出现时你的身体感受吗？',
        ' 有什么特定的想法或场景会触发这种感受？',
        ' 你尝试过哪些方法来缓解焦虑？'
      ],
      depression: [
        ' 你还记得最近一次感到轻松或快乐是什么时候吗？',
        ' 你的日常生活习惯最近有什么变化吗？',
        ' 你身边有支持你的人吗？'
      ],
      relationship: [
        ' 你们之间的沟通方式是怎样的？',
        ' 你觉得这段关系中最重要的是什么？',
        ' 你希望这种情况有什么样的改变？'
      ],
      work: [
        ' 你觉得工作压力主要来自哪些方面？',
        ' 你有尝试过与同事或上级沟通这些问题吗？',
        ' 你理想中的工作状态是什么样的？'
      ]
    };
    
    const themeFollowUps = followUps[theme as keyof typeof followUps] || followUps.general;
    const selectedFollowUp = themeFollowUps[Math.floor(Math.random() * themeFollowUps.length)];
    
    return selectedFollowUp;
  }

  // 生成多种响应选项
  generateMultipleResponses(userMessage: string, hasImage: boolean = false, count: number = 3): Array<{
    response: string;
    analysis: AnalysisResult;
  }> {
    const responses = [];
    
    for (let i = 0; i < count; i++) {
      responses.push(this.generateResponse(userMessage, hasImage));
    }
    
    return responses;
  }

  // 生成简短回应
  generateShortResponse(userMessage: string): string {
    const shortResponses = [
      '我明白你的感受。',
      '这听起来确实不容易。',
      '谢谢你的分享。',
      '我在这里倾听。',
      '你的感受是有效的。',
      '这是一个很重要的话题。',
      '你愿意详细说说吗？',
      '我想更好地理解你的情况。'
    ];
    
    return shortResponses[Math.floor(Math.random() * shortResponses.length)];
  }

  // 生成鼓励性回应
  generateEncouragingResponse(): string {
    const encouragingResponses = [
      '你已经迈出了重要的第一步。',
      '愿意寻求帮助需要很大的勇气。',
      '你的坚持让我印象深刻。',
      '每个人都有自己的节奏，这很正常。',
      '你比你想象的更强大。',
      '这些困难不会永远持续下去。',
      '你已经走了这么远，这很了不起。',
      '相信自己的能力去处理这些挑战。'
    ];
    
    return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
  }
}

export const responseGenerator = new ResponseGenerator();
export default responseGenerator;