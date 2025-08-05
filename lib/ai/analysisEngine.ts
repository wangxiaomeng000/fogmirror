import { AnalysisResult, EmotionalTone } from '../../types';
import { 
  emotionalKeywords, 
  responseTemplates, 
  analysisTemplates, 
  emotionalTones, 
  suggestionTemplates 
} from './mockResponses';

class AnalysisEngine {
  // 分析用户输入的情感主题
  private detectEmotionalTheme(content: string): string {
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

  // 检测情感强度
  private detectEmotionalIntensity(content: string): number {
    const intensityWords = [
      { words: ['非常', '极其', '特别', '十分', '完全'], weight: 0.9 },
      { words: ['很', '真的', '确实', '总是'], weight: 0.7 },
      { words: ['有点', '稍微', '可能', '也许'], weight: 0.3 },
      { words: ['不太', '几乎不', '很少'], weight: 0.1 }
    ];
    
    let totalWeight = 0;
    let totalMatches = 0;
    
    for (const group of intensityWords) {
      for (const word of group.words) {
        const regex = new RegExp(word, 'gi');
        const matches = content.match(regex);
        if (matches) {
          totalWeight += group.weight * matches.length;
          totalMatches += matches.length;
        }
      }
    }
    
    return totalMatches > 0 ? Math.min(totalWeight / totalMatches, 1) : 0.5;
  }

  // 生成事实层信息
  private generateFactsLayer(content: string, theme: string): string[] {
    const facts: string[] = [];
    const templates = analysisTemplates.facts;
    
    // 基于主题和内容生成事实
    const variables = {
      subject: this.extractSubject(content, theme),
      emotion: this.extractEmotion(content),
      situation: this.extractSituation(content),
      person: this.extractPerson(content),
      problem: this.extractProblem(content),
      area: this.extractArea(content),
      challenge: this.extractChallenge(content)
    };
    
    // 随机选择2-4个事实模板
    const selectedTemplates = this.randomSelect(templates, 2, 4);
    
    for (const template of selectedTemplates) {
      const fact = this.fillTemplate(template, variables);
      facts.push(fact);
    }
    
    return facts;
  }

  // 生成洞见层信息
  private generateInsightsLayer(content: string, theme: string): string[] {
    const insights: string[] = [];
    const templates = analysisTemplates.insights;
    
    const variables = {
      emotion: this.extractEmotion(content),
      subject: this.extractSubject(content, theme),
      perception: this.extractPerception(content),
      factor: this.extractFactor(content),
      relationship: this.extractRelationship(content),
      behavior: this.extractBehavior(content),
      negative_outcome: this.extractNegativeOutcome(content),
      resource: this.extractResource(content),
      situation: this.extractSituation(content),
      external_event: this.extractExternalEvent(content),
      failure: this.extractFailure(content)
    };
    
    // 随机选择1-3个洞见模板
    const selectedTemplates = this.randomSelect(templates, 1, 3);
    
    for (const template of selectedTemplates) {
      const insight = this.fillTemplate(template, variables);
      insights.push(insight);
    }
    
    return insights;
  }

  // 生成观念层信息
  private generateConceptsLayer(content: string, theme: string): string[] {
    const concepts = analysisTemplates.concepts;
    
    // 根据主题选择相关观念
    const themeRelevantConcepts = this.getThemeRelevantConcepts(theme);
    
    // 随机选择1-2个观念
    return this.randomSelect(themeRelevantConcepts, 1, 2);
  }

  // 生成情感基调
  private generateEmotionalTone(content: string, theme: string): EmotionalTone {
    const intensity = this.detectEmotionalIntensity(content);
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    // 基于主题选择情感基调
    const relevantTones = emotionalTones.filter(tone => 
      this.isRelevantTone(tone.label, theme)
    );
    
    const selectedTone = relevantTones.length > 0 
      ? this.randomSelect(relevantTones, 1, 1)[0]
      : this.randomSelect(emotionalTones, 1, 1)[0];
    
    return {
      primary: selectedTone.label,
      intensity: Math.min(intensity * selectedTone.intensity, 1),
      confidence: confidence * selectedTone.confidence
    };
  }

  // 生成建议
  private generateSuggestions(content: string, theme: string): string[] {
    const variables = {
      emotion: this.extractEmotion(content),
      subject: this.extractSubject(content, theme),
      condition: this.extractCondition(content),
      problem: this.extractProblem(content),
      difficulty: this.extractDifficulty(content)
    };
    
    const selectedTemplates = this.randomSelect(suggestionTemplates, 2, 3);
    
    return selectedTemplates.map(template => 
      this.fillTemplate(template, variables)
    );
  }

  // 工具方法：随机选择数组元素
  private randomSelect<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // 工具方法：填充模板
  private fillTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // 提取方法（简化版本，实际应用中可以更复杂）
  private extractSubject(content: string, theme: string): string {
    const subjects = {
      anxiety: '焦虑情况',
      depression: '抑郁情绪',
      anger: '愤怒情绪',
      relationship: '感情关系',
      work: '工作压力',
      family: '家庭关系',
      health: '健康问题',
      confidence: '自信心'
    };
    
    return subjects[theme as keyof typeof subjects] || '生活状况';
  }

  private extractEmotion(content: string): string {
    const emotions = ['焦虑', '悲伤', '愤怒', '恐惧', '失望', '困惑', '不安'];
    const found = emotions.find(emotion => content.includes(emotion));
    return found || '复杂情绪';
  }

  private extractSituation(content: string): string {
    const situations = ['困难处境', '挑战性情况', '压力环境', '变化时期', '不确定状态'];
    return situations[Math.floor(Math.random() * situations.length)];
  }

  private extractPerson(content: string): string {
    const persons = ['伴侣', '朋友', '家人', '同事', '领导'];
    return persons[Math.floor(Math.random() * persons.length)];
  }

  private extractProblem(content: string): string {
    const problems = ['沟通问题', '误解', '冲突', '分歧', '期望不匹配'];
    return problems[Math.floor(Math.random() * problems.length)];
  }

  private extractArea(content: string): string {
    const areas = ['工作', '学习', '人际关系', '健康', '财务'];
    return areas[Math.floor(Math.random() * areas.length)];
  }

  private extractChallenge(content: string): string {
    const challenges = ['压力', '困难', '挑战', '阻碍', '问题'];
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  private extractPerception(content: string): string {
    const perceptions = ['负面看法', '错误认知', '过度解读', '自我批判'];
    return perceptions[Math.floor(Math.random() * perceptions.length)];
  }

  private extractFactor(content: string): string {
    const factors = ['他人评价', '外部成就', '完美标准', '控制感'];
    return factors[Math.floor(Math.random() * factors.length)];
  }

  private extractRelationship(content: string): string {
    const relationships = ['亲密关系', '友谊', '职场关系', '家庭关系'];
    return relationships[Math.floor(Math.random() * relationships.length)];
  }

  private extractBehavior(content: string): string {
    const behaviors = ['回避行为', '过度思考', '自我批判', '完美主义'];
    return behaviors[Math.floor(Math.random() * behaviors.length)];
  }

  private extractNegativeOutcome(content: string): string {
    const outcomes = ['焦虑情绪', '自我怀疑', '压力累积', '关系问题'];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  private extractResource(content: string): string {
    const resources = ['应对技巧', '支持系统', '自我关爱', '情绪调节能力'];
    return resources[Math.floor(Math.random() * resources.length)];
  }

  private extractExternalEvent(content: string): string {
    const events = ['他人行为', '环境变化', '意外事件', '挫折经历'];
    return events[Math.floor(Math.random() * events.length)];
  }

  private extractFailure(content: string): string {
    const failures = ['失败', '不足', '缺陷', '错误'];
    return failures[Math.floor(Math.random() * failures.length)];
  }

  private extractCondition(content: string): string {
    const conditions = ['情绪状态', '心理健康', '生活质量', '幸福感'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private extractDifficulty(content: string): string {
    const difficulties = ['困难时期', '挑战', '压力', '不确定性'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  private getThemeRelevantConcepts(theme: string): string[] {
    const conceptsByTheme = {
      anxiety: [
        '接纳不确定性作为生活的一部分',
        '控制与接纳的平衡',
        '情绪不是定义我们的全部，而是暂时的体验'
      ],
      depression: [
        '自我同情是情感健康的基石',
        '失败是成长和自我发现的必要部分',
        '内在价值不依赖于外部成就'
      ],
      relationship: [
        '人际界限与健康关系的建立',
        '脆弱是力量的表现，而非弱点',
        '情绪不是定义我们的全部，而是暂时的体验'
      ],
      work: [
        '完美主义与自我批判的循环',
        '内在价值不依赖于外部成就',
        '控制与接纳的平衡'
      ]
    };
    
    return conceptsByTheme[theme as keyof typeof conceptsByTheme] || 
           analysisTemplates.concepts;
  }

  private isRelevantTone(tone: string, theme: string): boolean {
    const relevantTones = {
      anxiety: ['焦虑', '恐惧', '不安', '困惑'],
      depression: ['悲伤', '绝望', '沮丧', '孤独'],
      anger: ['愤怒', '沮丧', '失望'],
      relationship: ['悲伤', '失望', '怀念', '纠结'],
      work: ['压力', '沮丧', '不安', '困惑']
    };
    
    const themes = relevantTones[theme as keyof typeof relevantTones];
    return themes ? themes.includes(tone) : true;
  }

  // 主要分析方法
  analyzeMessage(content: string, hasImage: boolean = false): AnalysisResult {
    const theme = this.detectEmotionalTheme(content);
    
    const facts = this.generateFactsLayer(content, theme);
    const insights = this.generateInsightsLayer(content, theme);
    const concepts = this.generateConceptsLayer(content, theme);
    const emotionalTone = this.generateEmotionalTone(content, theme);
    const suggestions = this.generateSuggestions(content, theme);
    
    // 如果有图片，增加额外的事实
    if (hasImage) {
      facts.push('用户分享了一张图片来辅助表达情感');
    }
    
    return {
      facts,
      insights,
      concepts,
      emotionalTone,
      suggestions
    };
  }
}

export const analysisEngine = new AnalysisEngine();
export default analysisEngine;