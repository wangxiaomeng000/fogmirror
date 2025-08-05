'use client';

import { useState } from 'react';
import { X, Eye, Brain, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { LayerData, Message, AnalysisResult } from '../../types';

interface AnalysisDetailProps {
  data: LayerData | Message | null;
  onClose: () => void;
}

export default function AnalysisDetail({ data, onClose }: AnalysisDetailProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['facts', 'insights', 'concepts']);

  if (!data) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // 处理LayerData类型
  if ('type' in data) {
    const layerData = data as LayerData;
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {layerData.type === 'facts' && <Eye className="h-5 w-5 text-blue-500" />}
              {layerData.type === 'insights' && <Brain className="h-5 w-5 text-orange-500" />}
              {layerData.type === 'concepts' && <Lightbulb className="h-5 w-5 text-green-500" />}
              
              {layerData.type === 'facts' && '事实层'}
              {layerData.type === 'insights' && '洞见层'}
              {layerData.type === 'concepts' && '观念层'}
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">内容</p>
              <p className="text-sm text-muted-foreground">{layerData.content}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">强度</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${layerData.intensity * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(layerData.intensity * 100)}%
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">位置</p>
              <p className="text-xs text-muted-foreground font-mono">
                ({layerData.position[0].toFixed(2)}, {layerData.position[1].toFixed(2)}, {layerData.position[2].toFixed(2)})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 处理Message类型
  const message = data as Message;
  const analysis = message.analysis;
  
  if (!analysis) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            消息详情
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">该消息没有分析数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI分析详情</CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {/* 情感基调 */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">情感基调</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">主要情感</span>
                  <Badge variant="secondary">{analysis.emotionalTone.primary}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">强度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${analysis.emotionalTone.intensity * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(analysis.emotionalTone.intensity * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">置信度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${analysis.emotionalTone.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(analysis.emotionalTone.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 事实层 */}
            {analysis.facts.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('facts')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">事实层</span>
                    <Badge variant="secondary">{analysis.facts.length}</Badge>
                  </div>
                  {expandedSections.includes('facts') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.includes('facts') && (
                  <div className="mt-2 space-y-2 pl-6">
                    {analysis.facts.map((fact, index) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        {fact}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 洞见层 */}
            {analysis.insights.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('insights')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">洞见层</span>
                    <Badge variant="secondary">{analysis.insights.length}</Badge>
                  </div>
                  {expandedSections.includes('insights') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.includes('insights') && (
                  <div className="mt-2 space-y-2 pl-6">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="text-sm p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        {insight}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 观念层 */}
            {analysis.concepts.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('concepts')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-green-500" />
                    <span className="font-medium">观念层</span>
                    <Badge variant="secondary">{analysis.concepts.length}</Badge>
                  </div>
                  {expandedSections.includes('concepts') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                
                {expandedSections.includes('concepts') && (
                  <div className="mt-2 space-y-2 pl-6">
                    {analysis.concepts.map((concept, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        {concept}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* 建议 */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  建议
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}