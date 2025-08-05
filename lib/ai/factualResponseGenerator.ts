import { AnalysisResult } from '../../types';
import { factExtractionEngine, ExtractedFacts, ConversationContext } from './factExtractionEngine';
import { cognitiveAnalysisEngine, CognitiveMap } from './cognitiveAnalysisEngine';
import { factualImageAnalyzer } from './factualImageAnalyzer';

class FactualResponseGenerator {
  async generateResponse(
    userMessage: string, 
    conversationHistory: Array<{ content: string; role: 'user' | 'ai' }>,
    hasImage: boolean = false,
    imageBase64?: string
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }> {
    // 提取事实
    const extractedFacts = factExtractionEngine.extractFacts(userMessage);
    
    // 检测认知偏见
    const biases = factExtractionEngine.detectCognitiveBiases([
      ...conversationHistory,
      { content: userMessage, role: 'user' }
    ]);
    
    // 构建对话上下文
    const context: ConversationContext = {
      messages: [...conversationHistory, { content: userMessage, role: 'user' }],
      currentTopic: this.identifyTopic(userMessage),
      extractedFacts,
      identifiedBiases: biases
    };
    
    // 如果有图片，进行图片分析
    let imageAnalysis = null;
    let imageAnomalies: string[] = [];
    if (hasImage && imageBase64) {
      imageAnalysis = await factualImageAnalyzer.analyzeImage(imageBase64);
      imageAnomalies = await factualImageAnalyzer.identifyAnomalies(imageBase64);
    }
    
    // 生成响应
    const response = await this.generateFactualResponse(context, hasImage, imageAnalysis, imageAnomalies);
    
    // 构建认知地图（简化版）
    const cognitiveMap: CognitiveMap = {
      facts: [],
      insights: [],
      concepts: [],
      biases,
      connections: []
    };
    
    // 转换为分析结果
    const analysis = this.createAnalysisResult(extractedFacts, biases, userMessage, imageAnalysis);
    
    return { response, analysis };
  }
  
  private async generateFactualResponse(
    context: ConversationContext, 
    hasImage: boolean,
    imageAnalysis: any,
    imageAnomalies: string[]
  ): Promise<string> {
    const { extractedFacts, identifiedBiases } = context;
    const responses: string[] = [];
    
    // 1. 确认收到的事实信息
    if (extractedFacts.facts.length > 0) {
      responses.push(this.acknowledgeFacts(extractedFacts.facts));
    }
    
    // 2. 指出主观陈述
    if (extractedFacts.subjectiveStatements.length > 0) {
      responses.push(this.addressSubjectiveStatements(extractedFacts.subjectiveStatements));
    }
    
    // 3. 提醒认知偏见
    if (identifiedBiases.length > 0) {
      responses.push(this.addressBiases(identifiedBiases[0]));
    }
    
    // 4. 询问缺失的具体信息
    if (extractedFacts.missingInformation.length > 0 || extractedFacts.facts.length === 0) {
      const followUp = factExtractionEngine.generateFactualFollowUp(context);
      responses.push(followUp);
    }
    
    // 5. 如果有图片，分析图片内容
    if (hasImage && imageAnalysis) {
      responses.push(this.generateImageAnalysisResponse(imageAnalysis, imageAnomalies));
    }
    
    // 组合响应
    return responses.join(' ');
  }
  
