'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CognitiveNode } from '@/backend/src/config/cognitiveArchaeology';

interface CognitiveMapProps {
  nodes: CognitiveNode[];
  onNodeClick?: (node: CognitiveNode) => void;
}

// 节点组件
function NodeMesh({ node, onClick }: { node: CognitiveNode; onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  // 节点颜色和大小
  const nodeConfig = {
    fact: { color: '#3B82F6', size: 1 },
    insight: { color: '#F59E0B', size: 1.5 },
    belief: { color: '#EF4444', size: 2 }
  };

  const config = nodeConfig[node.type];
  const color = hovered ? '#FFFFFF' : config.color;
  
  // 张力点效果
  const tensionIntensity = node.tensionLevel || 0;
  
  useFrame((state) => {
    if (meshRef.current && tensionIntensity > 0.5) {
      // 高张力节点脉动效果
      meshRef.current.scale.setScalar(
        config.size + Math.sin(state.clock.elapsedTime * 3) * 0.1 * tensionIntensity
      );
    }
  });

  return (
    <group position={[node.position.x, node.position.y, node.position.z]}>
      <Sphere
        ref={meshRef}
        args={[config.size, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={config.color}
          emissiveIntensity={tensionIntensity * 0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </Sphere>
      
      {/* 节点标签 */}
      <Text
        position={[0, config.size + 1, 0]}
        fontSize={0.5}
        color={config.color}
        anchorX="center"
        anchorY="bottom"
        maxWidth={5}
      >
        {node.content.substring(0, 20)}...
      </Text>
      
      {/* 张力点标记 */}
      {tensionIntensity > 0.7 && (
        <mesh position={[0, config.size + 2, 0]}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// 连接线组件
function ConnectionLine({ start, end, strength = 1 }: { 
  start: THREE.Vector3; 
  end: THREE.Vector3; 
  strength?: number;
}) {
  const points = useMemo(() => [start, end], [start, end]);
  
  return (
    <Line
      points={points}
      color="#666666"
      lineWidth={strength * 2}
      dashed={strength < 0.5}
      dashScale={50}
      opacity={0.3 + strength * 0.3}
      transparent
    />
  );
}

// 层级平面
function LayerPlane({ y, label, color }: { y: number; label: string; color: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial 
          color={color} 
          opacity={0.1} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text
        position={[-100, 0, -100]}
        fontSize={8}
        color={color}
        anchorX="left"
        anchorY="middle"
        opacity={0.5}
      >
        {label}
      </Text>
    </group>
  );
}

// 相机控制
function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 50, 0);
  }, [camera]);
  
  return null;
}

export default function CognitiveMap({ nodes, onNodeClick }: CognitiveMapProps) {
  // 计算连接线
  const connections = useMemo(() => {
    const lines: Array<{ start: CognitiveNode; end: CognitiveNode; strength: number }> = [];
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          // 计算连接强度
          const strength = node.type === targetNode.type ? 0.5 : 1;
          lines.push({ start: node, end: targetNode, strength });
        }
      });
    });
    
    return lines;
  }, [nodes]);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas camera={{ fov: 60, near: 0.1, far: 1000 }}>
        <CameraController />
        
        {/* 光照 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[100, 100, 100]} intensity={0.8} />
        
        {/* 控制器 */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={300}
        />
        
        {/* 层级平面 */}
        <LayerPlane y={0} label="事实层 Facts" color="#3B82F6" />
        <LayerPlane y={100} label="洞见层 Insights" color="#F59E0B" />
        <LayerPlane y={200} label="观念层 Beliefs" color="#EF4444" />
        
        {/* 节点 */}
        {nodes.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            onClick={() => onNodeClick?.(node)}
          />
        ))}
        
        {/* 连接线 */}
        {connections.map((conn, idx) => (
          <ConnectionLine
            key={`${conn.start.id}-${conn.end.id}-${idx}`}
            start={new THREE.Vector3(
              conn.start.position.x,
              conn.start.position.y,
              conn.start.position.z
            )}
            end={new THREE.Vector3(
              conn.end.position.x,
              conn.end.position.y,
              conn.end.position.z
            )}
            strength={conn.strength}
          />
        ))}
        
        {/* 坐标轴 */}
        <axesHelper args={[50]} />
        
        {/* 网格 */}
        <gridHelper args={[300, 30]} position={[0, -1, 0]} />
      </Canvas>
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg">
        <h3 className="text-white text-sm font-bold mb-2">认知地图图例</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-300">事实 Facts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full" />
            <span className="text-xs text-gray-300">洞见 Insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full" />
            <span className="text-xs text-gray-300">观念 Beliefs</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-300">张力点 Tension</span>
          </div>
        </div>
      </div>
    </div>
  );
}