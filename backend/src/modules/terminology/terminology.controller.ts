import { Response } from 'express';
import { terminologyService } from './terminology.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const terminologyController = {
  async list(req: AuthRequest, res: Response) {
    const result = await terminologyService.list(req.query);
    sendSuccess(res, result, 'Terminology concepts retrieved');
  },
};
