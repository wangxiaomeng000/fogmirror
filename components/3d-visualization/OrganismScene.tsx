'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Float } from '@react-three/drei';
import { LayerData, LayerType } from '../../types';
import * as THREE from 'three';
import { OrganismVisualizationEngine, OrganismModel } from '../../lib/3d/organismEngine';
import { CognitiveMap } from '../../lib/ai/cognitiveAnalysisEngine';

interface OrganismSceneProps {
  layerData: LayerData[];
  cognitiveMap?: CognitiveMap;
  selectedLayer: LayerType | null;
  onLayerClick?: (layer: LayerData) => void;
  onReset?: () => void;
  viewMode?: 'layers' | 'organism';
}

// 生物体组件
function Organism({ cognitiveMap, onUpdate }: { 
  cognitiveMap: CognitiveMap;
  onUpdate?: (organism: OrganismModel) => void;
}) {
  const { scene } = useThree();
  const organismRef = useRef<OrganismModel | null>(null);
  const engineRef = useRef<OrganismVisualizationEngine | null>(null);
  
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new OrganismVisualizationEngine(scene);
    }
    
    // 生成新的生物体模型
    const newOrganism = engineRef.current.generateOrganism(cognitiveMap);
    
    // 移除旧的生物体
    if (organismRef.current) {
      scene.remove(organismRef.current.group);
    }
    
    // 添加新的生物体
    scene.add(newOrganism.group);
    organismRef.current = newOrganism;
    
    if (onUpdate) {
      onUpdate(newOrganism);
    }
    
    return () => {
      if (organismRef.current) {
        scene.remove(organismRef.current.group);
      }
    };
  }, [cognitiveMap, scene, onUpdate]);
  
  useFrame((state, delta) => {
    if (organismRef.current) {
      organismRef.current.update(delta);
      organismRef.current.group.rotation.y += delta * 0.1;
    }
  });
  
  return null;
}

// 传统层级视图组件
function LayerView({ layerData, selectedLayer, onLayerClick }: {
  layerData: LayerData[];
  selectedLayer: LayerType | null;
  onLayerClick?: (layer: LayerData) => void;
}) {
  const filteredData = selectedLayer 
    ? layerData.filter(item => item.type === selectedLayer)
    : layerData;
    
  return (
    <>
      {/* 三个层级平面 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshBasicMaterial color="#4169E1" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 4, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.5, 5.5, 32]} />
        <meshBasicMaterial color="#DC143C" transparent opacity={0.3} />
      </mesh>
      
      {/* 数据点 */}
      {filteredData.map((data) => (
        <Float
          key={data.id}
          speed={1}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <group position={data.position}>
            <mesh onClick={() => onLayerClick?.(data)}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={data.color} 
                emissive={data.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.2}
              color={data.color}
              anchorX="center"
              anchorY="middle"
              maxWidth={3}
            >
              {data.content.substring(0, 20)}
            </Text>
          </group>
        </Float>
      ))}
    </>
  );
}

// 状态信息面板
function StatusPanel({ organism }: { organism: OrganismModel | null }) {
  if (!organism) return null;
  
  return (
    <group position={[5, 3, 0]}>
      <Text
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {`健康度: ${(organism.health * 100).toFixed(0)}%`}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {`成熟度: ${(organism.maturity * 100).toFixed(0)}%`}
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {`复杂度: ${(organism.complexity * 100).toFixed(0)}%`}
      </Text>
    </group>
  );
}

// 主场景组件
function MainOrganismScene({ 
  layerData, 
  cognitiveMap,
  selectedLayer, 
  onLayerClick,
  viewMode = 'organism'
}: OrganismSceneProps) {
  const controlsRef = useRef<any>(null);
  const [currentOrganism, setCurrentOrganism] = useState<OrganismModel | null>(null);
  
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  // 创建默认的认知地图
  const defaultCognitiveMap: CognitiveMap = cognitiveMap || {
    facts: layerData.filter(d => d.type === 'facts').map((d, i) => ({
      id: d.id,
      content: d.content,
      type: 'observational' as const,
      confidence: d.intensity,
      source: d.relatedMessageId
    })),
    insights: layerData.filter(d => d.type === 'insights').map((d, i) => ({
      id: d.id,
      content: d.content,
      type: 'pattern' as const,
      relatedFacts: [],
      confidence: d.intensity
    })),
    concepts: layerData.filter(d => d.type === 'concepts').map((d, i) => ({
      id: d.id,
      content: d.content,
      type: 'belief' as const,
      relatedInsights: [],
      strength: d.intensity
    })),
    biases: [],
    connections: []
  };
  
  return (
    <>
      {/* 环境 */}
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a0a', 10, 50]} />
      
      {/* 光源 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[5, 2, 5]} intensity={0.5} color="#4169E1" />
      <pointLight position={[-5, 2, -5]} intensity={0.5} color="#DC143C" />
      
      {/* 控制器 */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        autoRotate={viewMode === 'organism'}
        autoRotateSpeed={0.5}
      />
      
      {/* 根据模式显示不同视图 */}
      {viewMode === 'organism' ? (
        <>
          <Organism 
            cognitiveMap={defaultCognitiveMap}
            onUpdate={setCurrentOrganism}
          />
          <StatusPanel organism={currentOrganism} />
        </>
      ) : (
        <LayerView
          layerData={layerData}
          selectedLayer={selectedLayer}
          onLayerClick={onLayerClick}
        />
      )}
      
      {/* 标题 */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {viewMode === 'organism' ? '认知生物体' : '认知层级'}
      </Text>
    </>
  );
}

export default function OrganismScene({ 
  layerData, 
  cognitiveMap,
  selectedLayer, 
  onLayerClick, 
  onReset,
  viewMode = 'organism'
}: OrganismSceneProps) {
  return (
    <div className="w-full h-full relative bg-black">
      <Canvas
        camera={{ position: [10, 6, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <MainOrganismScene
            layerData={layerData}
            cognitiveMap={cognitiveMap}
            selectedLayer={selectedLayer}
            onLayerClick={onLayerClick}
            onReset={onReset}
            viewMode={viewMode}
          />
        </Suspense>
      </Canvas>
      
      {/* 视图切换按钮 */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'organism' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => {/* 需要父组件处理 */}}
        >
          生物体视图
        </button>
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'layers' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => {/* 需要父组件处理 */}}
        >
          层级视图
        </button>
      </div>
      
      {/* 空状态显示 */}
      {layerData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🧬</div>
            <h3 className="text-lg font-semibold mb-2">开始对话以生成认知模型</h3>
            <p className="text-sm">AI会将您的思维过程可视化为动态生物体</p>
          </div>
        </div>
      )}
    </div>
  );
}