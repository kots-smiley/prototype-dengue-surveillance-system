import { Response } from 'express';
import { feedbackService } from './feedback.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const feedbackController = {
  async list(req: AuthRequest, res: Response) {
    const result = await feedbackService.list(req.query, req.user!);
    sendSuccess(res, result, 'Feedback threads retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const thread = await feedbackService.getById(req.params.id, req.user!);
    sendSuccess(res, { thread }, 'Feedback thread retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const thread = await feedbackService.create(req.body, req.user!);
    sendSuccess(res, { thread }, 'Feedback sent', 201);
  },

  async reply(req: AuthRequest, res: Response) {
    const thread = await feedbackService.reply(req.params.id, req.body, req.user!);
    sendSuccess(res, { thread }, 'Reply sent');
  },

  async close(req: AuthRequest, res: Response) {
    const thread = await feedbackService.close(req.params.id, req.user!);
    sendSuccess(res, { thread }, 'Thread closed');
  },

  async reopen(req: AuthRequest, res: Response) {
    const thread = await feedbackService.reopen(req.params.id, req.user!);
    sendSuccess(res, { thread }, 'Thread reopened');
  },

  async unreadCount(req: AuthRequest, res: Response) {
    const result = await feedbackService.getUnreadCount(req.user!);
    sendSuccess(res, result, 'Unread count retrieved');
  },
};
