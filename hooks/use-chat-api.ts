import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message, AppState, LayerType } from '../types';
import apiClient from '../lib/api/client';
import { generateId } from '../lib/utils';

export function useChatApi() {
  const [state, setState] = useState<AppState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    error: null,
    selectedLayer: null
  });

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    try {
      const result = await apiClient.getSessions();
      if (result.success) {
        setState(prev => ({
          ...prev,
          sessions: result.sessions.map((s: any) => ({
            id: s.id,
            title: s.title,
            messages: [],
            createdAt: new Date(s.createdAt).getTime(),
            updatedAt: new Date(s.updatedAt).getTime(),
            layerData: []
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  // 初始化时加载会话
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 创建新会话
  const createNewSession = useCallback(async (title?: string) => {
    try {
      const result = await apiClient.createSession(title);
      if (result.success) {
        const newSession: ChatSession = {
          id: result.session.id,
          title: result.session.title,
          messages: result.session.messages || [],
          createdAt: new Date(result.session.createdAt).getTime(),
          updatedAt: new Date(result.session.updatedAt).getTime(),
          layerData: result.session.layerData || []
        };

        setState(prev => ({
          ...prev,
          sessions: [...prev.sessions, newSession],
          currentSession: newSession
        }));

        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      setState(prev => ({ ...prev, error: '创建会话失败' }));
    }
    return null;
  }, []);

  // 选择会话
  const selectSession = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await apiClient.getSession(sessionId);
      
      if (result.success) {
        const session: ChatSession = {
          id: result.session.id,
          title: result.session.title,
          messages: result.session.messages || [],
          createdAt: new Date(result.session.createdAt).getTime(),
          updatedAt: new Date(result.session.updatedAt).getTime(),
          layerData: result.session.layerData || []
        };

        setState(prev => ({
          ...prev,
          currentSession: session,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setState(prev => ({ 
        ...prev, 
        error: '加载会话失败',
        isLoading: false 
      }));
    }
  }, []);

  // 添加消息（通过API发送）
  const addMessage = useCallback(async (
    content: string,
    image?: File
  ) => {
    if (!state.currentSession && !(await createNewSession())) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 创建临时用户消息显示
      const tempUserMessage: Message = {
        id: generateId(),
        content,
        role: 'user',
        timestamp: Date.now()
      };

      setState(prev => {
        if (!prev.currentSession) return prev;
        
        return {
          ...prev,
          currentSession: {
            ...prev.currentSession,
            messages: [...prev.currentSession.messages, tempUserMessage]
          }
        };
      });

      // 发送到API
      const result = await apiClient.sendMessage(
        content,
        state.currentSession?.id,
        image
      );

      if (result.success) {
        setState(prev => {
          if (!prev.currentSession) return prev;

          // 更新消息列表，移除临时消息并添加真实消息
          const messages = prev.currentSession.messages.filter(
            m => m.id !== tempUserMessage.id
          );
          
          messages.push(result.userMessage);
          messages.push(result.aiMessage);

          // 更新层级数据
          const layerData = [
            ...prev.currentSession.layerData,
            ...result.layerData
          ];

          const updatedSession: ChatSession = {
            ...prev.currentSession,
            messages,
            layerData,
            updatedAt: Date.now()
          };

          return {
            ...prev,
            currentSession: updatedSession,
            sessions: prev.sessions.map(s => 
              s.id === updatedSession.id ? updatedSession : s
            ),
            isLoading: false
          };
        });

        // 如果是新会话，更新会话ID
        if (!state.currentSession?.id && result.sessionId) {
          setState(prev => ({
            ...prev,
            currentSession: prev.currentSession ? {
              ...prev.currentSession,
              id: result.sessionId
            } : null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({ 
        ...prev, 
        error: '发送消息失败',
        isLoading: false 
      }));
    }
  }, [state.currentSession, createNewSession]);

  // 删除会话
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const result = await apiClient.deleteSession(sessionId);
      if (result.success) {
        setState(prev => {
          const updatedSessions = prev.sessions.filter(s => s.id !== sessionId);
          let newCurrentSession = prev.currentSession;
          
          if (prev.currentSession?.id === sessionId) {
            newCurrentSession = null;
          }

          return {
            ...prev,
            sessions: updatedSessions,
            currentSession: newCurrentSession
          };
        });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setState(prev => ({ ...prev, error: '删除会话失败' }));
    }
  }, []);

  // 设置加载状态
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // 设置错误
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // 选择层级
  const selectLayer = useCallback((layer: LayerType | null) => {
    setState(prev => ({ ...prev, selectedLayer: layer }));
  }, []);

  // 导出备份
  const downloadBackup = useCallback(async () => {
    try {
      const blob = await apiClient.exportSessions();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-emotional-support-backup-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      setState(prev => ({ ...prev, error: '导出失败' }));
    }
  }, []);

  // 从文件导入
  const importFromFile = useCallback(async () => {
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const result = await apiClient.importSessions(file);
            if (result.success) {
              await loadSessions();
              resolve({ success: true, message: result.message });
            } else {
              resolve({ success: false, message: result.error || '导入失败' });
            }
          } catch (error) {
            resolve({ success: false, message: '导入失败' });
          }
        }
      };
      
      input.click();
    });
  }, [loadSessions]);

  return {
    // 状态
    ...state,
    
    // 方法
    createNewSession,
    selectSession,
    addMessage,
    deleteSession,
    setLoading,
    setError,
    selectLayer,
    downloadBackup,
    importFromFile,
    loadSessions
  };
}