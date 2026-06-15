import { Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const dashboardController = {
  async stats(req: AuthRequest, res: Response) {
    const stats = await dashboardService.getStats(req.query, req.user!);
    sendSuccess(res, { stats }, 'Dashboard stats retrieved');
  },

  async trends(req: AuthRequest, res: Response) {
    const trends = await dashboardService.getCaseTrends(req.query, req.user!);
    sendSuccess(res, { trends }, 'Case trends retrieved');
  },

  async weeklyTrends(req: AuthRequest, res: Response) {
    const trends = await dashboardService.getWeeklyTrends(req.query, req.user!);
    sendSuccess(res, { trends }, 'Weekly trends retrieved');
  },

  async rankings(req: AuthRequest, res: Response) {
    const rankings = await dashboardService.getBarangayRankings(req.query);
    sendSuccess(res, { rankings }, 'Barangay rankings retrieved');
  },

  async diseaseBreakdown(req: AuthRequest, res: Response) {
    const breakdown = await dashboardService.getDiseaseBreakdown(req.query, req.user!);
    sendSuccess(res, { breakdown }, 'Disease breakdown retrieved');
  },

  async barangayCases(req: AuthRequest, res: Response) {
    const data = await dashboardService.getBarangayCaseData(req.query);
    sendSuccess(res, data, 'Barangay case data retrieved');
  },
};
