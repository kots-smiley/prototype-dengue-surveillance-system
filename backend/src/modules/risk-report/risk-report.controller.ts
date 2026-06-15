import { Response } from 'express';
import { riskReportService } from './risk-report.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const riskReportController = {
  async list(req: AuthRequest, res: Response) {
    const result = await riskReportService.list(req.query, req.user!);
    sendSuccess(res, result, 'Risk reports retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const report = await riskReportService.getById(req.params.id, req.user!);
    sendSuccess(res, { report }, 'Risk report retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const report = await riskReportService.create(req.body, req.user!);
    sendSuccess(res, { report }, 'Risk report created', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const report = await riskReportService.update(req.params.id, req.body, req.user!);
    sendSuccess(res, { report }, 'Risk report updated');
  },

  async review(req: AuthRequest, res: Response) {
    const report = await riskReportService.review(req.params.id, req.body, req.user!);
    sendSuccess(res, { report }, 'Risk report reviewed');
  },

  async remove(req: AuthRequest, res: Response) {
    await riskReportService.remove(req.params.id);
    sendSuccess(res, null, 'Risk report deleted');
  },
};
