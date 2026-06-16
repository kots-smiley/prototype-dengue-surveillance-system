import { buildQuery, downloadFile } from '../utils/api-client';

function exportFallbackName(base: string, ext: string): string {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const day = now.getDate();
  const year = now.getFullYear();
  const time = now
    .toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(/:/g, '-');
  return `${base} - ${month} ${day} ${year} ${time}.${ext}`;
}

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
    return downloadFile(`/exports/cases${buildQuery(params)}`, exportFallbackName('cases', ext));
  },

  reports(params: ExportReportsParams = {}) {
    const ext = params.format === 'xlsx' ? 'xlsx' : 'csv';
    return downloadFile(`/exports/reports${buildQuery(params)}`, exportFallbackName('risk-reports', ext));
  },

  summary(params: ExportSummaryParams = {}) {
    const ext = params.format === 'xlsx' ? 'xlsx' : 'csv';
    return downloadFile(`/exports/summary${buildQuery(params)}`, exportFallbackName('summary', ext));
  },
};
