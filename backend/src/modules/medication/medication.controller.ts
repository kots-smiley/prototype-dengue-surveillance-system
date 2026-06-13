import { Response } from 'express';
import { medicationService } from './medication.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const medicationController = {
  async list(req: AuthRequest, res: Response) {
    const items = await medicationService.list(req.query);
    sendSuccess(res, { medications: items }, 'Medications retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await medicationService.create(req.body);
    sendSuccess(res, { medication: record }, 'Medication added', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await medicationService.update(req.params.id, req.body);
    sendSuccess(res, { medication: record }, 'Medication updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await medicationService.remove(req.params.id);
    sendSuccess(res, null, 'Medication deleted');
  },
};
