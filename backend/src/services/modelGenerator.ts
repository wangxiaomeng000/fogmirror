import { Message } from '../types';
import { aiServiceFactory } from './ai/aiServiceFactory';
import analysisEngine from './analysisEngine';
import { conceptOrganismGenerator, ConceptOrganism } from './3d/conceptOrganismGenerator';

export interface OrganismModel {
  type: 'organism' | 'ecosystem' | 'network';
  structure: {
    nodes: ModelNode[];
    connections: ModelConnection[];
  };
  parameters: {
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  };
  animations: AnimationConfig[];
  conceptOrganism?: ConceptOrganism; // 新增：具体观念的生物体模型
}

interface ModelNode {
  id: string;
  position: [number, number, number];
  scale: number;
  color: string;
  type: 'core' | 'branch' | 'leaf';
  content: string;
  layer: 'facts' | 'insights' | 'concepts';
}

interface ModelConnection {
  from: string;
  to: string;
  strength: number;
  type: 'direct' | 'indirect' | 'bidirectional';
}

interface AnimationConfig {
  type: 'pulse' | 'rotate' | 'grow' | 'flow';
  duration: number;
  intensity: number;
  target: string[];
}

export class ModelGenerator {
  async generateDynamicModel(messages: Message[]): Promise<OrganismModel> {
    const metrics = analysisEngine.calculateConversationMetrics(messages);
    const patterns = analysisEngine.identifyPatterns(messages);
    const aiService = aiServiceFactory.getCurrentService();
    const parameters = await aiService.generateDynamicModelParameters(messages);

    const nodes = this.generateNodes(messages);
    const connections = this.generateConnections(nodes);
    const animations = this.generateAnimations(metrics, nodes);
    
    // 生成概念生物体（如果有足够的概念）
    let conceptOrganism: ConceptOrganism | undefined;
    const latestConcepts = this.extractLatestConcepts(messages);
    if (latestConcepts.concept) {
      const supportingFacts = this.extractSupportingFacts(messages);
      const emotionalContext = this.extractEmotionalContext(messages);
      
      conceptOrganism = conceptOrganismGenerator.generateOrganism(
        latestConcepts.concept,
        supportingFacts,
        emotionalContext
      );
    }

    return {
      type: this.determineModelType(metrics),
      structure: { nodes, connections },
      parameters: { ...parameters, patterns },
      animations,
      conceptOrganism
    };
  }

  private generateNodes(messages: Message[]): ModelNode[] {
    const nodes: ModelNode[] = [];
    let nodeId = 0;

    messages.forEach((msg, msgIndex) => {
      if (!msg.analysis) return;

      // 核心节点 - 代表主要概念
      msg.analysis.concepts.forEach((concept, index) => {
        nodes.push({
          id: `node-${nodeId++}`,
          position: this.calculateNodePosition('core', msgIndex, index),
          scale: 1.5,
          color: '#E85D75',
          type: 'core',
          content: concept,
          layer: 'concepts'
        });
      });

      // 分支节点 - 代表洞见
      msg.analysis.insights.forEach((insight, index) => {
        nodes.push({
          id: `node-${nodeId++}`,
          position: this.calculateNodePosition('branch', msgIndex, index),
          scale: 1.0,
          color: '#F5A623',
          type: 'branch',
          content: insight,
          layer: 'insights'
        });
      });

      // 叶子节点 - 代表事实
      msg.analysis.facts.forEach((fact, index) => {
        nodes.push({
          id: `node-${nodeId++}`,
          position: this.calculateNodePosition('leaf', msgIndex, index),
          scale: 0.7,
          color: '#4A90E2',
          type: 'leaf',
          content: fact,
          layer: 'facts'
        });
      });
    });

    return nodes;
  }

  private calculateNodePosition(
    type: 'core' | 'branch' | 'leaf',
    messageIndex: number,
    itemIndex: number
  ): [number, number, number] {
    const baseRadius = type === 'core' ? 0 : type === 'branch' ? 3 : 5;
    const height = type === 'core' ? 0 : type === 'branch' ? 2 : 4;
    const angle = (itemIndex * Math.PI * 2) / 8 + (messageIndex * 0.5);
    
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    const y = height + (Math.sin(messageIndex) * 0.5);

    return [x, y, z];
  }

