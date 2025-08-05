import { Message, AnalysisResult } from '../../types';
import apiClient from '../api/client';

class RealAiService {
  async processMessage(
    content: string, 
    sessionId?: string,
    image?: File
  ): Promise<{
    response: string;
    analysis: AnalysisResult | null;
    sessionId: string;
    layerData: any[];
    dynamicModel: any;
  }> {
    try {
      const result = await apiClient.sendMessage(content, sessionId, image);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process message');
      }

      return {
        response: result.aiMessage.content,
        analysis: result.aiMessage.analysis,
        sessionId: result.sessionId,
        layerData: result.layerData,
        dynamicModel: result.dynamicModel
      };
    } catch (error) {
      console.error('AI service error:', error);
      throw error;
    }
  }

  async analyzeImage(image: File): Promise<string[]> {
    try {
      const result = await apiClient.analyzeImage(image);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze image');
      }

      return result.abnormalities;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  async analyzeConversation(sessionId: string): Promise<{
    metrics: any;
    patterns: string[];
    dynamicModel: any;
  }> {
    try {
      const result = await apiClient.analyzeConversation(sessionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze conversation');
      }

      return result.analysis;
    } catch (error) {
      console.error('Conversation analysis error:', error);
      throw error;
    }
  }

  async getLayerData(sessionId: string, layerType?: string): Promise<any[]> {
    try {
      const result = await apiClient.getLayerData(sessionId, layerType);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get layer data');
      }

      return result.layerData;
    } catch (error) {
      console.error('Layer data error:', error);
      throw error;
    }
  }

  async getDynamicModel(sessionId: string): Promise<any> {
    try {
      const result = await apiClient.getDynamicModel(sessionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get dynamic model');
      }

      return result.model;
    } catch (error) {
      console.error('Dynamic model error:', error);
      throw error;
    }
  }
}

export const realAiService = new RealAiService();
export default realAiService;