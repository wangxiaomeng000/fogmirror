import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  exportSessions,
  importSessions
} from '../controllers/session.controller';
import { optionalAuth } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', optionalAuth, createSession);
router.get('/', optionalAuth, getSessions);
router.get('/:id', optionalAuth, getSession);
router.put('/:id', optionalAuth, updateSession);
router.delete('/:id', optionalAuth, deleteSession);
router.get('/export/all', optionalAuth, exportSessions);
router.post('/import', optionalAuth, upload.single('file'), importSessions);

export default router;