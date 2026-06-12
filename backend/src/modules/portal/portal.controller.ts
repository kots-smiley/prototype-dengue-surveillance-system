import { Response } from 'express';
import { portalService } from './portal.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const portalController = {
  async myRecord(req: AuthRequest, res: Response) {
    const result = await portalService.getMyRecord(req.user!.id);
    sendSuccess(res, result, 'Your record retrieved');
  },

  async myConsents(req: AuthRequest, res: Response) {
    const result = await portalService.listMyConsents(req.user!.id);
    sendSuccess(res, result, 'Your consents retrieved');
  },

  async createConsent(req: AuthRequest, res: Response) {
    const consent = await portalService.createMyConsent(req.user!.id, req.body);
    sendSuccess(res, { consent }, 'Consent recorded', 201);
  },

  async revokeConsent(req: AuthRequest, res: Response) {
    const consent = await portalService.revokeMyConsent(req.user!.id, req.params.id);
    sendSuccess(res, { consent }, 'Consent revoked');
  },
};
