import { AnalysisResult } from '../../types';

export interface ExtractedFacts {
  facts: string[];
  subjectiveStatements: string[];
  missingInformation: string[];
  temporalInfo: { time?: string; duration?: string; frequency?: string };
  spatialInfo: { location?: string; distance?: string };
  peopleInfo: { who?: string[]; relationships?: string[] };
  quantitativeInfo: { numbers?: string[]; measurements?: string[] };
}

export interface BiasIndicator {
  type: 'generalization' | 'assumption' | 'emotional_reasoning' | 'binary_thinking' | 'mind_reading' | 'catastrophizing';
  statement: string;
  suggestion: string;
}

export interface ConversationContext {
  messages: Array<{ content: string; role: 'user' | 'ai' }>;
  currentTopic: string;
  extractedFacts: ExtractedFacts;
  identifiedBiases: BiasIndicator[];
}

class FactExtractionEngine {
  extractFacts(message: string): ExtractedFacts {
    const facts: string[] = [];
    const subjectiveStatements: string[] = [];
    const missingInformation: string[] = [];
    
    // 时间信息提取
    const temporalInfo = this.extractTemporalInfo(message);
    if (!temporalInfo.time && !temporalInfo.duration && !temporalInfo.frequency) {
      missingInformation.push('具体时间信息');
    }
    
    // 空间信息提取
    const spatialInfo = this.extractSpatialInfo(message);
    if (!spatialInfo.location) {
      missingInformation.push('具体地点');
    }
    
    // 人物信息提取
    const peopleInfo = this.extractPeopleInfo(message);
    if (message.includes('他们') || message.includes('别人') || message.includes('有人')) {
      if (!peopleInfo.who || peopleInfo.who.length === 0) {
        missingInformation.push('具体人物身份');
      }
    }
    
    // 数量信息提取
    const quantitativeInfo = this.extractQuantitativeInfo(message);
    
    // 分离事实和主观判断
    const sentences = this.splitIntoSentences(message);
    sentences.forEach(sentence => {
      if (this.isFactual(sentence)) {
        facts.push(sentence);
      } else if (this.isSubjective(sentence)) {
        subjectiveStatements.push(sentence);
      }
    });
    
    return {
      facts,
      subjectiveStatements,
      missingInformation,
      temporalInfo,
      spatialInfo,
      peopleInfo,
      quantitativeInfo
    };
  }
  
  private extractTemporalInfo(message: string): ExtractedFacts['temporalInfo'] {
    const timePatterns = [
      /(\d{1,2}[年月日])/g,
      /(昨天|今天|明天|前天|后天)/g,
      /(上周|本周|下周|上个月|这个月|下个月)/g,
      /(早上|上午|中午|下午|晚上|深夜|凌晨)/g,
      /(\d{1,2}点|\d{1,2}:\d{2})/g,
      /(最近|之前|以前|后来|然后)/g
    ];
    
    const durationPatterns = [
      /(\d+[分钟小时天周月年])/g,
      /(很久|一会儿|片刻|瞬间)/g
    ];
    
    const frequencyPatterns = [
      /(每天|每周|每月|每年)/g,
      /(经常|偶尔|有时|总是|从不)/g,
      /(一次|两次|多次|几次)/g
    ];
    
    const time = this.extractByPatterns(message, timePatterns);
    const duration = this.extractByPatterns(message, durationPatterns);
    const frequency = this.extractByPatterns(message, frequencyPatterns);
    
    return { time, duration, frequency };
  }
  
  private extractSpatialInfo(message: string): ExtractedFacts['spatialInfo'] {
    const locationPatterns = [
      /(公司|家里|学校|医院|商场|餐厅|办公室)/g,
      /(北京|上海|广州|深圳|[省市区县])/g,
      /(房间|客厅|卧室|厨房|卫生间)/g,
      /(这里|那里|某个地方|什么地方)/g
    ];
    
    const location = this.extractByPatterns(message, locationPatterns);
    
    return { location };
  }
  
  private extractPeopleInfo(message: string): ExtractedFacts['peopleInfo'] {
    const whoPatterns = [
      /(我|你|他|她|它|我们|你们|他们|她们)/g,
      /(老板|同事|朋友|家人|父母|配偶|孩子)/g,
      /(领导|下属|客户|合作伙伴)/g,
      /([张王李赵刘][先生女士老师经理])/g
    ];
    
    const who = this.extractMultipleByPatterns(message, whoPatterns);
    
    return { who };
  }
  
  private extractQuantitativeInfo(message: string): ExtractedFacts['quantitativeInfo'] {
    const numberPatterns = [
      /\d+/g,
      /(一个|两个|三个|几个|多个|很多|少数|大量)/g,
      /(第一|第二|第三)/g
    ];
    
    const measurementPatterns = [
      /\d+[米公里斤千克元块钱]/g,
      /(很大|很小|很高|很低|很多|很少)/g
    ];
    
    const numbers = this.extractMultipleByPatterns(message, numberPatterns);
    const measurements = this.extractMultipleByPatterns(message, measurementPatterns);
    
    return { numbers, measurements };
  }
  
