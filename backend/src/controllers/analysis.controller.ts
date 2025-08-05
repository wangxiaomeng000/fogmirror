import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Session from '../models/Session';
import DynamicModel from '../models/DynamicModel';
import analysisEngine from '../services/analysisEngine';
import modelGenerator from '../services/modelGenerator';

export const analyzeConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    // 分析整个对话
    const metrics = analysisEngine.calculateConversationMetrics(session.messages);
    const patterns = analysisEngine.identifyPatterns(session.messages);
    
    // 生成新的动态模型
    const dynamicModel = await modelGenerator.generateDynamicModel(session.messages);
    
    // 保存动态模型
    await DynamicModel.create({
      sessionId: session._id,
      modelType: dynamicModel.type,
      parameters: dynamicModel.parameters,
      visualData: dynamicModel
    });

    res.json({
      success: true,
      analysis: {
        metrics,
        patterns,
        dynamicModel
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLayerData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { sessionId } = req.params;
    const { layerType } = req.query;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    let layerData = session.layerData;
    
    // 根据层级类型过滤
    if (layerType && ['facts', 'insights', 'concepts'].includes(layerType as string)) {
      layerData = layerData.filter(layer => layer.type === layerType);
    }

    res.json({
      success: true,
      layerData,
      total: layerData.length
    });
  } catch (error) {
    next(error);
  }
};

export const getDynamicModel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { sessionId } = req.params;
    
    const model = await DynamicModel.findOne({ sessionId })
      .sort('-createdAt');
    
    if (!model) {
      return res.status(404).json({
        success: false,
        error: '模型不存在'
      });
    }

    res.json({
      success: true,
      model: {
        id: model._id,
        sessionId: model.sessionId,
        modelType: model.modelType,
        parameters: model.parameters,
        visualData: model.visualData,
        createdAt: model.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDynamicModel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { sessionId } = req.params;
    const { parameters } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    // 基于新参数重新生成模型
    const dynamicModel = await modelGenerator.generateDynamicModel(session.messages);
    
    // 合并用户提供的参数
    if (parameters) {
      Object.assign(dynamicModel.parameters, parameters);
    }

    // 创建新的模型记录
    const newModel = await DynamicModel.create({
      sessionId: session._id,
      modelType: dynamicModel.type,
      parameters: dynamicModel.parameters,
      visualData: dynamicModel
    });

    res.json({
      success: true,
      model: {
        id: newModel._id,
        sessionId: newModel.sessionId,
        modelType: newModel.modelType,
        parameters: newModel.parameters,
        visualData: newModel.visualData,
        createdAt: newModel.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};