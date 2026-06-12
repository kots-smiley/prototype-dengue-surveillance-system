import { Response } from 'express';
import { documentService } from './document.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const documentController = {
  async list(req: AuthRequest, res: Response) {
    const result = await documentService.list(req.query);
    sendSuccess(res, result, 'Documents retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const document = await documentService.create(req.body, req.user!);
    sendSuccess(res, { document }, 'Document added', 201);
  },

  async remove(req: AuthRequest, res: Response) {
    await documentService.remove(req.params.id);
    sendSuccess(res, null, 'Document deleted');
  },
};
