// 3D认知地图布局算法

import * as THREE from 'three';
import { CognitiveNode } from '@/backend/src/config/cognitiveArchaeology';

export class CognitiveMapLayout {
  private static readonly LAYER_HEIGHT = 100;
  private static readonly MIN_DISTANCE = 30;
  private static readonly REPULSION_STRENGTH = 1000;
  private static readonly ATTRACTION_STRENGTH = 0.1;
  
  // 力导向布局主函数
  static calculateLayout(
    nodes: CognitiveNode[],
    connections: Array<{ source: string; target: string; strength: number }>
  ): Map<string, THREE.Vector3> {
    const positions = new Map<string, THREE.Vector3>();
    
    // 初始化位置
    nodes.forEach(node => {
      const position = this.getInitialPosition(node, nodes);
      positions.set(node.id, position);
    });
    
    // 力导向迭代
    for (let i = 0; i < 50; i++) {
      const forces = new Map<string, THREE.Vector3>();
      
      // 初始化力
      nodes.forEach(node => {
        forces.set(node.id, new THREE.Vector3(0, 0, 0));
      });
      
      // 计算排斥力
      this.calculateRepulsionForces(nodes, positions, forces);
      
      // 计算吸引力
      this.calculateAttractionForces(nodes, connections, positions, forces);
      
      // 计算层级约束力
      this.calculateLayerConstraints(nodes, positions, forces);
      
      // 应用力并更新位置
      this.applyForces(nodes, positions, forces);
    }
    
    return positions;
  }
  
  // 获取初始位置（改进的螺旋布局）
  private static getInitialPosition(node: CognitiveNode, allNodes: CognitiveNode[]): THREE.Vector3 {
    const layerNodes = allNodes.filter(n => n.type === node.type);
    const index = layerNodes.indexOf(node);
    const count = layerNodes.length;
    
    // 黄金螺旋布局
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 黄金角
    const angle = index * goldenAngle;
    const radius = 10 * Math.sqrt(index + 1);
    
    // 根据节点类型确定Y轴位置
    const y = this.getLayerHeight(node.type);
    
    return new THREE.Vector3(
      radius * Math.cos(angle),
      y,
      radius * Math.sin(angle)
    );
  }
  
  // 计算排斥力（防止节点重叠）
  private static calculateRepulsionForces(
    nodes: CognitiveNode[],
    positions: Map<string, THREE.Vector3>,
    forces: Map<string, THREE.Vector3>
  ) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = positions.get(node1.id)!;
        const pos2 = positions.get(node2.id)!;
        
        const diff = new THREE.Vector3().subVectors(pos2, pos1);
        const distance = diff.length();
        
        if (distance < this.MIN_DISTANCE * 3) {
          const force = diff.normalize().multiplyScalar(
            -this.REPULSION_STRENGTH / (distance * distance)
          );
          
          forces.get(node1.id)!.add(force);
          forces.get(node2.id)!.sub(force);
        }
      }
    }
  }
  
  // 计算吸引力（连接的节点相互吸引）
  private static calculateAttractionForces(
    nodes: CognitiveNode[],
    connections: Array<{ source: string; target: string; strength: number }>,
    positions: Map<string, THREE.Vector3>,
    forces: Map<string, THREE.Vector3>
  ) {
    connections.forEach(conn => {
      const pos1 = positions.get(conn.source);
      const pos2 = positions.get(conn.target);
      
      if (pos1 && pos2) {
        const diff = new THREE.Vector3().subVectors(pos2, pos1);
        const distance = diff.length();
        
        const force = diff.normalize().multiplyScalar(
          this.ATTRACTION_STRENGTH * conn.strength * distance
        );
        
        forces.get(conn.source)!.add(force);
        forces.get(conn.target)!.sub(force);
      }
    });
  }
  
  // 层级约束（保持节点在正确的层级）
  private static calculateLayerConstraints(
    nodes: CognitiveNode[],
    positions: Map<string, THREE.Vector3>,
    forces: Map<string, THREE.Vector3>
  ) {
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const targetY = this.getLayerHeight(node.type);
      const yDiff = targetY - pos.y;
      
      // 强制拉回到正确层级
      forces.get(node.id)!.y += yDiff * 0.5;
    });
  }
  
  // 应用力并更新位置
  private static applyForces(
    nodes: CognitiveNode[],
    positions: Map<string, THREE.Vector3>,
    forces: Map<string, THREE.Vector3>
  ) {
    const damping = 0.85; // 阻尼系数
    
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const force = forces.get(node.id)!;
      
      // 应用力（带阻尼）
      pos.add(force.multiplyScalar(damping));
      
      // 限制在合理范围内
      const maxRadius = 200;
      const horizontalPos = new THREE.Vector2(pos.x, pos.z);
      if (horizontalPos.length() > maxRadius) {
        horizontalPos.normalize().multiplyScalar(maxRadius);
        pos.x = horizontalPos.x;
        pos.z = horizontalPos.y;
      }
    });
  }
  
  // 获取层级高度
  private static getLayerHeight(type: string): number {
    switch (type) {
      case 'fact':
        return 0;
      case 'insight':
        return this.LAYER_HEIGHT;
      case 'belief':
        return this.LAYER_HEIGHT * 2;
      default:
        return 0;
    }
  }
  
  // 计算节点聚类（用于识别认知模式）
  static identifyClusters(
    nodes: CognitiveNode[],
    connections: Array<{ source: string; target: string }>
  ): Map<string, number> {
    const clusters = new Map<string, number>();
    let clusterIndex = 0;
    
    // 简单的连通分量算法
    const visited = new Set<string>();
    
    const dfs = (nodeId: string, clusterId: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      clusters.set(nodeId, clusterId);
      
      // 找到所有相连的节点
      connections
        .filter(conn => conn.source === nodeId || conn.target === nodeId)
        .forEach(conn => {
          const nextId = conn.source === nodeId ? conn.target : conn.source;
          dfs(nextId, clusterId);
        });
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, clusterIndex++);
      }
    });
    
    return clusters;
  }
}