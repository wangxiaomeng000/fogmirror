'use client';

import { Info } from 'lucide-react';

interface FactualPromptsProps {
  onSelectPrompt?: (prompt: string) => void;
}

export default function FactualPrompts({ onSelectPrompt }: FactualPromptsProps) {
  const prompts = [
    {
      category: '时间相关',
      examples: [
        '昨天下午3点，在公司会议室...',
        '上周五早上，我和同事讨论项目时...',
        '持续了两个小时的谈话中...'
      ]
    },
    {
      category: '人物相关',
      examples: [
        '我的直属上司李经理说...',
        '团队中的三位同事都表示...',
        '客户张总在邮件中明确提到...'
      ]
    },
    {
      category: '具体行为',
      examples: [
        '他直接说："这个方案不行"',
        '我看到邮件中写着...',
        '会议记录显示...'
      ]
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-2">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">如何描述事实？</h4>
          <p className="text-sm text-blue-800 mb-3">
            请提供具体的时间、地点、人物和可观察的行为，避免主观判断。
          </p>
          
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <div key={index}>
                <p className="text-xs font-medium text-blue-700 mb-1">{prompt.category}：</p>
                <div className="flex flex-wrap gap-2">
                  {prompt.examples.map((example, exIndex) => (
                    <button
                      key={exIndex}
                      onClick={() => onSelectPrompt?.(example)}
                      className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>避免：</strong>"我觉得"、"他肯定认为"、"总是"、"从不"等主观词汇
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}