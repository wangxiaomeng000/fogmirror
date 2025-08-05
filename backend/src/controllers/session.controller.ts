import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Session from '../models/Session';
import DynamicModel from '../models/DynamicModel';

export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title } = req.body;
    
    const session = await Session.create({
      userId: req.user?._id,
      title: title || '新对话',
      messages: [],
      layerData: []
    });

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        messages: session.messages,
        layerData: session.layerData,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.user ? { userId: req.user._id } : { userId: null };
    const sessions = await Session.find(query)
      .select('title createdAt updatedAt')
      .sort('-updatedAt');

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s._id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    // 获取动态模型
    const dynamicModel = await DynamicModel.findOne({ sessionId: id })
      .sort('-createdAt');

    res.json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        messages: session.messages,
        layerData: session.layerData,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      },
      dynamicModel
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const session = await Session.findByIdAndUpdate(
      id,
      { title, updatedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    res.json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const session = await Session.findByIdAndDelete(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    // 删除相关的动态模型
    await DynamicModel.deleteMany({ sessionId: id });

    res.json({
      success: true,
      message: '会话已删除'
    });
  } catch (error) {
    next(error);
  }
};

export const exportSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.user ? { userId: req.user._id } : { userId: null };
    const sessions = await Session.find(query);
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      sessions: sessions.map(s => ({
        title: s.title,
        messages: s.messages,
        layerData: s.layerData,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=ai-emotional-support-export.json');
    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

export const importSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: '请上传文件'
      });
    }

    const data = JSON.parse(file.buffer.toString());
    
    if (!data.sessions || !Array.isArray(data.sessions)) {
      return res.status(400).json({
        success: false,
        error: '无效的导入文件格式'
      });
    }

    const importedSessions = [];
    for (const sessionData of data.sessions) {
      const session = await Session.create({
        userId: req.user?._id,
        title: sessionData.title,
        messages: sessionData.messages,
        layerData: sessionData.layerData || []
      });
      importedSessions.push(session._id);
    }

    res.json({
      success: true,
      message: `成功导入 ${importedSessions.length} 个会话`,
      sessionIds: importedSessions
    });
  } catch (error) {
    next(error);
  }
};