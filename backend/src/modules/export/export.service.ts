import ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';
import { exportRepository } from './export.repository';
import { ExportCasesQuery, ExportReportsQuery, ExportSummaryQuery } from './export.schema';
import { AuthUser } from '../../types';
import { withApprovedRiskReports } from '../../helper/risk-report-filter';
import { RISK_FACTORS_BY_CATEGORY } from '../../configuration/constants';

export interface ExportFile {
  filename: string;
  contentType: string;
  /** CSV string or XLSX buffer. */
  body: string | Buffer;
}

const CSV = 'text/csv';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function isExcel(format: string): boolean {
  return format === 'xlsx' || format === 'excel';
}

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const head = headers.map(csvCell).join(',');
  const body = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  return `${head}\n${body}`;
}

async function toXlsx(
  sheetName: string,
  columns: { header: string; key: string; width: number }[],
  records: Record<string, unknown>[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  records.forEach((r) => sheet.addRow(r));
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function scopeBarangay(user: AuthUser, barangayId?: string): string | undefined {
  if (user.role === 'BHW' && user.barangayId) return user.barangayId;
  return barangayId;
}

function exportTimestamp(date = new Date()): string {
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date
    .toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(/:/g, '-');
  return `${month} ${day} ${year} ${time}`;
}

function buildExportFilename(base: string, ext: string, date = new Date()): string {
  return `${base} - ${exportTimestamp(date)}.${ext}`;
}

export const exportService = {
  async exportCases(query: ExportCasesQuery, user: AuthUser): Promise<ExportFile> {
    const where: Prisma.CaseWhereInput = {};
    const scoped = scopeBarangay(user, query.barangayId);
    if (scoped) where.barangayId = scoped;
    if (query.diseaseId) where.diseaseId = query.diseaseId;
    if (query.startDate || query.endDate) {
      where.dateReported = {};
      if (query.startDate) where.dateReported.gte = query.startDate;
      if (query.endDate) where.dateReported.lte = query.endDate;
    }

    const cases = await exportRepository.findCases(where);
    const exportedAt = new Date();
    const ext = isExcel(query.format) ? 'xlsx' : 'csv';

    if (isExcel(query.format)) {
      const body = await toXlsx(
        'Cases',
        [
          { header: 'Date Reported', key: 'dateReported', width: 16 },
          { header: 'Disease', key: 'disease', width: 20 },
          { header: 'Barangay', key: 'barangay', width: 20 },
          { header: 'Age', key: 'age', width: 8 },
          { header: 'Age Group', key: 'ageGroup', width: 12 },
          { header: 'Sex', key: 'sex', width: 8 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Outcome', key: 'outcome', width: 12 },
          { header: 'Source', key: 'source', width: 18 },
          { header: 'Reporter', key: 'reporter', width: 22 },
        ],
        cases.map((c) => ({
          dateReported: new Date(c.dateReported).toISOString().slice(0, 10),
          disease: c.disease.name,
          barangay: c.barangay.name,
          age: c.age,
          ageGroup: c.ageGroup,
          sex: c.sex ?? '',
          status: c.status,
          outcome: c.outcome,
          source: c.source,
          reporter: `${c.reporter.firstName} ${c.reporter.lastName}`,
        }))
      );
      return { filename: buildExportFilename('cases', ext, exportedAt), contentType: XLSX, body };
    }

    const body = toCsv(
      ['Date Reported', 'Disease', 'Barangay', 'Age', 'Age Group', 'Sex', 'Status', 'Outcome', 'Source', 'Reporter'],
      cases.map((c) => [
        new Date(c.dateReported).toLocaleDateString(),
        c.disease.name,
        c.barangay.name,
        c.age,
        c.ageGroup,
        c.sex ?? '',
        c.status,
        c.outcome,
        c.source,
        `${c.reporter.firstName} ${c.reporter.lastName}`,
      ])
    );
    return { filename: buildExportFilename('cases', ext, exportedAt), contentType: CSV, body };
  },

  async exportReports(query: ExportReportsQuery, user: AuthUser): Promise<ExportFile> {
    const where: Prisma.RiskReportWhereInput = withApprovedRiskReports();
    const scoped = scopeBarangay(user, query.barangayId);
    if (scoped) where.barangayId = scoped;
    if (query.category) where.category = query.category;
    if (query.startDate || query.endDate) {
      where.dateReported = {};
      if (query.startDate) where.dateReported.gte = query.startDate;
      if (query.endDate) where.dateReported.lte = query.endDate;
    }

    const reports = await exportRepository.findReports(where);
    const exportedAt = new Date();
    const ext = isExcel(query.format) ? 'xlsx' : 'csv';

    // Flatten all factor flags into a readable list of active factors.
    const activeFactors = (r: Record<string, unknown>): string => {
      const all = Object.values(RISK_FACTORS_BY_CATEGORY).flat();
      return all.filter((f) => r[f] === true).join('; ');
    };

    const reporterLabel = (r: (typeof reports)[number]) =>
      r.reporter
        ? `${r.reporter.firstName} ${r.reporter.lastName}`
        : r.submittedByName?.trim() || 'Resident';

    if (isExcel(query.format)) {
      const body = await toXlsx(
        'Risk Reports',
        [
          { header: 'Date Reported', key: 'dateReported', width: 16 },
          { header: 'Barangay', key: 'barangay', width: 20 },
          { header: 'Category', key: 'category', width: 16 },
          { header: 'Active Risk Factors', key: 'factors', width: 50 },
          { header: 'Reporter', key: 'reporter', width: 22 },
        ],
        reports.map((r) => ({
          dateReported: new Date(r.dateReported).toISOString().slice(0, 10),
          barangay: r.barangay.name,
          category: r.category,
          factors: activeFactors(r as unknown as Record<string, unknown>),
          reporter: reporterLabel(r),
        }))
      );
      return { filename: buildExportFilename('risk-reports', ext, exportedAt), contentType: XLSX, body };
    }

    const body = toCsv(
      ['Date Reported', 'Barangay', 'Category', 'Active Risk Factors', 'Reporter'],
      reports.map((r) => [
        new Date(r.dateReported).toLocaleDateString(),
        r.barangay.name,
        r.category,
        activeFactors(r as unknown as Record<string, unknown>),
        reporterLabel(r),
      ])
    );
    return { filename: buildExportFilename('risk-reports', ext, exportedAt), contentType: CSV, body };
  },

  async exportSummary(query: ExportSummaryQuery): Promise<ExportFile> {
    const now = new Date();
    const targetYear = query.year ? parseInt(query.year, 10) : now.getFullYear();
    const targetMonth = query.month ? parseInt(query.month, 10) : now.getMonth() + 1;
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const caseWhere: Prisma.CaseWhereInput = { dateReported: { gte: startDate, lte: endDate } };
    if (query.diseaseId) caseWhere.diseaseId = query.diseaseId;

    const [cases, reports, alerts, barangays] = await Promise.all([
      exportRepository.findCasesInRange(caseWhere),
      exportRepository.findReportsInRange(
        withApprovedRiskReports({
          dateReported: { gte: startDate, lte: endDate },
        })
      ),
      exportRepository.findAlertsInRange({ triggeredAt: { gte: startDate, lte: endDate } }),
      exportRepository.listBarangays(),
    ]);

    const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString('default', {
      month: 'long',
    });
    const exportedAt = new Date();
    const ext = isExcel(query.format) ? 'xlsx' : 'csv';

    const byBarangay = barangays.map((b) => {
      const bCases = cases.filter((c) => c.barangayId === b.id);
      return {
        name: b.name,
        code: b.code,
        municipality: b.municipality,
        province: b.province,
        cases: bCases.length,
        confirmed: bCases.filter((c) => c.status === 'CONFIRMED').length,
        suspected: bCases.filter((c) => c.status === 'SUSPECTED').length,
        probable: bCases.filter((c) => c.status === 'PROBABLE').length,
        reports: reports.filter((r) => r.barangayId === b.id).length,
        activeAlerts: alerts.filter((a) => a.barangayId === b.id && a.status === 'ACTIVE').length,
      };
    });

    if (isExcel(query.format)) {
      const workbook = new ExcelJS.Workbook();
      const totals = workbook.addWorksheet('Summary Totals');
      totals.columns = [
        { header: 'Year', key: 'year', width: 8 },
        { header: 'Month', key: 'monthName', width: 14 },
        { header: 'Total Cases', key: 'cases', width: 12 },
        { header: 'Confirmed', key: 'confirmed', width: 12 },
        { header: 'Suspected', key: 'suspected', width: 12 },
        { header: 'Probable', key: 'probable', width: 12 },
        { header: 'Reports', key: 'reports', width: 10 },
        { header: 'Alerts', key: 'alerts', width: 10 },
      ];
      totals.addRow({
        year: targetYear,
        monthName,
        cases: cases.length,
        confirmed: cases.filter((c) => c.status === 'CONFIRMED').length,
        suspected: cases.filter((c) => c.status === 'SUSPECTED').length,
        probable: cases.filter((c) => c.status === 'PROBABLE').length,
        reports: reports.length,
        alerts: alerts.length,
      });

      const sheet = workbook.addWorksheet('By Barangay');
      sheet.columns = [
        { header: 'Barangay', key: 'name', width: 20 },
        { header: 'Code', key: 'code', width: 10 },
        { header: 'Cases', key: 'cases', width: 10 },
        { header: 'Confirmed', key: 'confirmed', width: 12 },
        { header: 'Suspected', key: 'suspected', width: 12 },
        { header: 'Probable', key: 'probable', width: 12 },
        { header: 'Reports', key: 'reports', width: 10 },
        { header: 'Active Alerts', key: 'activeAlerts', width: 14 },
      ];
      byBarangay.forEach((b) => sheet.addRow(b));

      const arrayBuffer = await workbook.xlsx.writeBuffer();
      return {
        filename: buildExportFilename('summary', ext, exportedAt),
        contentType: XLSX,
        body: Buffer.from(arrayBuffer),
      };
    }

    const totalsCsv = toCsv(
      ['Year', 'Month', 'Total Cases', 'Confirmed', 'Suspected', 'Probable', 'Reports', 'Alerts'],
      [
        [
          targetYear,
          monthName,
          cases.length,
          cases.filter((c) => c.status === 'CONFIRMED').length,
          cases.filter((c) => c.status === 'SUSPECTED').length,
          cases.filter((c) => c.status === 'PROBABLE').length,
          reports.length,
          alerts.length,
        ],
      ]
    );
    const byBarangayCsv = toCsv(
      ['Barangay', 'Code', 'Cases', 'Confirmed', 'Suspected', 'Probable', 'Reports', 'Active Alerts'],
      byBarangay.map((b) => [
        b.name,
        b.code,
        b.cases,
        b.confirmed,
        b.suspected,
        b.probable,
        b.reports,
        b.activeAlerts,
      ])
    );
    return {
      filename: buildExportFilename('summary', ext, exportedAt),
      contentType: CSV,
      body: `${totalsCsv}\n\n${byBarangayCsv}`,
    };
  },
};
