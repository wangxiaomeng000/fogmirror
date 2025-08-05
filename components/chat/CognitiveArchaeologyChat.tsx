'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Upload, Send, Camera, Info } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils';
import CognitiveMap from '../3d-visualization/CognitiveMap';
// import { CognitiveNode } from '@/backend/src/config/cognitiveArchaeology';

interface CognitiveNode {
  id: string;
  content: string;
  type: 'fact' | 'insight' | 'belief';
  timestamp: number;
  position: { x: number; y: number; z: number };
  connections: string[];
  tensionLevel?: number;
}

interface Message {
  id: string;
  role: 'user' | 'archaeologist';
  content: string;
  timestamp: number;
  image?: string;
}

export default function CognitiveArchaeologyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [cognitiveNodes, setCognitiveNodes] = useState<CognitiveNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初始欢迎消息
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'archaeologist',
      content: '让我们开始一段认知考古之旅。有什么具体的场景或瞬间，让你觉得需要重新理解？',
      timestamp: Date.now()
    }]);
  }, []);

  const handleSend = async () => {
    console.log('handleSend called, input:', input, 'hasFile:', hasFile);
    if (!input.trim() && !hasFile) {
      console.log('Returning early - no input or file');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    // 处理图片
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const base64WithPrefix = await fileToBase64(file);
      // 移除 data:image/xxx;base64, 前缀
      const base64 = base64WithPrefix.split(',')[1];
      userMessage.image = base64;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      setHasFile(false);
    }

    // 调用AI服务
    try {
      console.log('Sending request to API...');
      const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage.content,
          image: userMessage.image,
          sessionId: 'cognitive-session',
          history: messages
        })
      });
      console.log('Response status:', response.status);

      const data = await response.json();
      
      // 更新认知节点
      if (data.cognitiveNodes) {
        setCognitiveNodes(data.cognitiveNodes);
      }

      // 添加AI回复
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'archaeologist',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      console.error('Error details:', error.message, error.stack);
      // 降级处理
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: 'archaeologist',
        content: '能具体描述一下那个时刻吗？时间、地点、在场的人...',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNodeClick = (node: CognitiveNode) => {
    setSelectedNode(node);
    // 可以在对话中引用这个节点
    setInput(`关于"${node.content.substring(0, 30)}..."，`);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* 左侧：认知地图 */}
      <div className="flex-1 relative">
        <CognitiveMap nodes={cognitiveNodes} onNodeClick={handleNodeClick} />
        
        {/* 节点详情 */}
        {selectedNode && (
          <Card className="absolute top-4 right-4 p-4 bg-gray-900 bg-opacity-90 max-w-sm">
            <h3 className="text-sm font-bold text-white mb-2">
              {selectedNode.type === 'fact' ? '事实' : 
               selectedNode.type === 'insight' ? '洞见' : '观念'}
            </h3>
            <p className="text-xs text-gray-300">{selectedNode.content}</p>
            {selectedNode.tensionLevel && selectedNode.tensionLevel > 0.7 && (
              <p className="text-xs text-yellow-400 mt-2">⚡ 高张力点</p>
            )}
          </Card>
        )}
      </div>

      {/* 右侧：对话区域 */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
        {/* 标题 */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">认知考古</h1>
          <p className="text-xs text-gray-400 mt-1">通过对话重构理解</p>
        </div>

        {/* 对话历史 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="上传的图片"
                    className="w-full rounded mb-2"
                  />
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400"
            >
              <Camera className="w-4 h-4 mr-1" />
              添加图片
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => {
                if (fileInputRef.current?.files?.[0]) {
                  const fileName = fileInputRef.current.files[0].name;
                  setHasFile(true);
                  // 显示文件名提示
                } else {
                  setHasFile(false);
                }
              }}
            />
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="描述一个具体的场景..."
              className="flex-1 bg-gray-800 border-gray-700 text-white resize-none"
              rows={3}
            />
            <button
              onClick={() => {
                console.log('Button clicked!');
                handleSend();
              }}
              disabled={!input.trim() && !hasFile}
              className="self-end inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* 提示信息 */}
          <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-400">
            <Info className="w-3 h-3 inline mr-1" />
            我只会提问，不会给建议。让我们一起探索事实背后的真相。
          </div>
        </div>
      </div>
    </div>
  );
}