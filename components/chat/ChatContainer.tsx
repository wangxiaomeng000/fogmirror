'use client';

import { useCallback, useState } from 'react';
import { MessageList, MessageInput } from './';
import { ChatPanel } from '../layout';
import { Button } from '../ui/button';
import { MoreVertical, Download, Trash2 } from 'lucide-react';
import { useChat } from '../../hooks/use-chat';
import { Message } from '../../types';
import { aiService } from '../../lib/ai';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ChatContainerProps {
  onViewAnalysis?: (message: Message) => void;
  onExportChat?: () => void;
  onClearChat?: () => void;
}

export default function ChatContainer({ 
  onViewAnalysis,
  onExportChat,
  onClearChat
}: ChatContainerProps) {
  const { 
    currentSession, 
    addMessage, 
    isLoading,
    setLoading,
    setError,
    createNewSession 
  } = useChat();

  // 查看分析状态
  const [viewingAnalysis, setViewingAnalysis] = useState<Message | null>(null);
  
  const handleSendMessage = useCallback(async (content: string, image?: string) => {
    if (!currentSession) {
      createNewSession();
    }

    // 添加用户消息
    addMessage({
      content,
      role: 'user',
      image
    });

    // 开始生成AI响应
    setLoading(true);
    
    try {
      // 构建对话历史
      const conversationHistory = currentSession?.messages.map(msg => ({
        content: msg.content,
        role: msg.role
      })) || [];
      
      // 调用AI服务处理消息
      const { response, analysis } = await aiService.processMessage(
        content, 
        image, 
        {
          includeAnalysis: true,
          responseDelay: Math.floor(Math.random() * 1000) + 1000, // 1-2秒随机延迟
          useFactualApproach: true // 使用事实导向方法
        },
        conversationHistory
      );
      
      // 添加AI响应
      addMessage({
        content: response,
        role: 'ai',
        analysis
      });
    } catch (error) {
      console.error('AI response generation failed:', error);
      setError('无法生成AI响应，请稍后再试');
      
      // 添加简单回退响应
      addMessage({
        content: '抱歉，我现在无法处理您的请求。请继续描述具体的事实信息。',
        role: 'ai'
      });
    } finally {
      setLoading(false);
    }
  }, [currentSession, addMessage, createNewSession, setLoading, setError]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!currentSession) return;
    
    // 过滤掉要删除的消息
    const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId);
    
    // 更新会话
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    // 这里应该调用一个实际的更新会话方法
    // 这是一个简化的实现，真实代码应该更新存储
    console.log('Delete message:', messageId);
  }, [currentSession]);
  
  // 查看分析详情
  const handleViewAnalysis = useCallback((message: Message) => {
    setViewingAnalysis(message);
    // 这里可以实现显示分析详情的逻辑
    // 例如打开一个modal或者面板
    console.log('View analysis for message:', message.id);
  }, []);

  const sessionTitle = currentSession?.title || '新对话';
  const messages = currentSession?.messages || [];

  const actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportChat && (
          <DropdownMenuItem onClick={onExportChat}>
            <Download className="h-4 w-4 mr-2" />
            导出对话
          </DropdownMenuItem>
        )}
        {onClearChat && (
          <DropdownMenuItem onClick={onClearChat} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            清空对话
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ChatPanel title={sessionTitle} actions={actions}>
      <div className="flex flex-col h-full">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onViewAnalysis={onViewAnalysis || handleViewAnalysis}
          onDeleteMessage={handleDeleteMessage}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="描述一个具体事件，包括时间、地点和人物..."
        />
      </div>
    </ChatPanel>
  );
}