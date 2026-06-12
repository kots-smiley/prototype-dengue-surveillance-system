import { Response } from 'express';
import { referralService } from './referral.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const referralController = {
  async list(req: AuthRequest, res: Response) {
    const result = await referralService.list(req.query);
    sendSuccess(res, result, 'Referrals retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const referral = await referralService.create(req.body, req.user!);
    sendSuccess(res, { referral }, 'Referral created', 201);
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const referral = await referralService.updateStatus(req.params.id, req.body);
    sendSuccess(res, { referral }, 'Referral updated');
  },
};
