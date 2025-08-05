import { AIServiceInterface } from './aiInterface';
import { OpenRouterService } from './openRouterService';
import { GeminiService } from './geminiService';
import { SiliconFlowService } from './siliconflowService';
import { FreeVisionService } from './freeVisionService';
import { RealVisionService } from './realVisionService';
import { OpenAIVisionService } from './openaiVisionService';
import { HuggingFaceVisionService } from './huggingfaceVisionService';
import { RealImageService } from './realImageService';
import { DeepSeekVisionService } from './deepseekVisionService';
import { CognitiveArchaeologyService } from './cognitiveArchaeologyService';
import { LocalVisionService } from './localVisionService';
import { DemoVisionService } from './demoVisionService';
import { MockVisionService } from './mockVisionService';

export type AIServiceType = 'openai' | 'openai-vision' | 'openrouter' | 'qianwen' | 'wenxin' | 'gemini' | 'siliconflow' | 'freevision' | 'real-vision' | 'huggingface' | 'real-image' | 'deepseek-vision' | 'cognitive-archaeology' | 'local-vision' | 'demo-vision' | 'mock-vision';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<string, AIServiceInterface> = new Map();

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  getService(type: AIServiceType = 'openrouter'): AIServiceInterface {
    // 开发阶段：暂时禁用缓存以确保使用正确的服务
    // if (this.services.has(type)) {
    //   return this.services.get(type)!;
    // }

    // 根据类型创建服务
    let service: AIServiceInterface;
    console.log(`\n创建AI服务: ${type}\n`);

    switch (type) {
      case 'openai':
      case 'openai-vision':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not found');
        }
        service = new OpenAIVisionService({
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        });
        break;

      case 'openrouter':
        if (!process.env.OPENROUTER_API_KEY) {
          throw new Error('OpenRouter API key not found');
        }
        service = new OpenRouterService({
          apiKey: process.env.OPENROUTER_API_KEY,
          model: process.env.OPENROUTER_MODEL || 'openai/chatgpt-4o-latest'
        });
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key not found');
        }
        service = new GeminiService({
          apiKey: process.env.GEMINI_API_KEY
        });
        break;
        
      case 'qianwen':
        throw new Error('Qianwen service not implemented yet');
        
      case 'wenxin':
        throw new Error('Wenxin service not implemented yet');
        
      case 'siliconflow':
        if (!process.env.SILICONFLOW_API_KEY) {
          throw new Error('SiliconFlow API key not found');
        }
        service = new SiliconFlowService({
          apiKey: process.env.SILICONFLOW_API_KEY,
          model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V2.5'
        });
        break;
        
      case 'freevision':
        service = new FreeVisionService({});
        break;
        
      case 'real-vision':
        if (!process.env.OPENROUTER_API_KEY) {
          throw new Error('OpenRouter API key not found for real vision service');
        }
        service = new RealVisionService({
          apiKey: process.env.OPENROUTER_API_KEY
        });
        break;
        
      case 'huggingface':
        service = new HuggingFaceVisionService({
          apiKey: process.env.HUGGINGFACE_API_KEY
        });
        break;
        
      case 'real-image':
        service = new RealImageService({});
        break;
        
      case 'deepseek-vision':
        service = new DeepSeekVisionService({});
        break;
        
      case 'cognitive-archaeology':
        // 使用配置的底层AI服务
        const baseServiceType = process.env.COGNITIVE_BASE_SERVICE || 'openrouter';
        service = new CognitiveArchaeologyService({
          baseService: baseServiceType
        });
        break;
        
      case 'local-vision':
        service = new LocalVisionService();
        break;
        
      case 'demo-vision':
        service = new DemoVisionService();
        break;
        
      case 'mock-vision':
        service = new MockVisionService();
        break;
        
      default:
        throw new Error(`Unknown AI service type: ${type}`);
    }

    this.services.set(type, service);
    console.log(`✅ 成功创建并缓存服务: ${type}`);
    return service;
  }

  // 获取当前配置的AI服务
  getCurrentService(): AIServiceInterface {
    console.log('\n========== 获取当前AI服务 ==========');
    console.log('环境变量 AI_SERVICE_TYPE:', process.env.AI_SERVICE_TYPE);
    console.log('环境变量 OPENROUTER_API_KEY 存在?', !!process.env.OPENROUTER_API_KEY);
    console.log('环境变量 GEMINI_API_KEY 存在?', !!process.env.GEMINI_API_KEY);
    
    const serviceType = (process.env.AI_SERVICE_TYPE as AIServiceType) || 'openrouter';
    console.log('最终决定的服务类型:', serviceType);
    console.log('当前缓存的服务:', Array.from(this.services.keys()));
    
    // 检查是否需要切换服务（开发时清除缓存）
    const currentService = this.services.get(serviceType);
    if (currentService && currentService.name !== serviceType) {
      console.log(`服务类型已改变，清除缓存: ${currentService.name} -> ${serviceType}`);
      this.services.clear();
    }
    
    const service = this.getService(serviceType);
    console.log('返回的服务名称:', service.name);
    console.log('========== 结束获取AI服务 ==========\n');
    
    return service;
  }
}

export const aiServiceFactory = AIServiceFactory.getInstance();