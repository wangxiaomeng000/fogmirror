import * as THREE from 'three';
import { CognitiveMap, Fact, Insight, Concept, Connection } from '../ai/cognitiveAnalysisEngine';
import { LayerData } from '../../types';

export interface OrganismModel {
  // 核心结构
  nucleus: NucleusStructure;      // 事实核心
  cytoplasm: CytoplasmNetwork;    // 洞见网络
  membrane: MembraneStructure;     // 观念边界
  
  // 动态属性
  health: number;                  // 健康度 (0-1)
  maturity: number;               // 成熟度 (0-1)
  complexity: number;             // 复杂度 (0-1)
  
  // Three.js对象
  group: THREE.Group;
  
  // 动态行为
  update(deltaTime: number): void;
  grow(newData: CognitiveMap): void;
  pulse(): void;
}

interface NucleusStructure {
  facts: Fact[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
}

interface CytoplasmNetwork {
  insights: Insight[];
  connections: Connection[];
  particles: THREE.Points;
  lines: THREE.LineSegments;
}

interface MembraneStructure {
  concepts: Concept[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
}

export class OrganismVisualizationEngine {
  private scene: THREE.Scene;
  private metaballShader: THREE.ShaderMaterial;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.metaballShader = this.createMetaballShader();
  }
  
  // 生成生物体模型
  generateOrganism(cognitiveMap: CognitiveMap): OrganismModel {
    const group = new THREE.Group();
    
    // 创建核心（事实层）
    const nucleus = this.createNucleus(cognitiveMap.facts);
    group.add(nucleus.mesh);
    
    // 创建细胞质（洞见层）
    const cytoplasm = this.createCytoplasm(cognitiveMap.insights, cognitiveMap.connections);
    group.add(cytoplasm.particles);
    group.add(cytoplasm.lines);
    
    // 创建细胞膜（观念层）
    const membrane = this.createMembrane(cognitiveMap.concepts);
    group.add(membrane.mesh);
    
    // 计算生物体属性
    const health = this.calculateHealth(cognitiveMap);
    const maturity = this.calculateMaturity(cognitiveMap);
    const complexity = this.calculateComplexity(cognitiveMap);
    
    const organism: OrganismModel = {
      nucleus,
      cytoplasm,
      membrane,
      health,
      maturity,
      complexity,
      group,
      
      update(deltaTime: number) {
        // 核心脉动
        const pulseFactor = 1 + Math.sin(Date.now() * 0.001) * 0.05;
        nucleus.mesh.scale.setScalar(pulseFactor);
        
        // 细胞质流动
        const particles = cytoplasm.particles.geometry.attributes.position;
        for (let i = 0; i < particles.count; i++) {
          const x = particles.getX(i);
          const y = particles.getY(i);
          const z = particles.getZ(i);
          
          const angle = Math.atan2(z, x);
          const radius = Math.sqrt(x * x + z * z);
          const newAngle = angle + deltaTime * 0.0001 * (1 + radius * 0.1);
          
          particles.setX(i, radius * Math.cos(newAngle));
          particles.setZ(i, radius * Math.sin(newAngle));
        }
        particles.needsUpdate = true;
        
        // 细胞膜呼吸
        const membraneScale = 1 + Math.sin(Date.now() * 0.0008) * 0.03;
        membrane.mesh.scale.setScalar(membraneScale);
      },
      
      grow(newData: CognitiveMap) {
        // 实现生长逻辑
        // TODO: 根据新数据更新结构
      },
      
      pulse() {
        // 实现脉冲效果
        const scaleTween = { scale: 1 };
        // TODO: 使用动画库实现脉冲
      }
    };
    
    return organism;
  }
  
  private createNucleus(facts: Fact[]): NucleusStructure {
    // 使用球体几何作为基础
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    
    // 根据事实数量调整形态
    const factCount = facts.length;
    const positionAttribute = geometry.attributes.position;
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );
      
