import { Router } from 'express';
import chatRoutes from './chat.routes';
import sessionRoutes from './session.routes';
import authRoutes from './auth.routes';
import analysisRoutes from './analysis.routes';
import archaeologyRoutes from './archaeology.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/sessions', sessionRoutes);
router.use('/analysis', analysisRoutes);
router.use('/cognitive', archaeologyRoutes);

router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      ai: process.env.AI_SERVICE_TYPE || 'local',
      database: 'mongodb'
    }
  });
});

export default router;