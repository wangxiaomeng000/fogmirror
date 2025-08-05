'use client';

import { useState } from 'react';
import { Plus, MessageSquare, MoreVertical, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChatSession } from '../../types';
import { formatTimestamp } from '../../lib/utils';

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportData?: () => void;
  onImportData?: () => void;
}

export default function Sidebar({ 
  sessions, 
  currentSession, 
  onNewSession, 
  onSelectSession, 
  onDeleteSession,
  onExportData,
  onImportData
}: SidebarProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI情感支持</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onExportData && (
                <DropdownMenuItem onClick={onExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  导出数据
                </DropdownMenuItem>
              )}
              {onImportData && (
                <DropdownMenuItem onClick={onImportData}>
                  <Upload className="h-4 w-4 mr-2" />
                  导入数据
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button 
          onClick={onNewSession} 
          className="w-full" 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          新建对话
        </Button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">还没有对话</p>
                <p className="text-xs mt-1">点击"新建对话"开始</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors
                    ${session.id === currentSession?.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                    }
                  `}
                  onClick={() => onSelectSession(session.id)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{session.messages.length} 条消息</span>
                        <span>{formatTimestamp(session.updatedAt)}</span>
                      </div>
                    </div>
                    
                    {(hoveredSession === session.id || session.id === currentSession?.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除对话
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {/* 最近消息预览 */}
                  {session.messages.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      {session.messages[session.messages.length - 1].content.substring(0, 50)}
                      {session.messages[session.messages.length - 1].content.length > 50 && '...'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>AI情感支持系统</p>
          <p className="mt-1">帮助您走出情感困境</p>
        </div>
      </div>
    </div>
  );
}