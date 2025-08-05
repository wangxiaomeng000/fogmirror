'use client';

import { useState } from 'react';
import { Eye, EyeOff, Layers, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { LayerType } from '../../types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface VisualizationPanelProps {
  children: React.ReactNode;
  selectedLayer: LayerType | null;
  onLayerSelect: (layer: LayerType | null) => void;
  layerCounts?: {
    facts: number;
    insights: number;
    concepts: number;
  };
  onReset?: () => void;
  onFullscreen?: () => void;
}

export default function VisualizationPanel({ 
  children, 
  selectedLayer, 
  onLayerSelect,
  layerCounts = { facts: 0, insights: 0, concepts: 0 },
  onReset,
  onFullscreen
}: VisualizationPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  const layers = [
    { 
      type: 'facts' as LayerType, 
      label: '事实层', 
      color: 'bg-blue-500',
      count: layerCounts.facts
    },
    { 
      type: 'insights' as LayerType, 
      label: '洞见层', 
      color: 'bg-orange-500',
      count: layerCounts.insights
    },
    { 
      type: 'concepts' as LayerType, 
      label: '观念层', 
      color: 'bg-green-500',
      count: layerCounts.concepts
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 头部控制栏 */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5" />
          <span className="font-semibold">3D可视化</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsVisible(!isVisible)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVisible ? '隐藏' : '显示'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onReset && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onReset}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  重置视角
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onFullscreen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onFullscreen}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  全屏
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* 层级选择器 */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">层级选择</span>
          <Button
            onClick={() => onLayerSelect(null)}
            variant={selectedLayer === null ? "default" : "outline"}
            size="sm"
          >
            显示全部
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {layers.map((layer) => (
            <Button
              key={layer.type}
              onClick={() => onLayerSelect(layer.type)}
              variant={selectedLayer === layer.type ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-between p-2 h-auto"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                <span className="text-xs">{layer.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {layer.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* 3D可视化区域 */}
      <div className="flex-1 relative">
        {isVisible ? (
          <div className="absolute inset-0">
            {children}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <EyeOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">3D可视化已隐藏</p>
              <p className="text-xs mt-1">点击显示按钮重新启用</p>
            </div>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-3 border-t bg-card">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>总计: {layerCounts.facts + layerCounts.insights + layerCounts.concepts} 个元素</span>
          <span>实时更新</span>
        </div>
      </div>
    </div>
  );
}