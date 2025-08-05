'use client';

interface ChatPanelProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export default function ChatPanel({ children, title, actions }: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* 头部 */}
      {(title || actions) && (
        <div className="flex items-center justify-between p-4 border-b bg-card">
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}