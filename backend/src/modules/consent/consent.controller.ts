import { Response } from 'express';
import { consentService } from './consent.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const consentController = {
  async list(req: AuthRequest, res: Response) {
    const result = await consentService.list(req.query);
    sendSuccess(res, result, 'Consents retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const consent = await consentService.create(req.body);
    sendSuccess(res, { consent }, 'Consent directive recorded', 201);
  },

  async revoke(req: AuthRequest, res: Response) {
    const consent = await consentService.revoke(req.params.id);
    sendSuccess(res, { consent }, 'Consent revoked');
  },
};