      // 添加噪声使形状更有机
      const noise = (Math.random() - 0.5) * 0.2;
      vertex.multiplyScalar(1 + noise * (factCount / 10));
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    // 蓝色发光材质
    const material = new THREE.MeshPhongMaterial({
      color: 0x4169E1,
      emissive: 0x1E90FF,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    return {
      facts,
      geometry,
      material,
      mesh
    };
  }
  
  private createCytoplasm(insights: Insight[], connections: Connection[]): CytoplasmNetwork {
    // 创建粒子系统表示洞见
    const particleCount = insights.length * 10;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // 在核心周围分布粒子
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // 金色粒子
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.84;
      colors[i * 3 + 2] = 0.0;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    // 创建连接线
    const linePositions: number[] = [];
    connections.forEach(conn => {
      // 简化：随机连接一些点
      const i1 = Math.floor(Math.random() * particleCount);
      const i2 = Math.floor(Math.random() * particleCount);
      
      linePositions.push(
        positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2],
        positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]
      );
    });
    
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.3
    });
    
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    
    return {
      insights,
      connections,
      particles,
      lines
    };
  }
  
  private createMembrane(concepts: Concept[]): MembraneStructure {
    // 创建有机形状的外膜
    const geometry = new THREE.IcosahedronGeometry(5, 3);
    
    // 变形以创建更有机的形状
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      // 基于概念强度调整形状
      const conceptStrength = concepts.reduce((sum, c) => sum + c.strength, 0) / concepts.length;
      const distortion = 1 + (Math.random() - 0.5) * 0.3 * conceptStrength;
      
      vertex.multiplyScalar(distortion);
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    // 半透明红色材质
    const material = new THREE.MeshPhongMaterial({
      color: 0xDC143C,
      emissive: 0x8B0000,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    return {
      concepts,
      geometry,
      material,
      mesh
    };
  }
  
  private calculateHealth(map: CognitiveMap): number {
    // 基于平衡度计算健康度
    const factRatio = map.facts.length / 10;
    const insightRatio = map.insights.length / 5;
    const conceptRatio = map.concepts.length / 3;
    
    const balance = 1 - Math.abs(factRatio - insightRatio) - Math.abs(insightRatio - conceptRatio);
    return Math.max(0, Math.min(1, balance));
  }
  
  private calculateMaturity(map: CognitiveMap): number {
    // 基于内容深度计算成熟度
    const totalElements = map.facts.length + map.insights.length + map.concepts.length;
    return Math.min(1, totalElements / 20);
  }
  
  private calculateComplexity(map: CognitiveMap): number {
    // 基于连接数计算复杂度
    return Math.min(1, map.connections.length / 15);
  }
  
  private createMetaballShader(): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform vec3 color;
      uniform float time;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 light = normalize(vec3(0.5, 1.0, 0.3));
        float brightness = dot(vNormal, light) * 0.5 + 0.5;
        
        vec3 finalColor = color * brightness;
        finalColor += 0.1 * sin(vPosition.y * 10.0 + time);
        
        gl_FragColor = vec4(finalColor, 0.8);
      }
    `;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x4169E1) },
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });
  }
  
  // 动画演化
  animateEvolution(from: OrganismModel, to: OrganismModel, duration: number): void {
    // TODO: 实现平滑过渡动画
    // 使用 GSAP 或其他动画库来实现形态变化
  }
  
  // 将认知地图数据转换为3D层数据（用于兼容现有系统）
  cognitiveMapToLayerData(map: CognitiveMap): LayerData[] {
    const layerData: LayerData[] = [];
    
    // 转换事实
    map.facts.forEach((fact, index) => {
      layerData.push({
        id: fact.id,
        type: 'facts',
        content: fact.content,
        position: this.calculateFactPosition(index, map.facts.length),
        color: '#4169E1',
        intensity: fact.confidence,
        relatedMessageId: fact.source
      });
    });
    
    // 转换洞见
    map.insights.forEach((insight, index) => {
      layerData.push({
        id: insight.id,
        type: 'insights',
        content: insight.content,
        position: this.calculateInsightPosition(index, map.insights.length),
        color: '#FFD700',
        intensity: insight.confidence,
        relatedMessageId: insight.relatedFacts[0] || ''
      });
    });
    
    // 转换概念
    map.concepts.forEach((concept, index) => {
      layerData.push({
        id: concept.id,
        type: 'concepts',
        content: concept.content,
        position: this.calculateConceptPosition(index, map.concepts.length),
        color: '#DC143C',
        intensity: concept.strength,
        relatedMessageId: concept.relatedInsights[0] || ''
      });
    });
    
    return layerData;
  }
  
  private calculateFactPosition(index: number, total: number): [number, number, number] {
    const angle = (index / total) * Math.PI * 2;
    const radius = 1.5;
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ];
  }
  
  private calculateInsightPosition(index: number, total: number): [number, number, number] {
    const angle = (index / total) * Math.PI * 2;
    const radius = 3;
    return [
      Math.cos(angle) * radius,
      1,
      Math.sin(angle) * radius
    ];
  }
  
  private calculateConceptPosition(index: number, total: number): [number, number, number] {
    const angle = (index / total) * Math.PI * 2;
    const radius = 4.5;
    return [
      Math.cos(angle) * radius,
      2,
      Math.sin(angle) * radius
    ];
  }
}

export default OrganismVisualizationEngine;