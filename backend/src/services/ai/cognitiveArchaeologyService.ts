import { BaseAIService } from './aiInterface';
import { 
  socraticPrompts, 
  generateNextQuestion,
  identifyTensionPoints,
  CognitiveNode 
} from '../../config/cognitiveArchaeology';

export class CognitiveArchaeologyService extends BaseAIService {
  name = 'cognitive-archaeology';
  private conversationNodes: Map<string, CognitiveNode[]> = new Map();
  private baseService: any;
  
  constructor(config: any) {
    super(config);
    // 使用真实的AI服务进行图片识别
    const { aiServiceFactory } = require('./aiServiceFactory');
    
    // 直接使用 siliconflow 服务（已确认可以识别图片）
    this.baseService = aiServiceFactory.getService('siliconflow');
    console.log('认知考古服务使用底层服务:', this.baseService.name);
  }

  async analyzeMessage(
    content: string, 
    imageBase64?: string, 
    conversationHistory?: any[]
  ) {
    const sessionId = conversationHistory?.[0]?.sessionId || 'default';
    const nodes = this.conversationNodes.get(sessionId) || [];

    // 系统提示词 - 认知考古学家角色
    const systemPrompt = `你是一位认知考古学家，通过苏格拉底式提问帮助用户重构对人生事件的理解。

核心原则：
1. 只提问，不给建议或评判
2. 聚焦具体细节（时间、地点、动作、感受）
3. 保持开放性，允许矛盾存在
4. 跟随用户情绪线索但不解读情绪
5. 识别"张力点"（情绪高但事实模糊的区域）

标记方式：
- 用[事实]标记具体发生的事
- 用[洞见]标记用户的新认识
- 用[观念]标记形成的整体看法
- 用[张力点]标记需要深入探索的矛盾区域

回应策略：
- 当用户模糊时：要求更具体的描述
- 当用户情绪化时：引导回到事实细节
- 当用户有洞见时：请求支撑这个洞见的事实
- 当对话卡住时：换个角度询问同一事件

你的任务：
1. 分析用户输入，用标记提取内容
2. 识别认知缺口和张力点
3. 生成一个深挖细节的问题
4. 保持好奇和中立

${imageBase64 ? '用户上传了一张图片，找出图片与描述之间的认知缺口。' : ''}

回复示例：
从你的描述中，我注意到：
[事实]那天下午你在办公室加班到很晚
[洞见]你意识到自己总是主动承担额外的工作
[张力点]你说"不想让别人失望"但又感到"被利用"

能具体说说，最近一次主动承担额外工作时，是谁请求的，当时的具体对话是什么？`;

    try {
      console.log('开始分析消息，sessionId:', sessionId);
      
      let question: string = '';
      let extractedNodes: any[] = [];
      let imageAnalysisResult: any = null;
      
      if (imageBase64 && this.baseService) {
        try {
          // 使用SiliconFlow真实分析图片内容
          console.log('调用SiliconFlow API分析图片...');
          const aiResult = await this.baseService.analyzeMessage(
            content,
            imageBase64,
            conversationHistory
          );
          
          if (aiResult.analysis) {
            imageAnalysisResult = aiResult.analysis;
            console.log('图片分析成功:', JSON.stringify(aiResult.analysis, null, 2));
            
            // 基于真实图片内容生成认知考古问题
            const imageContent = aiResult.response || JSON.stringify(aiResult.analysis.facts);
            
            // 从图片描述中提取关键元素
            const hasExhibition = imageContent.includes('展') || imageContent.includes('exhibition');
            const hasPeople = imageContent.includes('人') || imageContent.includes('people');
            const hasObject = imageContent.includes('物') || imageContent.includes('品');
            
            // 先描述图片内容，再提问
            const imageDescription = `我看到你上传了一张图片。让我先描述一下图片内容：\n\n${imageContent}\n\n`;
            
            // 根据图片实际内容生成针对性问题
            if (hasExhibition) {
              question = imageDescription + `基于这个展会场景，在这个特定的位置，你停下来拍照，是什么吸引了你？`;
            } else if (hasPeople) {
              question = imageDescription + `看到图片中的这些人，他们的存在对你来说意味着什么？`;
            } else if (hasObject) {
              question = imageDescription + `这个画面让你想起了什么具体的记忆？`;
            } else {
              question = imageDescription + `这个瞬间对你有什么特殊意义？`;
            }
            
            // 添加基于真实图片内容的认知节点
            extractedNodes.push({
              content: `图片显示：${imageContent.substring(0, 100)}`,
              type: 'fact',
              tensionLevel: 0.3
            });
            
            // 添加图片分析中的事实
            if (imageAnalysisResult.facts && imageAnalysisResult.facts.length > 0) {
              imageAnalysisResult.facts.forEach((fact: string) => {
                if (fact.includes('图片')) {
                  extractedNodes.push({
                    content: fact,
                    type: 'fact',
                    tensionLevel: 0.2
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error('Gemini图片分析失败，使用备用方案:', error);
          // 如果API调用失败，使用备用问题
          question = "我看到你分享了一张照片。能描述一下拍摄这张照片时的具体情况吗？";
          extractedNodes.push({
            content: `用户分享了一张图片`,
            type: 'fact',
            tensionLevel: 0.3
          });
        }
      } else {
        // 纯文本分析
        extractedNodes = this.extractNodesFromUserInput(content, false);
        
        // 基于内容生成问题
        if (content.includes('展会')) {
          question = "你提到了展会。能具体说说是什么类型的展会吗？是什么吸引你去参加的？";
        } else {
          question = generateNextQuestion(nodes, content);
        }
      }
      
      // 添加用户内容节点
      if (content && !extractedNodes.some(n => n.content === content)) {
        extractedNodes.push({
          content: content,
          type: 'fact',
          tensionLevel: 0.2
        });
      }
      
      // 转换为标准节点格式
      const newNodes = extractedNodes.map((node: any, index: number) => ({
        id: `node_${Date.now()}_${index}`,
        content: node.content,
        type: node.type,
        timestamp: Date.now(),
        position: this.calculateNodePosition(nodes.length + index, node.type),
        connections: this.findConnections(node.content, nodes),
        tensionLevel: node.tensionLevel
      }));
      
      nodes.push(...newNodes);
      this.conversationNodes.set(sessionId, nodes);
      
      // 生成分析结果 - 确保三层内容正确分类
      const analysis = {
        facts: newNodes.filter((n: any) => n.type === 'fact').map((n: any) => n.content),
        insights: newNodes.filter((n: any) => n.type === 'insight').map((n: any) => n.content),
        concepts: newNodes.filter((n: any) => n.type === 'belief').map((n: any) => n.content),
        emotionalTone: imageAnalysisResult?.emotionalTone || {
          primary: '探索',
          intensity: 0.7,
          confidence: 0.8
        },
        suggestions: imageBase64 ? ['继续探索图片背后的情感记忆'] : ['深入挖掘细节']
      };
      
      // 调试日志
      console.log('认知考古内容提取结果:');
      console.log('- 事实层:', analysis.facts.length, '项');
      console.log('- 洞见层:', analysis.insights.length, '项');
      console.log('- 观念层:', analysis.concepts.length, '项');
      
      return {
        response: question,
        analysis,
        cognitiveNodes: nodes
      };
      
    } catch (error) {
      console.error('认知考古服务错误:', error);
      throw error;
    }
  }

  private async callAI(messages: any[]): Promise<string> {
    // 不再调用外部AI服务
    return '';
  }

  private parseAIResponse(response: string): any {
    // 从响应中提取标记的内容
    const nodes: any[] = [];
    
    // 提取事实节点
    const factMatches = response.match(/\[事实\]([^\[]+)/g) || [];
    factMatches.forEach(match => {
      const content = match.replace('[事实]', '').trim();
      if (content) {
        nodes.push({
          content,
          type: 'fact',
          tensionLevel: 0.2
        });
      }
    });
    
    // 提取洞见节点
    const insightMatches = response.match(/\[洞见\]([^\[]+)/g) || [];
    insightMatches.forEach(match => {
      const content = match.replace('[洞见]', '').trim();
      if (content) {
        nodes.push({
          content,
          type: 'insight',
          tensionLevel: 0.5
        });
      }
    });
    
    // 提取观念节点
    const beliefMatches = response.match(/\[观念\]([^\[]+)/g) || [];
    beliefMatches.forEach(match => {
      const content = match.replace('[观念]', '').trim();
      if (content) {
        nodes.push({
          content,
          type: 'belief',
          tensionLevel: 0.3
        });
      }
    });
    
    // 提取张力点
    const tensionMatches = response.match(/\[张力点\]([^\[]+)/g) || [];
    tensionMatches.forEach(match => {
      const content = match.replace('[张力点]', '').trim();
      if (content) {
        nodes.push({
          content,
          type: 'insight',
          tensionLevel: 0.9
        });
      }
    });
    
    // 提取问题（最后一个问号结尾的句子）
    const questionMatch = response.match(/[^。！？]*？$/);
    const question = questionMatch ? questionMatch[0] : response;
    
    return {
      question: question.trim(),
      nodes,
      cognitiveGaps: tensionMatches.length > 0 ? ["识别到张力点"] : ["需要更多细节"]
    };
  }

  private calculateNodePosition(index: number, type: string): { x: number; y: number; z: number } {
    // 根据类型计算Y轴位置
    const yOffset = type === 'fact' ? 0 : type === 'insight' ? 100 : 200;
    
    // 螺旋布局
    const angle = index * 0.5;
    const radius = 50 + index * 10;
    
    return {
      x: Math.cos(angle) * radius,
      y: yOffset,
      z: Math.sin(angle) * radius
    };
  }

  private findConnections(content: string, existingNodes: CognitiveNode[]): string[] {
    const connections: string[] = [];
    
    existingNodes.forEach(node => {
      // 简单的关联算法：共享关键词
      const keywords = this.extractKeywords(content);
      const nodeKeywords = this.extractKeywords(node.content);
      
      const sharedKeywords = keywords.filter(k => nodeKeywords.includes(k));
      if (sharedKeywords.length > 0) {
        connections.push(node.id);
      }
    });
    
    return connections;
  }

  private extractKeywords(text: string): string[] {
    const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    return words.filter(w => w.length > 2 && w.length < 8);
  }
  
  private extractNodesFromUserInput(content: string, hasImage?: boolean): any[] {
    const nodes: any[] = [];
    
    // 1. 提取事实层 [fact] - 具体发生的事
    // 时间相关
    const timeMatches = content.match(/(上周[一二三四五六日]?|昨天|今天|明天|前天|\d+[年月日天小时分钟]前?|\d+点|\d+版)/g);
    if (timeMatches) {
      timeMatches.forEach(match => {
        nodes.push({
          content: `时间标记：${match}`,
          type: 'fact',
          tensionLevel: 0.1
        });
      });
    }
    
    // 具体行动
    const actionPatterns = [
      /改了\d+版/g,
      /通宵.*/g,
      /提交了.*/g,
      /经理说.*/g,
      /爸妈.*说/g,
      /最后.*的/g
    ];
    
    actionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          nodes.push({
            content: `具体行动：${match}`,
            type: 'fact',
            tensionLevel: 0.2
          });
        });
      }
    });
    
    // 2. 提取洞见层 [insight] - 用户的新认识
    const insightIndicators = {
      '觉得': 0.5,
      '感觉': 0.5,
      '认为': 0.6,
      '发现': 0.7,
      '意识到': 0.8,
      '原来': 0.7,
      '其实': 0.6,
      '越.*越': 0.7,
      '反而': 0.8
    };
    
    Object.entries(insightIndicators).forEach(([keyword, tension]) => {
      if (content.includes(keyword)) {
        const index = content.indexOf(keyword);
        const endIndex = Math.min(index + 50, content.length);
        const insight = content.substring(index, endIndex);
        
        // 提取到句号或逗号为止
        const punctuationIndex = insight.search(/[。，！？]/);
        const finalInsight = punctuationIndex > 0 ? insight.substring(0, punctuationIndex) : insight;
        
        nodes.push({
          content: `洞见：${finalInsight}`,
          type: 'insight',
          tensionLevel: tension
        });
      }
    });
    
    // 3. 提取观念层 [belief] - 形成的整体看法
    const beliefPatterns = [
      /永远.*的/g,
      /总是.*的/g,
      /从来不.*/g,
      /每次都.*/g,
      /.*就.*最好/g,
      /要做就.*/g
    ];
    
    beliefPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          nodes.push({
            content: `观念：${match}`,
            type: 'belief',
            tensionLevel: 0.4
          });
        });
      }
    });
    
    // 4. 识别张力点 [tension] - 情绪高但事实模糊的区域
    const tensionIndicators = [
      { pattern: /明明.*但是/g, tension: 0.9, description: '认知冲突' },
      { pattern: /明明.*却/g, tension: 0.9, description: '认知冲突' },
      { pattern: /应该.*可是/g, tension: 0.8, description: '期望与现实的冲突' },
      { pattern: /想要.*但是/g, tension: 0.8, description: '内心冲突' },
      { pattern: /不.*但.*觉得/g, tension: 0.85, description: '矛盾感受' }
    ];
    
    tensionIndicators.forEach(({ pattern, tension, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          nodes.push({
            content: `张力点[${description}]：${match}`,
            type: 'insight',
            tensionLevel: tension
          });
        });
      }
    });
    
