import { Response } from 'express';
import { encounterService } from './encounter.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const encounterController = {
  async list(req: AuthRequest, res: Response) {
    const result = await encounterService.list(req.query);
    sendSuccess(res, result, 'Encounters retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const record = await encounterService.getById(req.params.id);
    sendSuccess(res, { encounter: record }, 'Encounter retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await encounterService.create(req.body, req.user!);
    sendSuccess(res, { encounter: record }, 'Encounter recorded', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await encounterService.update(req.params.id, req.body, req.user!);
    sendSuccess(res, { encounter: record }, 'Encounter amended');
  },

  async remove(req: AuthRequest, res: Response) {
    await encounterService.remove(req.params.id);
    sendSuccess(res, null, 'Encounter deleted');
  },
};
