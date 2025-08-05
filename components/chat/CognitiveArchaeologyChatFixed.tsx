'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Camera, Info } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils';
import CognitiveMap from '../3d-visualization/CognitiveMap';

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

export default function CognitiveArchaeologyChatFixed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [cognitiveNodes, setCognitiveNodes] = useState<CognitiveNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
    console.log('=== handleSend 被调用 ===');
    console.log('输入内容:', input);
    console.log('有文件:', hasFile);
    console.log('输入是否为空:', !input.trim());
    
    if (!input.trim() && !hasFile) {
      console.log('没有输入内容或文件，返回');
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
      console.log('处理图片上传...');
      const file = fileInputRef.current.files[0];
      const base64WithPrefix = await fileToBase64(file);
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
      console.log('开始调用API...');
      const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage.content,
          image: userMessage.image,
          sessionId: sessionId,
          history: messages
        })
      });
      
      console.log('API响应状态:', response.status);

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('API响应数据:', data);
      
      // 更新sessionId
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        console.log('设置sessionId:', data.sessionId);
      }
      
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
    } catch (error: any) {
      console.error('API调用错误:', error);
      
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
    setInput(`关于"${node.content.substring(0, 30)}..."，`);
  };

  // 处理Enter键发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Enter键被按下');
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* 左侧：认知地图 */}
      <div className="flex-1 relative">
        <CognitiveMap nodes={cognitiveNodes} onNodeClick={handleNodeClick} />
        
        {/* 节点详情 */}
        {selectedNode && (
          <div className="absolute top-4 right-4 p-4 bg-gray-900 bg-opacity-90 max-w-sm rounded-lg">
            <h3 className="text-sm font-bold text-white mb-2">
              {selectedNode.type === 'fact' ? '事实' : 
               selectedNode.type === 'insight' ? '洞见' : '观念'}
            </h3>
            <p className="text-xs text-gray-300">{selectedNode.content}</p>
            {selectedNode.tensionLevel && selectedNode.tensionLevel > 0.7 && (
              <p className="text-xs text-yellow-400 mt-2">⚡ 高张力点</p>
            )}
          </div>
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
                    src={`data:image/jpeg;base64,${message.image}`}
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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '100ms'}} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-gray-300 px-3 py-1 border border-gray-700 rounded flex items-center gap-1"
            >
              <Camera className="w-4 h-4" />
              添加图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const hasNewFile = !!(e.target.files && e.target.files[0]);
                setHasFile(hasNewFile);
                console.log('文件选择变化，有文件:', hasNewFile);
              }}
            />
          </div>
          
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                console.log('输入变化:', e.target.value);
              }}
              onKeyPress={handleKeyPress}
              placeholder="描述一个具体的场景..."
              className="flex-1 bg-gray-800 border-gray-700 text-white resize-none rounded px-3 py-2"
              rows={3}
            />
            <button
              onClick={() => {
                console.log('发送按钮被点击！');
                handleSend();
              }}
              disabled={!input.trim() && !hasFile}
              className={`px-4 py-2 rounded font-medium transition-all ${
                (!input.trim() && !hasFile)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
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

          {/* 调试信息 */}
          <div className="mt-2 text-xs text-gray-500">
            <div>输入长度: {input.length}</div>
            <div>有文件: {hasFile ? '是' : '否'}</div>
            <div>按钮状态: {(!input.trim() && !hasFile) ? '禁用' : '启用'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}