    // 5. 整体内容分析
    // 如果没有提取到任何节点，至少记录原始内容
    if (nodes.length === 0) {
      nodes.push({
        content: content.substring(0, 100),
        type: 'fact',
        tensionLevel: 0.2
      });
    }
    
    // 如果有图片，添加图片节点
    if (hasImage) {
      nodes.push({
        content: '用户分享了相关图片',
        type: 'fact',
        tensionLevel: 0.3
      });
    }
    
    return nodes;
  }

  private generateLocalAnalysis(content: string, nodes: CognitiveNode[]) {
    // 本地分析逻辑
    const keywords = this.extractKeywords(content);
    
    return {
      facts: [`你提到了"${keywords[0] || content.substring(0, 20)}"`],
      insights: [],
      concepts: [],
      emotionalTone: {
        primary: '探索',
        intensity: 0.6,
        confidence: 0.7
      },
      suggestions: ["让我们深入了解更多细节"]
    };
  }

  private async makeAPICall(messages: any[]): Promise<string> {
    // 不再调用外部服务
    return '';
  }

  async analyzeImageForAbnormalities(imageBase64: string): Promise<string[]> {
    // 认知考古视角的图片分析
    return [
      "图片中展现的场景与你的描述有什么差异？",
      "这张图片拍摄时，你在想什么？",
      "图片中哪个细节最能代表当时的真实情况？",
      "有什么是图片没有展现但你记得的？"
    ];
  }

  async generateDynamicModelParameters(messages: any[]): Promise<{ complexity: number; coherence: number; evolution: number; patterns: string[]; }> {
    // 认知考古动态参数
    return {
      complexity: 0.8,
      coherence: 0.9,
      evolution: 0.7,
      patterns: ['socratic', 'cognitive-layers', 'tension-points']
    };
  }
}