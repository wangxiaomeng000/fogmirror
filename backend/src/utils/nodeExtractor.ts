// 节点提取工具 - 从AI响应中提取标记的节点

export interface ExtractedNode {
  content: string;
  type: 'fact' | 'insight' | 'belief' | 'tension';
  tensionLevel?: number;
}

export class NodeExtractor {
  // 提取所有类型的节点
  static extractNodes(text: string): ExtractedNode[] {
    const nodes: ExtractedNode[] = [];
    
    // 提取事实节点
    const factMatches = text.matchAll(/\[事实\]([^\[]+)/g);
    for (const match of factMatches) {
      nodes.push({
        content: match[1].trim(),
        type: 'fact'
      });
    }
    
    // 提取洞见节点
    const insightMatches = text.matchAll(/\[洞见\]([^\[]+)/g);
    for (const match of insightMatches) {
      nodes.push({
        content: match[1].trim(),
        type: 'insight'
      });
    }
    
    // 提取观念节点
    const beliefMatches = text.matchAll(/\[观念\]([^\[]+)/g);
    for (const match of beliefMatches) {
      nodes.push({
        content: match[1].trim(),
        type: 'belief'
      });
    }
    
    // 提取张力点
    const tensionMatches = text.matchAll(/\[张力点\]([^\[]+)/g);
    for (const match of tensionMatches) {
      nodes.push({
        content: match[1].trim(),
        type: 'tension',
        tensionLevel: 0.9 // 张力点默认高张力
      });
    }
    
    return nodes;
  }
  
  // 计算节点间的关联性
  static findConnections(newNode: ExtractedNode, existingNodes: ExtractedNode[]): string[] {
    const connections: string[] = [];
    const newKeywords = this.extractKeywords(newNode.content);
    
    existingNodes.forEach((node, index) => {
      const nodeKeywords = this.extractKeywords(node.content);
      const sharedKeywords = newKeywords.filter(k => nodeKeywords.includes(k));
      
      // 如果共享关键词超过2个，建立连接
      if (sharedKeywords.length >= 2) {
        connections.push(index.toString());
      }
      
      // 张力点自动连接到相关事实
      if (newNode.type === 'tension' && node.type === 'fact') {
        if (sharedKeywords.length >= 1) {
          connections.push(index.toString());
        }
      }
    });
    
    return connections;
  }
  
  // 提取关键词（中文分词简化版）
  private static extractKeywords(text: string): string[] {
    // 移除标点符号
    const cleanText = text.replace(/[，。！？、；：""''（）《》【】]/g, ' ');
    
    // 提取2-4字的词组
    const words = cleanText.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    
    // 过滤常见词
    const stopWords = ['我们', '他们', '这个', '那个', '什么', '怎么', '为什么', '可能', '应该'];
    
    return words.filter(word => !stopWords.includes(word));
  }
  
  // 分析节点类型分布，用于引导对话
  static analyzeNodeDistribution(nodes: ExtractedNode[]) {
    const distribution = {
      facts: nodes.filter(n => n.type === 'fact').length,
      insights: nodes.filter(n => n.type === 'insight').length,
      beliefs: nodes.filter(n => n.type === 'belief').length,
      tensions: nodes.filter(n => n.type === 'tension').length
    };
    
    // 根据分布给出建议
    if (distribution.facts < 3) {
      return 'need-more-facts'; // 需要更多事实细节
    } else if (distribution.insights < distribution.facts / 3) {
      return 'ready-for-insights'; // 可以引导洞见
    } else if (distribution.beliefs === 0 && distribution.insights > 2) {
      return 'ready-for-beliefs'; // 可以形成观念
    } else if (distribution.tensions > distribution.facts / 2) {
      return 'too-many-tensions'; // 张力点过多，需要澄清
    }
    
    return 'balanced'; // 平衡状态
  }
}