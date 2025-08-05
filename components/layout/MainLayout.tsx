'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface MainLayoutProps {
  chatPanel: React.ReactNode;
  visualizationPanel: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function MainLayout({ 
  chatPanel, 
  visualizationPanel, 
  sidebar 
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动设备 (可以用媒体查询或其他方式优化)
  const checkMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (isMobile) {
    // 移动端布局：垂直堆叠
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* 移动端顶部栏 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold">AI情感支持</h1>
          {sidebar && (
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost"
              size="icon"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* 移动端侧边栏覆盖层 */}
        {isSidebarOpen && sidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/80" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
              {sidebar}
            </div>
          </div>
        )}

        {/* 移动端主内容区域 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            {chatPanel}
          </div>
          <Separator />
          <div className="h-80">
            {visualizationPanel}
          </div>
        </div>
      </div>
    );
  }

  // 桌面端布局：水平分割
  return (
    <div className="flex h-screen bg-background">
      {/* 桌面端侧边栏 */}
      {sidebar && (
        <div className="w-64 border-r bg-card">
          {sidebar}
        </div>
      )}

      {/* 桌面端主内容区域 */}
      <div className="flex-1">
        <PanelGroup direction="horizontal" className="h-full">
          {/* 中央3D可视化面板 - 主要区域 */}
          <Panel defaultSize={75} minSize={60} maxSize={85}>
            <div className="h-full flex flex-col">
              {visualizationPanel}
            </div>
          </Panel>

          {/* 分割条 */}
          <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors" />

          {/* 右侧聊天面板 - 窄边栏 */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
            <div className="h-full flex flex-col">
              {chatPanel}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}