  private splitIntoSentences(text: string): string[] {
    return text.split(/[。！？,.!?]/).filter(s => s.trim().length > 0);
  }
  
  private isFactual(sentence: string): boolean {
    const factualIndicators = [
      /是\d+/,
      /在.{1,10}(地方|时间)/,
      /有\d+个/,
      /说了|做了|发生了/,
      /看到|听到|遇到/
    ];
    
    return factualIndicators.some(pattern => pattern.test(sentence));
  }
  
  private isSubjective(sentence: string): boolean {
    const subjectiveIndicators = [
      '我觉得', '我认为', '我想', '可能', '也许', '应该',
      '肯定', '一定', '绝对', '总是', '从不', '所有人',
      '没有人', '太', '非常', '特别', '最'
    ];
    
    return subjectiveIndicators.some(indicator => sentence.includes(indicator));
  }
  
  private extractByPatterns(text: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return undefined;
  }
  
  private extractMultipleByPatterns(text: string, patterns: RegExp[]): string[] {
    const results = new Set<string>();
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => results.add(match));
      }
    }
    return Array.from(results);
  }
  
  generateFactualFollowUp(context: ConversationContext): string {
    const { extractedFacts, currentTopic } = context;
    const { missingInformation } = extractedFacts;
    
    // 基于缺失信息生成追问
    if (missingInformation.includes('具体时间信息')) {
      return this.generateTimeQuestion(currentTopic);
    }
    
    if (missingInformation.includes('具体地点')) {
      return this.generateLocationQuestion(currentTopic);
    }
    
    if (missingInformation.includes('具体人物身份')) {
      return this.generatePeopleQuestion(currentTopic);
    }
    
    // 如果有主观陈述，引导具体化
    if (extractedFacts.subjectiveStatements.length > 0) {
      const statement = extractedFacts.subjectiveStatements[0];
      return this.generateSpecificityQuestion(statement);
    }
    
    // 默认追问更多细节
    return '能否描述一下当时的具体情况？比如你看到了什么，听到了什么？';
  }
  
  private generateTimeQuestion(topic: string): string {
    const questions = [
      '这件事发生在什么时候？具体是哪一天？',
      '你能回忆一下具体的时间吗？是早上还是晚上？',
      '这种情况持续了多久？是最近才开始的吗？',
      '上一次发生类似情况是什么时候？'
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  private generateLocationQuestion(topic: string): string {
    const questions = [
      '这件事发生在什么地方？',
      '当时你在哪里？周围的环境是怎样的？',
      '能描述一下具体的场景吗？',
      '这个地方对你来说有什么特殊意义吗？'
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  private generatePeopleQuestion(topic: string): string {
    const questions = [
      '你提到的"他们"具体是指谁？',
      '能告诉我涉及到哪些人吗？他们的身份是什么？',
      '这些人和你是什么关系？',
      '除了你之外，还有谁在场？'
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  private generateSpecificityQuestion(statement: string): string {
    if (statement.includes('总是') || statement.includes('从不')) {
      return '你说的"总是"是指每一次都这样吗？能举一个最近的具体例子吗？';
    }
    
    if (statement.includes('很多') || statement.includes('很少')) {
      return '能具体说说是多少吗？或者大概的比例？';
    }
    
    if (statement.includes('觉得') || statement.includes('认为')) {
      return '是什么让你产生这种感觉？有什么具体的事情或者证据吗？';
    }
    
    return '能举一个具体的例子来说明吗？';
  }
  
  detectCognitiveBiases(messages: Array<{ content: string; role: 'user' | 'ai' }>): BiasIndicator[] {
    const biases: BiasIndicator[] = [];
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const fullText = userMessages.join(' ');
    
    // 过度概括
    if (/所有人都|没有人会|总是|从不|每次都/.test(fullText)) {
      biases.push({
        type: 'generalization',
        statement: '使用了绝对化的词汇',
        suggestion: '试着想想有没有例外的情况？'
      });
    }
    
    // 读心术
    if (/他肯定认为|她一定觉得|他们肯定会/.test(fullText)) {
      biases.push({
        type: 'mind_reading',
        statement: '猜测他人的想法',
        suggestion: '你是如何知道对方的想法的？有直接的证据吗？'
      });
    }
    
    // 灾难化思维
    if (/完蛋了|没救了|一切都毁了|再也不会/.test(fullText)) {
      biases.push({
        type: 'catastrophizing',
        statement: '将情况想象得过于糟糕',
        suggestion: '最坏的情况真的会发生吗？有其他可能性吗？'
      });
    }
    
    // 二元思维
    if (/要么.*要么|不是.*就是|只有.*才/.test(fullText)) {
      biases.push({
        type: 'binary_thinking',
        statement: '非黑即白的思维方式',
        suggestion: '除了这两种极端，还有其他可能吗？'
      });
    }
    
    return biases;
  }
}

export const factExtractionEngine = new FactExtractionEngine();
export default factExtractionEngine;