import { Router } from 'express';
import { feedbackController } from './feedback.controller';
import {
  createFeedbackThreadSchema,
  replyFeedbackThreadSchema,
  listFeedbackQuerySchema,
} from './feedback.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { UserRole } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.BHW));

router.get('/unread-count', asyncHandler(feedbackController.unreadCount));
router.get('/threads', validate(listFeedbackQuerySchema, 'query'), asyncHandler(feedbackController.list));
router.get('/threads/:id', asyncHandler(feedbackController.getById));
router.post('/threads', validate(createFeedbackThreadSchema), asyncHandler(feedbackController.create));
router.post(
  '/threads/:id/reply',
  validate(replyFeedbackThreadSchema),
  asyncHandler(feedbackController.reply)
);
router.put('/threads/:id/close', asyncHandler(feedbackController.close));
router.put('/threads/:id/reopen', asyncHandler(feedbackController.reopen));

export default router;
