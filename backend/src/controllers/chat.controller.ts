import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Session from '../models/Session';
import { aiServiceFactory } from '../services/ai/aiServiceFactory';
import analysisEngine from '../services/analysisEngine';
import modelGenerator from '../services/modelGenerator';
import { v4 as uuidv4 } from 'uuid';
import { cognitiveMapService } from '../services/cognitiveMapService';

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, sessionId, image } = req.body;
    const imageFile = req.file;
    
    let imageBase64: string | undefined;
    if (imageFile) {
      imageBase64 = imageFile.buffer.toString('base64');
    } else if (image) {
      imageBase64 = image;
    }

    // 查找或创建会话
    const session = sessionId ? 
      await Session.findById(sessionId) : 
      await Session.create({
        userId: req.user?._id,
        title: (content || '新对话').substring(0, 50) + '...',
        messages: [],
        layerData: []
      });

    if (!session) {
      res.status(404).json({
        success: false,
        error: '会话不存在'
      });
      return;
    }

    // 创建用户消息
    const userMessage = {
      id: uuidv4(),
      content,
      role: 'user' as const,
      timestamp: Date.now(),
      image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined
    };

    // 添加用户消息到会话
    session.messages.push(userMessage);

    // 分析消息并生成响应
    const aiService = aiServiceFactory.getCurrentService();
    console.log(`\n使用的AI服务: ${aiService.name}\n`);
    const { response, analysis } = await aiService.analyzeMessage(
      content, 
      imageBase64,
      session.messages
    );
    
    // 生成层级数据
    const layerData = analysisEngine.generateLayerData(analysis, userMessage.id);
    
    // 创建AI响应消息
    const aiMessage = {
      id: uuidv4(),
      content: response,
      role: 'ai' as const,
      timestamp: Date.now(),
      analysis
    };

    // 添加AI消息到会话
    session.messages.push(aiMessage);
    
    // 更新层级数据
    session.layerData.push(...layerData);

    // 更新认知地图
    const cognitiveMapData = cognitiveMapService.analyzeAndUpdate(
      session._id?.toString() || sessionId,
      userMessage.content,
      analysis
    );

    // 生成动态3D模型
    const dynamicModel = await modelGenerator.generateDynamicModel(session.messages);

    // 保存会话
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      userMessage,
      aiMessage,
      layerData,
      dynamicModel,
      cognitiveMap: cognitiveMapData,
      // 调试信息
      debug: {
        aiServiceName: aiService.name,
        hasImage: !!imageBase64
      }
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageFile = req.file;
    
    if (!imageFile) {
      res.status(400).json({
        success: false,
        error: '请上传图片'
      });
      return;
    }

    const imageBase64 = imageFile.buffer.toString('base64');
    const aiService = aiServiceFactory.getCurrentService();
    const abnormalities = await aiService.analyzeImageForAbnormalities(imageBase64);

    res.json({
      success: true,
      abnormalities
    });
  } catch (error) {
    next(error);
  }
};