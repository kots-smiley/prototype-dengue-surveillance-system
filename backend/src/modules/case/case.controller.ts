import { Response } from 'express';
import { caseService } from './case.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const caseController = {
  async list(req: AuthRequest, res: Response) {
    const result = await caseService.list(req.query, req.user!);
    sendSuccess(res, result, 'Cases retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const record = await caseService.getById(req.params.id, req.user!);
    sendSuccess(res, { case: record }, 'Case retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await caseService.create(req.body, req.user!);
    sendSuccess(res, { case: record }, 'Case created', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await caseService.update(req.params.id, req.body, req.user!);
    sendSuccess(res, { case: record }, 'Case updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await caseService.remove(req.params.id);
    sendSuccess(res, null, 'Case deleted');
  },
};
