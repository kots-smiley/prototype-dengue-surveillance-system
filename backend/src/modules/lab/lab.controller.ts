import { Response } from 'express';
import { labService } from './lab.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const labController = {
  async list(req: AuthRequest, res: Response) {
    const items = await labService.list(req.query);
    sendSuccess(res, { labResults: items }, 'Lab results retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await labService.create(req.body, req.user);
    sendSuccess(res, { labResult: record }, 'Lab order recorded', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await labService.update(req.params.id, req.body);
    sendSuccess(res, { labResult: record }, 'Lab result updated');
  },

  async cancel(req: AuthRequest, res: Response) {
    const record = await labService.cancel(req.params.id);
    sendSuccess(res, { labResult: record }, 'Lab order cancelled');
  },

  async remove(req: AuthRequest, res: Response) {
    await labService.remove(req.params.id);
    sendSuccess(res, null, 'Lab result deleted');
  },
};
