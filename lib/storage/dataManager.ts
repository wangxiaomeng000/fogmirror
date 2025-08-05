import { storage } from './index';
import { ChatSession, Message, LayerData } from '../../types';

export class DataManager {
  // 导出所有数据为JSON
  static exportAllData(): string {
    try {
      const data = {
        sessions: storage.getSessions(),
        currentSession: storage.getCurrentSession(),
        appState: storage.getAppState(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Export data failed:', error);
      throw new Error('导出数据失败');
    }
  }

  // 导入数据
  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!data.sessions || !Array.isArray(data.sessions)) {
        return { success: false, message: '无效的数据格式' };
      }

      // 验证会话数据
      const validSessions = data.sessions.filter((session: any) => 
        session.id && session.title && session.messages && Array.isArray(session.messages)
      );

      if (validSessions.length === 0) {
        return { success: false, message: '没有找到有效的会话数据' };
      }

      // 导入数据
      storage.saveSessions(validSessions);
      
      if (data.currentSession) {
        storage.saveCurrentSession(data.currentSession);
      }
      
      if (data.appState) {
        storage.saveAppState(data.appState);
      }

      return { 
        success: true, 
        message: `成功导入 ${validSessions.length} 个会话` 
      };
    } catch (error) {
      console.error('Import data failed:', error);
      return { success: false, message: '导入数据失败，请检查文件格式' };
    }
  }

  // 备份数据到文件
  static downloadBackup(): void {
    try {
      const data = this.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download backup failed:', error);
      throw new Error('下载备份失败');
    }
  }

  // 从文件导入数据
  static importFromFile(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false, message: '没有选择文件' });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const result = this.importData(content);
            resolve(result);
          } catch (error) {
            resolve({ success: false, message: '文件读取失败' });
          }
        };
        
        reader.onerror = () => {
          resolve({ success: false, message: '文件读取失败' });
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  // 清理过期数据
  static cleanupExpiredData(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
    try {
      const sessions = storage.getSessions();
      const cutoffTime = Date.now() - maxAge;
      
      const validSessions = sessions.filter(session => 
        session.updatedAt > cutoffTime
      );
      
      const deletedCount = sessions.length - validSessions.length;
      
      if (deletedCount > 0) {
        storage.saveSessions(validSessions);
        
        const currentSession = storage.getCurrentSession();
        if (currentSession && currentSession.updatedAt <= cutoffTime) {
          storage.saveCurrentSession(null);
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Cleanup expired data failed:', error);
      return 0;
    }
  }

  // 获取存储统计信息
  static getStorageStats(): {
    totalSessions: number;
    totalMessages: number;
    totalSize: number;
    oldestSession: number | null;
    newestSession: number | null;
  } {
    try {
      const sessions = storage.getSessions();
      const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
      
      // 估算存储大小
      const dataString = JSON.stringify(sessions);
      const totalSize = new Blob([dataString]).size;
      
      const timestamps = sessions.map(s => s.updatedAt);
      const oldestSession = timestamps.length > 0 ? Math.min(...timestamps) : null;
      const newestSession = timestamps.length > 0 ? Math.max(...timestamps) : null;
      
      return {
        totalSessions: sessions.length,
        totalMessages,
        totalSize,
        oldestSession,
        newestSession
      };
    } catch (error) {
      console.error('Get storage stats failed:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        totalSize: 0,
        oldestSession: null,
        newestSession: null
      };
    }
  }
}

export default DataManager;