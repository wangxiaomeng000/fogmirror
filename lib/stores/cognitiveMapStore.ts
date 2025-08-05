import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CognitiveNode } from '@/backend/src/config/cognitiveArchaeology';

interface CognitiveMapState {
  // 状态
  sessionId: string | null;
  nodes: CognitiveNode[];
  connections: Array<{
    source: string;
    target: string;
    type: 'temporal' | 'causal' | 'contradiction';
    strength: number;
  }>;
  selectedNode: CognitiveNode | null;
  viewMode: 'all' | 'facts' | 'insights' | 'beliefs';
  
  // 动作
  setSessionId: (id: string) => void;
  addNode: (node: CognitiveNode) => void;
  addNodes: (nodes: CognitiveNode[]) => void;
  updateNodeTension: (nodeId: string, tension: number) => void;
  addConnection: (connection: any) => void;
  selectNode: (node: CognitiveNode | null) => void;
  setViewMode: (mode: string) => void;
  clearMap: () => void;
  
  // 计算属性
  getNodesByType: (type: string) => CognitiveNode[];
  getTensionNodes: () => CognitiveNode[];
  getNodeConnections: (nodeId: string) => any[];
}

export const useCognitiveMapStore = create<CognitiveMapState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    sessionId: null,
    nodes: [],
    connections: [],
    selectedNode: null,
    viewMode: 'all',
    
    // 设置会话ID
    setSessionId: (id) => set({ sessionId: id }),
    
    // 添加单个节点
    addNode: (node) => set(state => ({
      nodes: [...state.nodes, node]
    })),
    
    // 批量添加节点
    addNodes: (newNodes) => set(state => ({
      nodes: [...state.nodes, ...newNodes]
    })),
    
    // 更新节点张力值
    updateNodeTension: (nodeId, tension) => set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, tensionLevel: tension } : node
      )
    })),
    
    // 添加连接
    addConnection: (connection) => set(state => ({
      connections: [...state.connections, connection]
    })),
    
    // 选择节点
    selectNode: (node) => set({ selectedNode: node }),
    
    // 设置视图模式
    setViewMode: (mode) => set({ viewMode: mode as any }),
    
    // 清空地图
    clearMap: () => set({
      nodes: [],
      connections: [],
      selectedNode: null
    }),
    
    // 获取特定类型的节点
    getNodesByType: (type) => {
      const state = get();
      return state.nodes.filter(node => node.type === type);
    },
    
    // 获取高张力节点
    getTensionNodes: () => {
      const state = get();
      return state.nodes.filter(node => 
        node.tensionLevel && node.tensionLevel > 0.7
      );
    },
    
    // 获取节点的所有连接
    getNodeConnections: (nodeId) => {
      const state = get();
      return state.connections.filter(conn => 
        conn.source === nodeId || conn.target === nodeId
      );
    }
  }))
);

// 订阅张力点变化，触发动画
useCognitiveMapStore.subscribe(
  state => state.nodes.filter(n => n.tensionLevel && n.tensionLevel > 0.7),
  (tensionNodes) => {
    // 可以在这里触发全局提示或动画
    if (tensionNodes.length > 3) {
      console.log('检测到多个张力点，建议深入探索');
    }
  }
);