import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const exportCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, barangayId, format = 'csv' } = req.query;

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

    if (format === 'csv') {
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
      res.json({
        success: true,
        cases,
        count: cases.length
      });
    }
  } catch (error) {
    next(error);
  }
};

export const exportReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, barangayId, format = 'csv' } = req.query;

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

    if (format === 'csv') {
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
      res.json({
        success: true,
        reports,
        count: reports.length
      });
    }
  } catch (error) {
    next(error);
  }
};

export const exportSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.query;
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

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};


