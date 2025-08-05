'use client';

import { useState } from 'react';

export default function TestButtonPage() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">按钮测试页面</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={() => {
              console.log('Test button clicked');
              setCount(count + 1);
              addLog('按钮被点击了');
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            点击我 (点击了 {count} 次)
          </button>
        </div>

        <div>
          <input 
            type="text" 
            placeholder="输入文字"
            className="border p-2 mr-2"
            id="testInput"
          />
          <button
            onClick={() => {
              const input = document.getElementById('testInput') as HTMLInputElement;
              addLog(`输入的内容: ${input.value}`);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            发送
          </button>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">日志：</h2>
          {log.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}