import { Response } from 'express';
import { alertService } from './alert.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const alertController = {
  async list(req: AuthRequest, res: Response) {
    const result = await alertService.list(req.query, req.user!);
    sendSuccess(res, result, 'Alerts retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const alert = await alertService.getById(req.params.id, req.user!);
    sendSuccess(res, { alert }, 'Alert retrieved');
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const alert = await alertService.updateStatus(req.params.id, req.body);
    sendSuccess(res, { alert }, 'Alert status updated');
  },

  async resolve(req: AuthRequest, res: Response) {
    const alert = await alertService.resolve(req.params.id);
    sendSuccess(res, { alert }, 'Alert resolved');
  },
};
