// 消息类型
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: number;
  image?: string; // base64 encoded image or URL
  analysis?: AnalysisResult;
}

// AI分析结果
export interface AnalysisResult {
  facts: string[]; // 事实层信息
  insights: string[]; // 洞见层信息
  concepts: string[]; // 观念层信息
  emotionalTone: EmotionalTone;
  suggestions: string[];
}

// 情感基调
export interface EmotionalTone {
  primary: string; // 主要情感
  intensity: number; // 强度 0-1
  confidence: number; // 置信度 0-1
}

// 3D层级数据
export interface LayerData {
  id: string;
  type: LayerType;
  content: string;
  position: [number, number, number];
  color: string;
  intensity: number;
  relatedMessageId: string;
}

export type LayerType = 'facts' | 'insights' | 'concepts';

// 聊天会话
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  layerData: LayerData[];
}

// 应用状态
export interface AppState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  selectedLayer: LayerType | null;
}

// 文件上传
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64
  uploadedAt: number;
}

// Mock AI 响应配置
export interface AIResponseConfig {
  delay: number; // 模拟响应延迟
  emotionalAnalysisEnabled: boolean;
  layerAnalysisEnabled: boolean;
}