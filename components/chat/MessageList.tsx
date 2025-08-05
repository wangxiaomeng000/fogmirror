'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { MessageBubble } from './';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onViewAnalysis?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageList({ 
  messages, 
  isLoading = false, 
  onViewAnalysis,
  onDeleteMessage 
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.66-.4l-5.34 2.24a1 1 0 01-1.33-1.33l2.24-5.34A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">开始对话</h3>
          <p className="text-sm">分享您的想法或上传图片，让AI帮助您分析情感</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div 
        ref={scrollRef}
        className="p-4 space-y-4"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onViewAnalysis={onViewAnalysis}
            onDeleteMessage={onDeleteMessage}
          />
        ))}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 bg-card rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
                <span className="text-sm text-muted-foreground">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}