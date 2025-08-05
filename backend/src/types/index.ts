export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: number;
  image?: string;
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  facts: string[];
  insights: string[];
  concepts: string[];
  emotionalTone: EmotionalTone;
  suggestions: string[];
  layerData?: LayerData[];
  sceneDetails?: any;
}

export interface EmotionalTone {
  primary: string;
  intensity: number;
  confidence: number;
}

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

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  layerData: LayerData[];
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface DynamicModel {
  sessionId: string;
  modelType: 'organism' | 'ecosystem' | 'network';
  parameters: {
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  };
  visualData: any;
}