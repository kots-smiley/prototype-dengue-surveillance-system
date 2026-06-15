import { Request, Response } from 'express';
import { publicService } from './public.service';
import { sendSuccess } from '../../helper/api-response';

export const publicController = {
  async diseases(_req: Request, res: Response) {
    const diseases = await publicService.listDiseases();
    sendSuccess(res, { diseases }, 'Diseases retrieved');
  },

  async barangays(_req: Request, res: Response) {
    const barangays = await publicService.listBarangays();
    sendSuccess(res, { barangays }, 'Barangays retrieved');
  },

  async submitReport(req: Request, res: Response) {
    const report = await publicService.submitReport(req.body);
    sendSuccess(res, { report }, 'Risk report submitted for review', 201);
  },

  async stats(req: Request, res: Response) {
    const stats = await publicService.getStats(req.query.diseaseId as string | undefined);
    sendSuccess(res, { stats }, 'Public stats retrieved');
  },

  async timeSeries(req: Request, res: Response) {
    const timeSeries = await publicService.getTimeSeries(req.query);
    sendSuccess(res, { timeSeries }, 'Time series retrieved');
  },

  async forecastSummary(req: Request, res: Response) {
    const summary = await publicService.getForecastSummary(req.query);
    sendSuccess(res, summary, 'Forecast summary retrieved');
  },
};
