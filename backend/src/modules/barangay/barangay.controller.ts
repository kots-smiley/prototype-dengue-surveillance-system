import { Request, Response } from 'express';
import { barangayService } from './barangay.service';
import { sendSuccess } from '../../helper/api-response';

export const barangayController = {
  async list(req: Request, res: Response) {
    const barangays = await barangayService.list(req.query);
    sendSuccess(res, { barangays }, 'Barangays retrieved');
  },

  async getById(req: Request, res: Response) {
    const barangay = await barangayService.getById(req.params.id);
    sendSuccess(res, { barangay }, 'Barangay retrieved');
  },

  async create(req: Request, res: Response) {
    const barangay = await barangayService.create(req.body);
    sendSuccess(res, { barangay }, 'Barangay created', 201);
  },

  async update(req: Request, res: Response) {
    const barangay = await barangayService.update(req.params.id, req.body);
    sendSuccess(res, { barangay }, 'Barangay updated');
  },

  async remove(req: Request, res: Response) {
    await barangayService.remove(req.params.id);
    sendSuccess(res, null, 'Barangay deleted');
  },
};
