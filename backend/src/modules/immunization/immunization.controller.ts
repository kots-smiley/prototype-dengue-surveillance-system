import { Response } from 'express';
import { immunizationService } from './immunization.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const immunizationController = {
  async list(req: AuthRequest, res: Response) {
    const items = await immunizationService.list(req.query);
    sendSuccess(res, { immunizations: items }, 'Immunizations retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await immunizationService.create(req.body);
    sendSuccess(res, { immunization: record }, 'Immunization recorded', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await immunizationService.update(req.params.id, req.body);
    sendSuccess(res, { immunization: record }, 'Immunization updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await immunizationService.remove(req.params.id);
    sendSuccess(res, null, 'Immunization deleted');
  },
};
