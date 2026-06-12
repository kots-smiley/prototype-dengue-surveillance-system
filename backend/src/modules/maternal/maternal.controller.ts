import { Response } from 'express';
import { maternalService } from './maternal.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const maternalController = {
  async list(req: AuthRequest, res: Response) {
    const items = await maternalService.list(req.query);
    sendSuccess(res, { maternalRecords: items }, 'Maternal records retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await maternalService.create(req.body);
    sendSuccess(res, { maternalRecord: record }, 'Maternal record created', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await maternalService.update(req.params.id, req.body);
    sendSuccess(res, { maternalRecord: record }, 'Maternal record updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await maternalService.remove(req.params.id);
    sendSuccess(res, null, 'Maternal record deleted');
  },
};
