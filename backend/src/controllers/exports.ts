import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import ExcelJS from 'exceljs';

export const exportCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, barangayId, format = 'csv' } = req.query;
    const exportFormat = String(format).toLowerCase();
    if (exportFormat !== 'csv' && exportFormat !== 'xlsx' && exportFormat !== 'excel') {
      return res.status(400).json({ success: false, error: 'Invalid format. Use csv or xlsx.' });
    }

    const where: any = {};
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    } else if (barangayId) {
      where.barangayId = barangayId;
    }

    if (startDate || endDate) {
      where.dateReported = {};
      if (startDate) where.dateReported.gte = new Date(startDate as string);
      if (endDate) where.dateReported.lte = new Date(endDate as string);
    }

    const cases = await prisma.dengueCase.findMany({
      where,
      include: {
        barangay: true,
        reporter: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { dateReported: 'desc' }
    });

    if (exportFormat === 'csv') {
      const csvHeader = 'Date Reported,Barangay,Age,Age Group,Status,Source,Reporter,Notes\n';
      const csvRows = cases.map(c => {
        const date = new Date(c.dateReported).toLocaleDateString();
        const barangay = c.barangay.name;
        const reporter = `${c.reporter.firstName} ${c.reporter.lastName}`;
        const notes = (c.notes || '').replace(/"/g, '""');
        return `"${date}","${barangay}",${c.age},"${c.ageGroup}","${c.status}","${c.source}","${reporter}","${notes}"`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dengue-cases-${Date.now()}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Dengue Cases');

      sheet.columns = [
        { header: 'Date Reported', key: 'dateReported', width: 16 },
        { header: 'Barangay', key: 'barangay', width: 20 },
        { header: 'Age', key: 'age', width: 8 },
        { header: 'Age Group', key: 'ageGroup', width: 14 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Source', key: 'source', width: 18 },
        { header: 'Reporter', key: 'reporter', width: 22 },
        { header: 'Notes', key: 'notes', width: 40 }
      ];

      cases.forEach(c => {
        sheet.addRow({
          dateReported: new Date(c.dateReported).toISOString().slice(0, 10),
          barangay: c.barangay.name,
          age: c.age,
          ageGroup: c.ageGroup,
          status: c.status,
          source: c.source,
          reporter: `${c.reporter.firstName} ${c.reporter.lastName}`,
          notes: c.notes || ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="dengue-cases-${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};

export const exportReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, barangayId, format = 'csv' } = req.query;
    const exportFormat = String(format).toLowerCase();
    if (exportFormat !== 'csv' && exportFormat !== 'xlsx' && exportFormat !== 'excel') {
      return res.status(400).json({ success: false, error: 'Invalid format. Use csv or xlsx.' });
    }

    const where: any = {};
    if (req.user!.role === 'BHW' && req.user!.barangayId) {
      where.barangayId = req.user!.barangayId;
    } else if (barangayId) {
      where.barangayId = barangayId;
    }

    if (startDate || endDate) {
      where.dateReported = {};
      if (startDate) where.dateReported.gte = new Date(startDate as string);
      if (endDate) where.dateReported.lte = new Date(endDate as string);
    }

    const reports = await prisma.environmentalReport.findMany({
      where,
      include: {
        barangay: true,
        reporter: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { dateReported: 'desc' }
    });

    if (exportFormat === 'csv') {
      const csvHeader = 'Date Reported,Barangay,Stagnant Water,Poor Waste Disposal,Clogged Drainage,Housing Congestion,Reporter,Notes\n';
      const csvRows = reports.map(r => {
        const date = new Date(r.dateReported).toLocaleDateString();
        const barangay = r.barangay.name;
        const reporter = `${r.reporter.firstName} ${r.reporter.lastName}`;
        const notes = (r.notes || '').replace(/"/g, '""');
        return `"${date}","${barangay}",${r.stagnantWater ? 'Yes' : 'No'},${r.poorWasteDisposal ? 'Yes' : 'No'},${r.cloggedDrainage ? 'Yes' : 'No'},${r.housingCongestion ? 'Yes' : 'No'},"${reporter}","${notes}"`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="environmental-reports-${Date.now()}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Environmental Reports');

      sheet.columns = [
        { header: 'Date Reported', key: 'dateReported', width: 16 },
        { header: 'Barangay', key: 'barangay', width: 20 },
        { header: 'Stagnant Water', key: 'stagnantWater', width: 16 },
        { header: 'Poor Waste Disposal', key: 'poorWasteDisposal', width: 20 },
        { header: 'Clogged Drainage', key: 'cloggedDrainage', width: 18 },
        { header: 'Housing Congestion', key: 'housingCongestion', width: 20 },
        { header: 'Reporter', key: 'reporter', width: 22 },
        { header: 'Notes', key: 'notes', width: 40 }
      ];

      reports.forEach(r => {
        sheet.addRow({
          dateReported: new Date(r.dateReported).toISOString().slice(0, 10),
          barangay: r.barangay.name,
          stagnantWater: r.stagnantWater ? 'Yes' : 'No',
          poorWasteDisposal: r.poorWasteDisposal ? 'Yes' : 'No',
          cloggedDrainage: r.cloggedDrainage ? 'Yes' : 'No',
          housingCongestion: r.housingCongestion ? 'Yes' : 'No',
          reporter: `${r.reporter.firstName} ${r.reporter.lastName}`,
          notes: r.notes || ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="environmental-reports-${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};

export const exportSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year, month, format = 'csv' } = req.query;
    const exportFormat = String(format).toLowerCase();
    if (exportFormat !== 'csv' && exportFormat !== 'xlsx' && exportFormat !== 'excel') {
      return res.status(400).json({ success: false, error: 'Invalid format. Use csv or xlsx.' });
    }

    const now = new Date();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();
    const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const [cases, reports, alerts, barangays] = await Promise.all([
      prisma.dengueCase.findMany({
        where: {
          dateReported: {
            gte: startDate,
            lte: endDate
          }
        },
        include: { barangay: true }
      }),
      prisma.environmentalReport.findMany({
        where: {
          dateReported: {
            gte: startDate,
            lte: endDate
          }
        },
        include: { barangay: true }
      }),
      prisma.alert.findMany({
        where: {
          triggeredAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: { barangay: true }
      }),
      prisma.barangay.findMany()
    ]);

    const summary = {
      period: {
        year: targetYear,
        month: targetMonth,
        monthName: new Date(targetYear, targetMonth - 1, 1).toLocaleString('default', { month: 'long' })
      },
      totals: {
        cases: cases.length,
        suspected: cases.filter(c => c.status === 'SUSPECTED').length,
        confirmed: cases.filter(c => c.status === 'CONFIRMED').length,
        reports: reports.length,
        alerts: alerts.length,
        barangays: barangays.length
      },
      byBarangay: barangays.map(b => {
        const barangayCases = cases.filter(c => c.barangayId === b.id);
        const barangayReports = reports.filter(r => r.barangayId === b.id);
        const barangayAlerts = alerts.filter(a => a.barangayId === b.id);

        return {
          name: b.name,
          code: b.code,
          municipality: b.municipality,
          province: b.province,
          cases: barangayCases.length,
          suspected: barangayCases.filter(c => c.status === 'SUSPECTED').length,
          confirmed: barangayCases.filter(c => c.status === 'CONFIRMED').length,
          reports: barangayReports.length,
          activeAlerts: barangayAlerts.filter(a => a.status === 'ACTIVE').length
        };
      })
    };

    if (exportFormat === 'csv') {
      const header = 'Year,Month,Total Cases,Suspected,Confirmed,Total Reports,Total Alerts,Barangays\n';
      const totalsRow = `${summary.period.year},${summary.period.month},${summary.totals.cases},${summary.totals.suspected},${summary.totals.confirmed},${summary.totals.reports},${summary.totals.alerts},${summary.totals.barangays}\n`;

      const byBarangayHeader = '\nBarangay,Code,Municipality,Province,Cases,Suspected,Confirmed,Reports,Active Alerts\n';
      const byBarangayRows = summary.byBarangay
        .map(b => `"${b.name}","${b.code || ''}","${b.municipality || ''}","${b.province || ''}",${b.cases},${b.suspected},${b.confirmed},${b.reports},${b.activeAlerts}`)
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dengue-summary-${Date.now()}.csv"`);
      res.send(header + totalsRow + byBarangayHeader + byBarangayRows);
    } else {
      const workbook = new ExcelJS.Workbook();
      const totalsSheet = workbook.addWorksheet('Summary Totals');
      totalsSheet.columns = [
        { header: 'Year', key: 'year', width: 8 },
        { header: 'Month', key: 'month', width: 8 },
        { header: 'Month Name', key: 'monthName', width: 14 },
        { header: 'Total Cases', key: 'cases', width: 12 },
        { header: 'Suspected', key: 'suspected', width: 12 },
        { header: 'Confirmed', key: 'confirmed', width: 12 },
        { header: 'Reports', key: 'reports', width: 10 },
        { header: 'Alerts', key: 'alerts', width: 10 },
        { header: 'Barangays', key: 'barangays', width: 12 }
      ];
      totalsSheet.addRow({
        year: summary.period.year,
        month: summary.period.month,
        monthName: summary.period.monthName,
        cases: summary.totals.cases,
        suspected: summary.totals.suspected,
        confirmed: summary.totals.confirmed,
        reports: summary.totals.reports,
        alerts: summary.totals.alerts,
        barangays: summary.totals.barangays
      });

      const barangaySheet = workbook.addWorksheet('By Barangay');
      barangaySheet.columns = [
        { header: 'Barangay', key: 'name', width: 20 },
        { header: 'Code', key: 'code', width: 10 },
        { header: 'Municipality', key: 'municipality', width: 16 },
        { header: 'Province', key: 'province', width: 16 },
        { header: 'Cases', key: 'cases', width: 10 },
        { header: 'Suspected', key: 'suspected', width: 12 },
        { header: 'Confirmed', key: 'confirmed', width: 12 },
        { header: 'Reports', key: 'reports', width: 10 },
        { header: 'Active Alerts', key: 'activeAlerts', width: 14 }
      ];
      summary.byBarangay.forEach(b => barangaySheet.addRow(b));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="dengue-summary-${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};