  private generateConnections(nodes: ModelNode[]): ModelConnection[] {
    const connections: ModelConnection[] = [];
    
    // 连接同一消息中的不同层级节点
    const coreNodes = nodes.filter(n => n.type === 'core');
    const branchNodes = nodes.filter(n => n.type === 'branch');
    const leafNodes = nodes.filter(n => n.type === 'leaf');

    // 核心到分支的连接
    coreNodes.forEach(core => {
      branchNodes.slice(0, 3).forEach(branch => {
        connections.push({
          from: core.id,
          to: branch.id,
          strength: 0.8,
          type: 'direct'
        });
      });
    });

    // 分支到叶子的连接
    branchNodes.forEach(branch => {
      leafNodes.slice(0, 2).forEach(leaf => {
        connections.push({
          from: branch.id,
          to: leaf.id,
          strength: 0.6,
          type: 'direct'
        });
      });
    });

    // 核心节点之间的连接（如果有多个）
    for (let i = 0; i < coreNodes.length - 1; i++) {
      connections.push({
        from: coreNodes[i].id,
        to: coreNodes[i + 1].id,
        strength: 1.0,
        type: 'bidirectional'
      });
    }

    return connections;
  }

  private generateAnimations(
    metrics: { emotionalIntensity: number; insightDepth: number; conceptualComplexity: number },
    nodes: ModelNode[]
  ): AnimationConfig[] {
    const animations: AnimationConfig[] = [];

    // 脉动动画 - 基于情感强度
    if (metrics.emotionalIntensity > 0.5) {
      animations.push({
        type: 'pulse',
        duration: 2000,
        intensity: metrics.emotionalIntensity,
        target: nodes.filter(n => n.type === 'core').map(n => n.id)
      });
    }

    // 旋转动画 - 基于洞见深度
    if (metrics.insightDepth > 1) {
      animations.push({
        type: 'rotate',
        duration: 5000,
        intensity: 0.5,
        target: nodes.filter(n => n.type === 'branch').map(n => n.id)
      });
    }

    // 生长动画 - 基于概念复杂度
    if (metrics.conceptualComplexity > 0.5) {
      animations.push({
        type: 'grow',
        duration: 3000,
        intensity: metrics.conceptualComplexity,
        target: nodes.map(n => n.id)
      });
    }

    return animations;
  }

  private determineModelType(
    metrics: { emotionalIntensity: number; insightDepth: number; conceptualComplexity: number }
  ): 'organism' | 'ecosystem' | 'network' {
    if (metrics.conceptualComplexity > 0.7) {
      return 'ecosystem';
    } else if (metrics.insightDepth > 2) {
      return 'network';
    }
    return 'organism';
  }

  // 提取最新的概念
  private extractLatestConcepts(messages: Message[]): { concept: string | null } {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.analysis?.concepts && msg.analysis.concepts.length > 0) {
        // 返回最新的概念
        return { concept: msg.analysis.concepts[msg.analysis.concepts.length - 1] };
      }
    }
    return { concept: null };
  }

  // 提取支撑事实
  private extractSupportingFacts(messages: Message[]): string[] {
    const facts: string[] = [];
    messages.forEach(msg => {
      if (msg.analysis?.facts) {
        facts.push(...msg.analysis.facts);
      }
    });
    // 返回最近的10个事实
    return facts.slice(-10);
  }

  // 提取情绪上下文
  private extractEmotionalContext(messages: Message[]): any {
    const emotions = messages
      .filter(msg => msg.analysis?.emotionalTone)
      .map(msg => msg.analysis!.emotionalTone);
    
    if (emotions.length === 0) {
      return { primary: 'neutral', intensity: 0.5, volatility: 0.3 };
    }

    // 计算情绪波动性
    const intensities = emotions.map(e => e.intensity || 0.5);
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const volatility = Math.sqrt(
      intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length
    );

    return {
      primary: emotions[emotions.length - 1].primary,
      intensity: avgIntensity,
      volatility: Math.min(1, volatility * 2)
    };
  }
}

export const modelGenerator = new ModelGenerator();
export default modelGenerator;