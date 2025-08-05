import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message, AppState, LayerType } from '../types';
import { storage } from '../lib/storage';
import { DataManager } from '../lib/storage/dataManager';
import { generateId } from '../lib/utils';

export function useChat() {
  const [state, setState] = useState<AppState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    error: null,
    selectedLayer: null
  });

  // 初始化时从localStorage加载数据
  useEffect(() => {
    const sessions = storage.getSessions();
    const currentSession = storage.getCurrentSession();
    const appState = storage.getAppState();
    
    setState(prev => ({
      ...prev,
      sessions,
      currentSession,
      ...appState
    }));
  }, []);

  // 创建新会话
  const createNewSession = useCallback((title?: string) => {
    const newSession: ChatSession = {
      id: generateId(),
      title: title || `Chat ${Date.now()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      layerData: []
    };

    setState(prev => {
      const newSessions = [...prev.sessions, newSession];
      storage.saveSessions(newSessions);
      storage.saveCurrentSession(newSession);
      
      return {
        ...prev,
        sessions: newSessions,
        currentSession: newSession
      };
    });

    return newSession;
  }, []);

  // 选择会话
  const selectSession = useCallback((sessionId: string) => {
    setState(prev => {
      const session = prev.sessions.find(s => s.id === sessionId);
      if (session) {
        storage.saveCurrentSession(session);
        return {
          ...prev,
          currentSession: session
        };
      }
      return prev;
    });
  }, []);

  // 添加消息
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now()
      };

      const updatedSession = {
        ...prev.currentSession,
        messages: [...prev.currentSession.messages, newMessage],
        updatedAt: Date.now()
      };

      const updatedSessions = prev.sessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      );

      storage.saveSessions(updatedSessions);
      storage.saveCurrentSession(updatedSession);

      return {
        ...prev,
        currentSession: updatedSession,
        sessions: updatedSessions
      };
    });
  }, []);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    setState(prev => {
      const updatedSessions = prev.sessions.filter(s => s.id !== sessionId);
      let newCurrentSession = prev.currentSession;
      
      if (prev.currentSession?.id === sessionId) {
        newCurrentSession = updatedSessions[0] || null;
      }

      storage.saveSessions(updatedSessions);
      storage.saveCurrentSession(newCurrentSession);

      return {
        ...prev,
        sessions: updatedSessions,
        currentSession: newCurrentSession
      };
    });
  }, []);

  // 设置加载状态
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  // 设置错误
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error
    }));
  }, []);

  // 选择层级
  const selectLayer = useCallback((layer: LayerType | null) => {
    setState(prev => ({
      ...prev,
      selectedLayer: layer
    }));
  }, []);

  // 清除所有数据
  const clearAllData = useCallback(() => {
    storage.clearAll();
    setState({
      currentSession: null,
      sessions: [],
      isLoading: false,
      error: null,
      selectedLayer: null
    });
  }, []);

  // 导出数据
  const exportData = useCallback(() => {
    try {
      return DataManager.exportAllData();
    } catch (error) {
      setError('导出数据失败');
      return null;
    }
  }, []);

  // 导入数据
  const importData = useCallback((jsonData: string) => {
    try {
      const result = DataManager.importData(jsonData);
      if (result.success) {
        // 重新加载数据
        const sessions = storage.getSessions();
        const currentSession = storage.getCurrentSession();
        const appState = storage.getAppState();
        
        setState(prev => ({
          ...prev,
          sessions,
          currentSession,
          ...appState
        }));
      }
      return result;
    } catch (error) {
      setError('导入数据失败');
      return { success: false, message: '导入失败' };
    }
  }, []);

  // 下载备份
  const downloadBackup = useCallback(() => {
    try {
      DataManager.downloadBackup();
    } catch (error) {
      setError('下载备份失败');
    }
  }, []);

  // 从文件导入
  const importFromFile = useCallback(async () => {
    try {
      const result = await DataManager.importFromFile();
      if (result.success) {
        // 重新加载数据
        const sessions = storage.getSessions();
        const currentSession = storage.getCurrentSession();
        const appState = storage.getAppState();
        
        setState(prev => ({
          ...prev,
          sessions,
          currentSession,
          ...appState
        }));
      }
      return result;
    } catch (error) {
      setError('导入文件失败');
      return { success: false, message: '导入失败' };
    }
  }, []);

  // 清理过期数据
  const cleanupExpiredData = useCallback((maxAge?: number) => {
    try {
      const deletedCount = DataManager.cleanupExpiredData(maxAge);
      if (deletedCount > 0) {
        // 重新加载数据
        const sessions = storage.getSessions();
        const currentSession = storage.getCurrentSession();
        
        setState(prev => ({
          ...prev,
          sessions,
          currentSession
        }));
      }
      return deletedCount;
    } catch (error) {
      setError('清理数据失败');
      return 0;
    }
  }, []);

  // 获取存储统计
  const getStorageStats = useCallback(() => {
    return DataManager.getStorageStats();
  }, []);

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
    clearAllData,
    
    // 数据管理
    exportData,
    importData,
    downloadBackup,
    importFromFile,
    cleanupExpiredData,
    getStorageStats
  };
}