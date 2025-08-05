'use client';

import React, { useState } from 'react';

export default function SimpleCognitiveChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    console.log('=== handleSend called ===');
    console.log('Input:', input);
    
    if (!input.trim()) {
      console.log('No input, returning');
      return;
    }

    setMessages(prev => [...prev, `你: ${input}`]);
    setLoading(true);

    try {
      console.log('Calling API...');
      const response = await fetch('http://localhost:3001/api/cognitive/archaeology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input,
          sessionId: null,
          history: []
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      setMessages(prev => [...prev, `AI: ${data.response}`]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, `错误: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">简化版认知考古对话</h1>
      
      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">开始对话...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-2">{msg}</div>
          ))
        )}
        {loading && <div className="text-blue-500">思考中...</div>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="输入您的想法..."
          className="flex-1 border rounded px-3 py-2"
          disabled={loading}
        />
        <button
          onClick={() => {
            console.log('Button clicked!');
            handleSend();
          }}
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>调试信息：</p>
        <p>输入长度: {input.length}</p>
        <p>加载中: {loading ? '是' : '否'}</p>
        <p>按钮禁用: {loading || !input.trim() ? '是' : '否'}</p>
      </div>
    </div>
  );
}