'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { LayerData, LayerType } from '../../types';

interface TreeNode {
  id: string;
  type: LayerType;
  content: string;
  position: THREE.Vector3;
  children: TreeNode[];
  parent?: TreeNode;
  connections: Array<{ to: string; strength: number }>;
}

// 三层分叉树可视化组件
export function TreeVisualization({ 
  layerData, 
  cognitiveMap,
  selectedLayer,
  onNodeClick
}: {
  layerData: LayerData[];
  cognitiveMap?: any;
  selectedLayer: LayerType | null;
  onNodeClick?: (node: any) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <Suspense fallback={null}>
        <TreeContent
          layerData={layerData}
          cognitiveMap={cognitiveMap}
          selectedLayer={selectedLayer}
          onNodeClick={onNodeClick}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI * 0.9}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Suspense>
    </Canvas>
  );
}

// 树内容组件（在Canvas内部）
function TreeContent({
  layerData,
  cognitiveMap,
  selectedLayer,
  onNodeClick
}: {
  layerData: LayerData[];
  cognitiveMap?: any;
  selectedLayer: LayerType | null;
  onNodeClick?: (node: any) => void;
}) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // 构建树结构
  useEffect(() => {
    const buildTree = () => {
      const factNodes: TreeNode[] = [];
      const insightNodes: TreeNode[] = [];
      const conceptNodes: TreeNode[] = [];

      // 分类节点
      layerData.forEach((item, index) => {
        const node: TreeNode = {
          id: item.id,
          type: item.type,
          content: item.content,
          position: new THREE.Vector3(),
          children: [],
          connections: []
        };

        if (item.type === 'fact') {
          // 事实层 - 根系布局
          const angle = (index / layerData.filter(d => d.type === 'fact').length) * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          node.position.set(
            Math.cos(angle) * radius,
            -3,
            Math.sin(angle) * radius
          );
          factNodes.push(node);
        } else if (item.type === 'insight') {
          // 洞见层 - 枝干布局
          const angle = (index / layerData.filter(d => d.type === 'insight').length) * Math.PI * 2;
          const radius = 4 + Math.random() * 2;
          node.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          );
          insightNodes.push(node);
        } else if (item.type === 'concept') {
          // 观念层 - 冠层布局
          const angle = (index / layerData.filter(d => d.type === 'concept').length) * Math.PI * 2;
          const radius = 2 + Math.random() * 1;
          node.position.set(
            Math.cos(angle) * radius,
            3,
            Math.sin(angle) * radius
          );
          conceptNodes.push(node);
        }
      });

      // 建立连接关系
      if (cognitiveMap?.connections) {
        cognitiveMap.connections.forEach((conn: any) => {
          const fromNode = [...factNodes, ...insightNodes, ...conceptNodes]
            .find(n => n.id === conn.from);
          const toNode = [...factNodes, ...insightNodes, ...conceptNodes]
            .find(n => n.id === conn.to);
          
          if (fromNode && toNode) {
            fromNode.connections.push({
              to: toNode.id,
              strength: conn.strength
            });
          }
        });
      }

      setTreeData([...factNodes, ...insightNodes, ...conceptNodes]);
    };

    buildTree();
  }, [layerData, cognitiveMap]);

  return (
    <group>
      {/* 三层平面 */}
      <LayerPlanes />
      
      {/* 渲染节点 */}
      {treeData.map(node => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedLayer === node.type}
          onClick={() => onNodeClick?.(node)}
        />
      ))}
      
      {/* 渲染连接线 */}
      {treeData.map(node => 
        node.connections.map((conn, idx) => {
          const targetNode = treeData.find(n => n.id === conn.to);
          if (!targetNode) return null;
          
          return (
            <ConnectionLine
              key={`${node.id}-${conn.to}-${idx}`}
              start={node.position}
              end={targetNode.position}
              strength={conn.strength}
              type={getConnectionType(node.type, targetNode.type)}
            />
          );
        })
      )}
      
      {/* 认知地图迷雾区域 */}
      {cognitiveMap?.foggyAreas?.map((foggy: any, idx: number) => (
        <FoggyArea
          key={idx}
          position={new THREE.Vector3(foggy.x / 100 - 4, 0, foggy.y / 100 - 3)}
          radius={foggy.radius / 100}
          opacity={0.3}
        />
      ))}
    </group>
  );
}

// 三层平面
function LayerPlanes() {
  return (
    <>
      {/* 事实层 - 蓝色根系 */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#0066cc" 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 洞见层 - 金色枝干 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 观念层 - 红色冠层 */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#cc0000" 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

// 树节点组件
function TreeNodeComponent({ 
  node, 
  isSelected, 
  onClick 
}: {
  node: TreeNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.2 : isSelected ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      
      // 节点脉动效果
      if (isSelected) {
        meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const getColor = () => {
    switch (node.type) {
      case 'fact': return '#4488ff';
      case 'insight': return '#ffcc44';
      case 'concept': return '#ff4444';
      default: return '#888888';
    }
  };

  const getSize = () => {
    switch (node.type) {
      case 'fact': return 0.3;
      case 'insight': return 0.4;
      case 'concept': return 0.5;
      default: return 0.3;
    }
  };

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[getSize(), 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>
      
      {/* 节点标签 */}
      <Text
        position={[0, getSize() + 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.content.substring(0, 20)}...
      </Text>
    </group>
  );
}

// 连接线组件
function ConnectionLine({ 
  start, 
  end, 
  strength,
  type
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  strength: number;
  type: string;
}) {
  const points = [start, end];
  
  const getColor = () => {
    switch (type) {
      case 'upward': return '#00ff00'; // 从低层到高层 - 绿色
      case 'downward': return '#ff0000'; // 从高层到低层 - 红色
      case 'lateral': return '#ffff00'; // 同层连接 - 黄色
      default: return '#ffffff';
    }
  };

  return (
    <Line
      points={points}
      color={getColor()}
      lineWidth={strength * 3}
      opacity={0.5 + strength * 0.5}
      transparent
    />
  );
}

// 迷雾区域组件
function FoggyArea({ 
  position, 
  radius, 
  opacity 
}: {
  position: THREE.Vector3;
  radius: number;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color="#888888"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

// 判断连接类型
function getConnectionType(fromType: LayerType, toType: LayerType): string {
  const typeOrder = { 'fact': 0, 'insight': 1, 'concept': 2 };
  const fromOrder = typeOrder[fromType] || 0;
  const toOrder = typeOrder[toType] || 0;
  
  if (fromOrder < toOrder) return 'upward';
  if (fromOrder > toOrder) return 'downward';
  return 'lateral';
}