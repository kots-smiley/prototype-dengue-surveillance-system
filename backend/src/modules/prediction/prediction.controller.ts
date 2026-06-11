import { Response } from 'express';
import { predictionService } from './prediction.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const predictionController = {
  async getPredictions(req: AuthRequest, res: Response) {
    const result = await predictionService.getPredictions(req.query, req.user!);
    sendSuccess(res, result, 'Predictions generated');
  },

  async getBarangayPredictions(req: AuthRequest, res: Response) {
    const barangays = await predictionService.getBarangayPredictions(req.query, req.user!);
    sendSuccess(res, { barangays }, 'Barangay predictions generated');
  },
};
