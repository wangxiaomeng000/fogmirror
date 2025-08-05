'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { QuickImageUpload } from '../upload';
import { UploadedFile } from '../../types';
import { useChat } from '../../hooks/use-chat';

interface MessageInputProps {
  onSendMessage: (content: string, image?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "输入您的消息..."
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading } = useChat();

  const handleSubmit = useCallback(() => {
    if ((!message.trim() && !uploadedImage) || disabled || isLoading) return;

    onSendMessage(message.trim(), uploadedImage?.data);
    setMessage('');
    setUploadedImage(null);
    
    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, uploadedImage, disabled, isLoading, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleImageUpload = useCallback((file: UploadedFile) => {
    setUploadedImage(file);
  }, []);

  const removeImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  return (
    <div className="border-t bg-card p-4 space-y-3">
      {/* 上传的图片预览 */}
      {uploadedImage && (
        <div className="relative inline-block">
          <img 
            src={uploadedImage.data} 
            alt={uploadedImage.name}
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <Button
            onClick={removeImage}
            variant="outline"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* 输入区域 */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 图片上传按钮 */}
          <QuickImageUpload
            onUpload={handleImageUpload}
            disabled={disabled || isLoading || !!uploadedImage}
          />
          
          {/* 发送按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={(!message.trim() && !uploadedImage) || disabled || isLoading}
            size="icon"
            className="h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* 提示信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {uploadedImage 
            ? `已选择: ${uploadedImage.name} (${Math.round(uploadedImage.size / 1024)}KB)`
            : '支持文本消息和图片上传'
          }
        </span>
        <span>按 Enter 发送，Shift + Enter 换行</span>
      </div>
    </div>
  );
}