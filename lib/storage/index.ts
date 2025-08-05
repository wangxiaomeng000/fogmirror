import { ChatSession, AppState } from '../../types';

const STORAGE_KEYS = {
  SESSIONS: 'ai_chat_sessions',
  CURRENT_SESSION: 'ai_chat_current_session',
  APP_STATE: 'ai_chat_app_state'
} as const;

class StorageManager {
  // 保存聊天会话
  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  // 获取聊天会话
  getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  // 保存当前会话
  saveCurrentSession(session: ChatSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    } catch (error) {
      console.error('Failed to save current session:', error);
    }
  }

  // 获取当前会话
  getCurrentSession(): ChatSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load current session:', error);
      return null;
    }
  }

  // 保存应用状态
  saveAppState(state: Partial<AppState>): void {
    try {
      const currentState = this.getAppState();
      const newState = { ...currentState, ...state };
      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }

  // 获取应用状态
  getAppState(): Partial<AppState> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load app state:', error);
      return {};
    }
  }

  // 清除所有数据
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // 导出数据
  exportData(): string {
    return JSON.stringify({
      sessions: this.getSessions(),
      currentSession: this.getCurrentSession(),
      appState: this.getAppState(),
      exportedAt: Date.now()
    });
  }

  // 导入数据
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.sessions) {
        this.saveSessions(parsed.sessions);
      }
      
      if (parsed.currentSession) {
        this.saveCurrentSession(parsed.currentSession);
      }
      
      if (parsed.appState) {
        this.saveAppState(parsed.appState);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storage = new StorageManager();
export default storage;