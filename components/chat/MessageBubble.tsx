'use client';

import { useState } from 'react';
import { Bot, User, Copy, Check, Eye, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatTimestamp } from '../../lib/utils';
import { Message } from '../../types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface MessageBubbleProps {
  message: Message;
  onViewAnalysis?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageBubble({ 
  message, 
  onViewAnalysis, 
  onDeleteMessage 
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  
  const isAI = message.role === 'ai';
  const hasAnalysis = message.analysis && (
    message.analysis.facts.length > 0 || 
    message.analysis.insights.length > 0 || 
    message.analysis.concepts.length > 0
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className={`flex items-start space-x-3 group ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-blue-500 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col space-y-2 max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        {/* 消息内容 */}
        <div className={`
          relative px-4 py-2 rounded-lg shadow-sm
          ${isAI 
            ? 'bg-card text-card-foreground border' 
            : 'bg-primary text-primary-foreground'
          }
        `}>
          {/* 消息文本 */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* 图片显示 */}
          {message.image && (
            <div className="mt-2">
              <img 
                src={message.image} 
                alt="用户上传的图片"
                className={`
                  rounded-lg cursor-pointer transition-all duration-200
                  ${imageExpanded ? 'max-w-none w-96' : 'max-w-xs'}
                `}
                onClick={() => setImageExpanded(!imageExpanded)}
              />
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
            <span className="text-xs opacity-70">
              {formatTimestamp(message.timestamp)}
            </span>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCopy}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? '已复制' : '复制'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {hasAnalysis && onViewAnalysis && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onViewAnalysis(message)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      查看分析
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onDeleteMessage && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onDeleteMessage(message.id)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      删除消息
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        
        {/* AI分析结果预览 */}
        {hasAnalysis && isAI && (
          <div className="bg-muted rounded-lg p-2 text-xs space-y-1">
            <div className="font-medium text-muted-foreground">AI分析结果:</div>
            {message.analysis!.facts.length > 0 && (
              <div className="text-blue-600">
                事实层: {message.analysis!.facts.length} 条
              </div>
            )}
            {message.analysis!.insights.length > 0 && (
              <div className="text-orange-600">
                洞见层: {message.analysis!.insights.length} 条
              </div>
            )}
            {message.analysis!.concepts.length > 0 && (
              <div className="text-green-600">
                观念层: {message.analysis!.concepts.length} 条
              </div>
            )}
          </div>
        )}
      </div>
      
      {!isAI && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}