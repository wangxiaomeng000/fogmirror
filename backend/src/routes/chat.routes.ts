import { Router } from 'express';
import multer from 'multer';
import { sendMessage, analyzeImage } from '../controllers/chat.controller';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import SessionModel from '../models/Session';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件'));
    }
  }
});

router.post('/message', optionalAuth, upload.single('image'), sendMessage);
router.post('/analyze-image', optionalAuth, upload.single('image'), analyzeImage);

// 创建新会话
router.post('/session', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const session = new SessionModel({
      userId: req.user?.id || null,
      messages: [],
      layerData: []
    });
    await session.save();
    
    res.json({
      sessionId: session._id,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    res.status(500).json({ error: '创建会话失败' });
  }
});

// 获取会话历史
router.get('/session/:sessionId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    return res.json({
      sessionId: session._id,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    });
  } catch (error) {
    console.error('获取会话失败:', error);
    return res.status(500).json({ error: '获取会话失败' });
  }
});

// 获取会话列表
router.get('/sessions', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || null;
    const query = userId ? { userId } : {};
    
    const sessions = await SessionModel.find(query)
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('_id title createdAt updatedAt');
    
    res.json({
      sessions: sessions.map((s: any) => ({
        sessionId: s._id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ error: '获取会话列表失败' });
  }
});

// 获取3D可视化数据
router.get('/visualization/:sessionId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    // 生成可视化参数
    const messageCount = session.messages.length;
    const complexity = Math.min(0.9, 0.3 + (messageCount * 0.05));
    const coherence = 0.5 + Math.random() * 0.3;
    const evolution = Math.min(0.8, messageCount * 0.1);
    
    return res.json({
      complexity,
      coherence,
      evolution,
      patterns: ['对话模式', '情绪变化'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取可视化数据失败:', error);
    return res.status(500).json({ error: '获取可视化数据失败' });
  }
});

export default router;