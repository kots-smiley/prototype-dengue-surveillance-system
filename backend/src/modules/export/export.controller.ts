import { Response } from 'express';
import { exportService, ExportFile } from './export.service';
import { ExportCasesQuery, ExportReportsQuery, ExportSummaryQuery } from './export.schema';
import { AuthRequest } from '../../types';

function stream(res: Response, file: ExportFile): void {
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  res.send(file.body);
}

export const exportController = {
  async cases(req: AuthRequest, res: Response) {
    const file = await exportService.exportCases(
      req.query as unknown as ExportCasesQuery,
      req.user!
    );
    stream(res, file);
  },

  async reports(req: AuthRequest, res: Response) {
    const file = await exportService.exportReports(
      req.query as unknown as ExportReportsQuery,
      req.user!
    );
    stream(res, file);
  },

  async summary(req: AuthRequest, res: Response) {
    const file = await exportService.exportSummary(
      req.query as unknown as ExportSummaryQuery
    );
    stream(res, file);
  },
};
