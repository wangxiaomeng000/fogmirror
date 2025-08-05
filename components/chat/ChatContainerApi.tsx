'use client';

import { useCallback, useState } from 'react';
import { MessageList, MessageInput } from './';
import { ChatPanel } from '../layout';
import { Button } from '../ui/button';
import { MoreVertical, Download, Trash2 } from 'lucide-react';
import { useChatApi } from '../../hooks/use-chat-api';
import { Message } from '../../types';
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

export default function ChatContainerApi({ 
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
    createNewSession,
    deleteSession
  } = useChatApi();

  const [viewingAnalysis, setViewingAnalysis] = useState<Message | null>(null);
  
  const handleSendMessage = useCallback(async (content: string, imageString?: string) => {
    // 如果有图片，需要将base64转换为File对象
    let imageFile: File | undefined;
    if (imageString) {
      try {
        const response = await fetch(imageString);
        const blob = await response.blob();
        imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      } catch (error) {
        console.error('Failed to convert image:', error);
      }
    }

    await addMessage(content, imageFile);
  }, [addMessage]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    console.log('Delete message:', messageId);
    // 消息删除需要在后端实现
  }, []);
  
  const handleViewAnalysis = useCallback((message: Message) => {
    setViewingAnalysis(message);
    if (onViewAnalysis) {
      onViewAnalysis(message);
    }
    console.log('View analysis for message:', message.id);
  }, [onViewAnalysis]);

  const handleClearChat = useCallback(() => {
    if (currentSession && onClearChat) {
      onClearChat();
    } else if (currentSession) {
      if (window.confirm('确定要清空当前对话吗？')) {
        deleteSession(currentSession.id);
      }
    }
  }, [currentSession, onClearChat, deleteSession]);

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
        <DropdownMenuItem onClick={handleClearChat} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          清空对话
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ChatPanel title={sessionTitle} actions={actions}>
      <div className="flex flex-col h-full">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onViewAnalysis={handleViewAnalysis}
          onDeleteMessage={handleDeleteMessage}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="分享您的想法或上传图片..."
        />
      </div>
    </ChatPanel>
  );
}