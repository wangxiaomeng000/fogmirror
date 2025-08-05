'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Grid } from '@react-three/drei';
import { LayerData, LayerType } from '../../types';
import * as THREE from 'three';

interface SceneProps {
  layerData: LayerData[];
  selectedLayer: LayerType | null;
  onLayerClick?: (layer: LayerData) => void;
  onReset?: () => void;
}

// 3D层级平面组件
function LayerPlane({ y, type, color, opacity = 0.1 }: { 
  y: number; 
  type: LayerType; 
  color: string; 
  opacity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 数据点组件
function DataPoint({ data, isSelected, onClick }: { 
  data: LayerData; 
  isSelected: boolean;
  onClick: (data: LayerData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  const handleClick = () => {
    onClick(data);
  };

  return (
    <group position={data.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        scale={isSelected ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={data.color} 
          emissive={data.color}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* 悬浮文本 */}
      <Text
        ref={textRef}
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color={data.color}
        anchorX="center"
        anchorY="middle"
        maxWidth={5}
      >
        {data.content.length > 20 ? data.content.substring(0, 20) + '...' : data.content}
      </Text>
    </group>
  );
}

// 主3D场景组件
function MainScene({ layerData, selectedLayer, onLayerClick }: SceneProps) {
  const controlsRef = useRef<any>(null);
  
  // 过滤显示的数据
  const filteredData = selectedLayer 
    ? layerData.filter(item => item.type === selectedLayer)
    : layerData;

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <>
      {/* 环境光 */}
      <Environment preset="sunset" />
      
      {/* 主光源 */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
      />
      
      {/* 控制器 */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
      
      {/* 网格线 */}
      <Grid 
        args={[20, 20]} 
        position={[0, -0.5, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#666666"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#999999"
      />
      
      {/* 三个层级平面 */}
      <LayerPlane 
        y={2} 
        type="facts" 
        color="#3B82F6" 
        opacity={selectedLayer === 'facts' ? 0.3 : 0.1}
      />
      <LayerPlane 
        y={4} 
        type="insights" 
        color="#F59E0B" 
        opacity={selectedLayer === 'insights' ? 0.3 : 0.1}
      />
      <LayerPlane 
        y={6} 
        type="concepts" 
        color="#10B981" 
        opacity={selectedLayer === 'concepts' ? 0.3 : 0.1}
      />
      
      {/* 层级标签 */}
      <Text
        position={[-8, 2, 0]}
        fontSize={0.6}
        color="#3B82F6"
        anchorX="center"
        anchorY="middle"
      >
        事实层 Facts
      </Text>
      <Text
        position={[-8, 4, 0]}
        fontSize={0.6}
        color="#F59E0B"
        anchorX="center"
        anchorY="middle"
      >
        洞见层 Insights
      </Text>
      <Text
        position={[-8, 6, 0]}
        fontSize={0.6}
        color="#10B981"
        anchorX="center"
        anchorY="middle"
      >
        观念层 Concepts
      </Text>
      
      {/* 数据点 */}
      {filteredData.map((data) => (
        <DataPoint
          key={data.id}
          data={data}
          isSelected={false}
          onClick={onLayerClick || (() => {})}
        />
      ))}
      
      {/* 连接线 */}
      {filteredData.map((data, index) => {
        if (index === 0) return null;
        const prevData = filteredData[index - 1];
        
        return (
          <line key={`line-${data.id}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...prevData.position,
                  ...data.position
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#666666" transparent opacity={0.3} />
          </line>
        );
      })}
    </>
  );
}

// 加载组件
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">加载3D场景中...</p>
      </div>
    </div>
  );
}

// 错误边界组件
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}

export default function Scene({ layerData, selectedLayer, onLayerClick, onReset }: SceneProps) {
  return (
    <ErrorBoundary>
      <div className="w-full h-full relative">
        <Canvas
          camera={{ position: [15, 8, 15], fov: 50 }}
          className="bg-gradient-to-b from-gray-100 to-gray-200"
        >
          <Suspense fallback={null}>
            <MainScene
              layerData={layerData}
              selectedLayer={selectedLayer}
              onLayerClick={onLayerClick}
              onReset={onReset}
            />
          </Suspense>
        </Canvas>
        
        {/* 空状态显示 */}
        {layerData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-lg font-semibold mb-2">开始对话以查看分析</h3>
              <p className="text-sm">AI会将您的对话分析结果显示在这个3D空间中</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}