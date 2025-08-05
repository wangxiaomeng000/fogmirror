import { AnalysisResult } from '../../types';

export interface AIServiceConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  [key: string]: any;
}

export interface AIServiceInterface {
  name: string;
  
  analyzeMessage(
    content: string, 
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }>;
  
  analyzeImageForAbnormalities(
    imageBase64: string
  ): Promise<string[]>;
  
  generateDynamicModelParameters(
    messages: any[]
  ): Promise<{
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  }>;
}

export abstract class BaseAIService implements AIServiceInterface {
  abstract name: string;
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  abstract analyzeMessage(
    content: string, 
    imageBase64?: string,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    analysis: AnalysisResult;
  }>;
  
  abstract analyzeImageForAbnormalities(
    imageBase64: string
  ): Promise<string[]>;
  
  abstract generateDynamicModelParameters(
    messages: any[]
  ): Promise<{
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  }>;
}