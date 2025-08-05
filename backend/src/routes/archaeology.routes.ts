import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiServiceFactory } from '../services/ai/aiServiceFactory';
import { cognitiveMapService } from '../services/cognitiveMapService';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session';

const router = Router();

// 认知考古对话处理
router.post('/archaeology', async (req: AuthRequest, res) => {
  try {
    const { content, image, sessionId, history } = req.body;
    
    // 调试日志
    console.log('收到认知考古请求:');
    console.log('- content:', content);
    console.log('- image长度:', image ? image.length : 0);
    console.log('- image前50字符:', image ? image.substring(0, 50) : 'null');
    console.log('- sessionId:', sessionId);
    console.log('- history长度:', history ? history.length : 0);
    
    // 获取或创建会话
    let session = sessionId ? 
      await Session.findById(sessionId) : 
      await Session.create({
        userId: req.user?._id,
        title: '认知考古 - ' + new Date().toLocaleDateString(),
        messages: [],
        layerData: []
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    // 获取认知考古服务，但不修改全局AI服务类型
    const aiService = aiServiceFactory.getService('cognitive-archaeology');
    
    // 调用AI服务
    const result: any = await aiService.analyzeMessage(
      content,
      image,
      session.messages
    );
    
    // 保存消息
    const userMessage = {
      id: uuidv4(),
      content,
      role: 'user' as const,
      timestamp: Date.now(),
      image
    };
    
    const aiMessage = {
      id: uuidv4(),
      content: result.response,
      role: 'ai' as const,
      timestamp: Date.now(),
      analysis: result.analysis
    };
    
    session.messages.push(userMessage, aiMessage);
    await session.save();
    
    // 获取Socket.io实例并广播更新
    const io = req.app.get('io');
    if (io && result.cognitiveNodes) {
      result.cognitiveNodes.forEach((node: any) => {
        io.to((session._id as any).toString()).emit('node-added', node);
      });
    }
    
    res.json({
      success: true,
      response: result.response,
      analysis: result.analysis,
      cognitiveNodes: result.cognitiveNodes,
      sessionId: session._id
    });
    
  } catch (error: any) {
    console.error('认知考古处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '处理失败'
    });
  }
});

// 获取认知地图数据
router.get('/cognitive-map/:sessionId', async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }
    
    // 从认知地图服务获取节点数据
    const mapData = cognitiveMapService.getSessionData(sessionId);
    
    res.json({
      success: true,
      nodes: (mapData as any)?.nodes || mapData?.areas || [],
      connections: mapData?.connections || [],
      insights: (mapData as any)?.insights || []
    });
    
  } catch (error: any) {
    console.error('获取认知地图错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取失败'
    });
  }
});

export default router;