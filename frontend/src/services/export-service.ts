import { buildQuery, downloadFile } from '../utils/api-client';

export interface ExportCasesParams {
  startDate?: string;
  endDate?: string;
  barangayId?: string;
  diseaseId?: string;
  format?: 'csv' | 'xlsx';
}

export interface ExportReportsParams {
  startDate?: string;
  endDate?: string;
  barangayId?: string;
  category?: string;
  format?: 'csv' | 'xlsx';
}

export interface ExportSummaryParams {
  year?: number;
  month?: number;
  diseaseId?: string;
  format?: 'csv' | 'xlsx';
}

export const exportService = {
  cases(params: ExportCasesParams = {}) {
    const ext = params.format === 'xlsx' ? 'xlsx' : 'csv';
    return downloadFile(`/exports/cases${buildQuery(params)}`, `cases.${ext}`);
  },

  reports(params: ExportReportsParams = {}) {
    const ext = params.format === 'xlsx' ? 'xlsx' : 'csv';
    return downloadFile(`/exports/reports${buildQuery(params)}`, `risk-reports.${ext}`);
  },

  summary(params: ExportSummaryParams = {}) {
    const ext = params.format === 'xlsx' ? 'xlsx' : 'csv';
    return downloadFile(`/exports/summary${buildQuery(params)}`, `summary.${ext}`);
  },
};
