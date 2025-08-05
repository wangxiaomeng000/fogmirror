import { Router } from 'express';
import {
  analyzeConversation,
  getLayerData,
  getDynamicModel,
  updateDynamicModel
} from '../controllers/analysis.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/conversation/:sessionId', optionalAuth, analyzeConversation);
router.get('/layers/:sessionId', optionalAuth, getLayerData);
router.get('/model/:sessionId', optionalAuth, getDynamicModel);
router.put('/model/:sessionId', optionalAuth, updateDynamicModel);

export default router;