  private acknowledgeFacts(facts: string[]): string {
    const templates = [
      `我理解了这些具体信息：${facts.slice(0, 2).join('；')}。`,
      `你提供了这些事实：${facts[0]}。`,
      `根据你的描述，具体情况是：${facts.join('，')}。`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private addressSubjectiveStatements(statements: string[]): string {
    const statement = statements[0];
    const templates = [
      `你提到"${this.truncate(statement, 20)}"，这是你的感受还是观察到的事实？`,
      `关于"${this.truncate(statement, 20)}"，能说说具体发生了什么让你这么认为吗？`,
      `我注意到你说"${this.truncate(statement, 20)}"，这个判断基于什么具体的事情？`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  private addressBiases(bias: { type: string; statement: string; suggestion: string }): string {
    return bias.suggestion;
  }
  
  private identifyTopic(message: string): string {
    const topics = {
      work: ['工作', '公司', '老板', '同事', '项目', '任务', '加班'],
      relationship: ['朋友', '家人', '父母', '爱人', '伴侣', '孩子'],
      health: ['身体', '健康', '睡眠', '疲劳', '生病', '医院'],
      emotion: ['焦虑', '压力', '难过', '害怕', '生气', '孤独'],
      life: ['生活', '日常', '习惯', '改变', '计划', '目标']
    };
    
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return topic;
      }
    }
    
    return 'general';
  }
  
  private generateImageAnalysisResponse(imageAnalysis: any, anomalies: string[]): string {
    const responses: string[] = [];
    
    // 描述图片中的客观事实
    const facts = factualImageAnalyzer.imageAnalysisToFacts(imageAnalysis);
    if (facts.length > 0) {
      responses.push(`图片分析：${facts.slice(0, 3).join('；')}。`);
    }
    
    // 指出异常点
    if (anomalies.length > 0) {
      responses.push(`我注意到一些细节：${anomalies[0]}。这可能值得进一步探讨。`);
    }
    
    // 生成引导问题
    const questions = factualImageAnalyzer.generateGuidingQuestions(imageAnalysis);
    if (questions.length > 0) {
      responses.push(questions[0]);
    }
    
    return responses.join(' ');
  }
  
  private createAnalysisResult(
    extractedFacts: ExtractedFacts, 
    biases: any[], 
    userMessage: string,
    imageAnalysis: any = null
  ): AnalysisResult {
    // 构建事实层
    const facts: string[] = [
      ...extractedFacts.facts,
      ...(extractedFacts.temporalInfo.time ? [`时间：${extractedFacts.temporalInfo.time}`] : []),
      ...(extractedFacts.spatialInfo.location ? [`地点：${extractedFacts.spatialInfo.location}`] : []),
      ...(extractedFacts.peopleInfo.who ? extractedFacts.peopleInfo.who.map(w => `涉及：${w}`) : [])
    ];
    
    // 添加图片事实
    if (imageAnalysis) {
      const imageFacts = factualImageAnalyzer.imageAnalysisToFacts(imageAnalysis);
      facts.push(...imageFacts.slice(0, 3));
    }
    
    // 生成洞见
    const insights: string[] = [];
    if (extractedFacts.subjectiveStatements.length > extractedFacts.facts.length) {
      insights.push('描述中主观判断多于客观事实');
    }
    if (extractedFacts.missingInformation.length > 0) {
      insights.push(`缺少关键信息：${extractedFacts.missingInformation.join('、')}`);
    }
    if (biases.length > 0) {
      insights.push(`存在${biases[0].type}的认知模式`);
    }
    
    // 识别概念层
    const concepts: string[] = [];
    if (userMessage.includes('应该') || userMessage.includes('必须')) {
      concepts.push('存在"应该"思维模式');
    }
    if (userMessage.includes('完美') || userMessage.includes('最好')) {
      concepts.push('可能有完美主义倾向');
    }
    if (biases.some(b => b.type === 'generalization')) {
      concepts.push('倾向于过度概括');
    }
    
    return {
      facts: facts.length > 0 ? facts : ['尚未提供具体事实信息'],
      insights: insights.length > 0 ? insights : ['需要更多信息才能形成洞见'],
      concepts: concepts.length > 0 ? concepts : ['观念层面有待进一步探索'],
      emotionalTone: {
        primary: '探索中',
        intensity: 0.5,
        confidence: 0.7
      },
      suggestions: this.generateSuggestions(extractedFacts, biases)
    };
  }
  
  private generateSuggestions(extractedFacts: ExtractedFacts, biases: any[]): string[] {
    const suggestions: string[] = [];
    
    if (extractedFacts.facts.length === 0) {
      suggestions.push('尝试描述具体发生的事情，而不是你的感受或判断');
    }
    
    if (extractedFacts.missingInformation.includes('具体时间信息')) {
      suggestions.push('加入时间信息能帮助理解事件的发展脉络');
    }
    
    if (extractedFacts.missingInformation.includes('具体人物身份')) {
      suggestions.push('明确涉及的人物关系有助于理解情境');
    }
    
    if (biases.length > 0) {
      suggestions.push('试着从不同角度看待这个问题');
    }
    
    suggestions.push('继续提供更多细节，让画面更加清晰');
    
    return suggestions;
  }
  
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // 生成引导性问题列表
  generateGuidingQuestions(topic: string, extractedFacts: ExtractedFacts): string[] {
    const questions: string[] = [];
    
    // 基础问题模板
    const baseQuestions = {
      temporal: [
        '这件事持续了多久？',
        '第一次注意到是什么时候？',
        '有特定的时间模式吗？'
      ],
      spatial: [
        '这通常发生在什么地方？',
        '环境对情况有影响吗？',
        '换个环境会不同吗？'
      ],
      personal: [
        '除了你，还有谁参与其中？',
        '不同的人有不同的看法吗？',
        '如果让他们描述，会怎么说？'
      ],
      behavioral: [
        '具体做了什么？',
        '别人是怎么反应的？',
        '有什么可观察的变化？'
      ]
    };
    
    // 根据缺失信息生成问题
    if (!extractedFacts.temporalInfo.time) {
      questions.push(...baseQuestions.temporal);
    }
    if (!extractedFacts.spatialInfo.location) {
      questions.push(...baseQuestions.spatial);
    }
    if (!extractedFacts.peopleInfo.who || extractedFacts.peopleInfo.who.length === 0) {
      questions.push(...baseQuestions.personal);
    }
    
    // 添加深入探索的问题
    questions.push(
      '有什么具体的例子吗？',
      '最近一次发生时的详细经过是怎样的？',
      '有什么客观证据支持你的看法？'
    );
    
    return questions.slice(0, 5); // 返回最多5个问题
  }
}

export const factualResponseGenerator = new FactualResponseGenerator();
export default factualResponseGenerator;