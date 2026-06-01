import { Request, Response } from 'express';
import { diseaseService } from './disease.service';
import { sendSuccess } from '../../helper/api-response';

export const diseaseController = {
  async list(req: Request, res: Response) {
    const diseases = await diseaseService.list(req.query);
    sendSuccess(res, { diseases }, 'Diseases retrieved');
  },

  async getById(req: Request, res: Response) {
    const disease = await diseaseService.getById(req.params.id);
    sendSuccess(res, { disease }, 'Disease retrieved');
  },

  async create(req: Request, res: Response) {
    const disease = await diseaseService.create(req.body);
    sendSuccess(res, { disease }, 'Disease created', 201);
  },

  async update(req: Request, res: Response) {
    const disease = await diseaseService.update(req.params.id, req.body);
    sendSuccess(res, { disease }, 'Disease updated');
  },

  async remove(req: Request, res: Response) {
    const result = await diseaseService.remove(req.params.id);
    sendSuccess(
      res,
      { disease: result },
      result ? 'Disease deactivated (has linked cases)' : 'Disease deleted'
    );
  },
};
