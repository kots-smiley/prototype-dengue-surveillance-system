import express from 'express';
import {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  resolveAlert
} from '../controllers/alerts';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticate);

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.put('/:id/status', authorize(UserRole.ADMIN), updateAlertStatus);
router.put('/:id/resolve', authorize(UserRole.ADMIN), resolveAlert);

export default router;


