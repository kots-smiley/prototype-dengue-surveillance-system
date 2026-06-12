import { Response } from 'express';
import { hieService } from './hie.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';
import { HieAccessQuery } from './hie.schema';

export const hieController = {
  async getSharedRecord(req: AuthRequest, res: Response) {
    // Validated + defaulted by the validate middleware before reaching here.
    const query = req.query as unknown as HieAccessQuery;
    const result = await hieService.getSharedRecord(req.params.id, req.user!, query);
    sendSuccess(res, result, 'Shared record retrieved');
  },
};
