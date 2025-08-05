'use client';

import { useEffect, useState, useCallback } from 'react';
import { VisualizationPanel } from '../layout';
import Scene from './Scene';
import OrganismScene from './OrganismScene';
import { TreeVisualization } from './TreeVisualization';
import { useChat } from '../../hooks/use-chat';
import { LayerData, LayerType } from '../../types';
import { aiService } from '../../lib/ai';
import { CognitiveMap } from '../../lib/ai/cognitiveAnalysisEngine';

interface VisualizationContainerProps {
  onItemClick?: (item: LayerData) => void;
}

export default function VisualizationContainer({ onItemClick }: VisualizationContainerProps) {
  const { currentSession, selectedLayer, selectLayer } = useChat();
  const [layerData, setLayerData] = useState<LayerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'layers' | 'organism' | 'tree'>('tree');
  const [cognitiveMap, setCognitiveMap] = useState<CognitiveMap | undefined>();

  // 生成3D层数据
  useEffect(() => {
    if (!currentSession || !currentSession.messages.length) {
      setLayerData([]);
      setCognitiveMap(undefined);
      return;
    }

    setIsLoading(true);
    
    // 模拟数据生成延迟
    setTimeout(() => {
      const data = aiService.generateLayerData(currentSession.messages);
      setLayerData(data);
      
      // 构建认知地图（简化版）
      const map: CognitiveMap = {
        facts: data.filter(d => d.type === 'facts').map(d => ({
          id: d.id,
          content: d.content,
          type: 'observational' as const,
          confidence: d.intensity,
          source: d.relatedMessageId
        })),
        insights: data.filter(d => d.type === 'insights').map(d => ({
          id: d.id,
          content: d.content,
          type: 'pattern' as const,
          relatedFacts: [],
          confidence: d.intensity
        })),
        concepts: data.filter(d => d.type === 'concepts').map(d => ({
          id: d.id,
          content: d.content,
          type: 'belief' as const,
          relatedInsights: [],
          strength: d.intensity
        })),
        biases: [],
        connections: []
      };
      setCognitiveMap(map);
      
      setIsLoading(false);
    }, 300);
  }, [currentSession?.messages]);

  // 计算层级统计
  const layerCounts = {
    facts: layerData.filter(item => item.type === 'facts').length,
    insights: layerData.filter(item => item.type === 'insights').length,
    concepts: layerData.filter(item => item.type === 'concepts').length
  };

  // 重置视角
  const handleReset = useCallback(() => {
    // 重置视角的逻辑将由Scene组件处理
    console.log('Reset 3D view');
  }, []);

  // 全屏模式
  const handleFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  }, []);

  // 处理层级选择
  const handleLayerSelect = useCallback((layer: LayerType | null) => {
    selectLayer(layer);
  }, [selectLayer]);

  // 处理3D项目点击
  const handleLayerClick = useCallback((item: LayerData) => {
    console.log('Layer item clicked:', item);
    if (onItemClick) {
      onItemClick(item);
    }
  }, [onItemClick]);

  return (
    <VisualizationPanel
      selectedLayer={selectedLayer}
      onLayerSelect={handleLayerSelect}
      layerCounts={layerCounts}
      onReset={handleReset}
      onFullscreen={handleFullscreen}
    >
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">生成可视化数据...</p>
            </div>
          </div>
        )}
        
        {viewMode === 'organism' ? (
          <OrganismScene
            layerData={layerData}
            cognitiveMap={cognitiveMap}
            selectedLayer={selectedLayer}
            onLayerClick={handleLayerClick}
            onReset={handleReset}
            viewMode={viewMode}
          />
        ) : viewMode === 'tree' ? (
          <TreeVisualization
            layerData={layerData}
            cognitiveMap={cognitiveMap}
            selectedLayer={selectedLayer}
            onNodeClick={handleLayerClick}
          />
        ) : (
          <Scene
            layerData={layerData}
            selectedLayer={selectedLayer}
            onLayerClick={handleLayerClick}
            onReset={handleReset}
          />
        )}
        
        {/* 视图模式切换按钮 */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            分叉树视图
          </button>
          <button
            onClick={() => setViewMode('organism')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'organism'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            生物体视图
          </button>
          <button
            onClick={() => setViewMode('layers')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'layers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            层级视图
          </button>
        </div>
      </div>
    </VisualizationPanel>
  );
}