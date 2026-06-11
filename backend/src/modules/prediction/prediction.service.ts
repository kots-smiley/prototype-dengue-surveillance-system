import { Prisma } from '@prisma/client';
import { dashboardRepository } from '../dashboard/dashboard.repository';
import { diseaseRepository } from '../disease/disease.repository';
import { PredictionQuery, BarangayPredictionQuery, PREDICTION_DISCLAIMER } from './prediction.schema';
import { runForecast, inferTrend } from '../../helper/forecast';
import { AuthUser } from '../../types';

function scopeByRole(user: AuthUser, barangayId?: string): string | undefined {
  if (user.role === 'BHW' && user.barangayId) return user.barangayId;
  return barangayId;
}

function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

async function buildMonthlySeries(
  monthsCount: number,
  where: Prisma.CaseWhereInput
): Promise<{ label: string; cases: number }[]> {
  const now = new Date();
  const series = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const cases = await dashboardRepository.countCases({
      ...where,
      dateReported: { gte: date, lt: nextDate },
    });
    series.push({ label: monthLabel(date), cases });
  }

  return series;
}

function futureMonthLabels(horizon: number): string[] {
  const now = new Date();
  return Array.from({ length: horizon }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    return monthLabel(date);
  });
}

function riskLevelFromPrediction(predicted: number, threshold: number | null): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (threshold == null) {
    if (predicted >= 10) return 'HIGH';
    if (predicted >= 5) return 'MEDIUM';
    return 'LOW';
  }
  if (predicted >= threshold) return 'HIGH';
  if (predicted >= Math.max(1, Math.floor(threshold / 2))) return 'MEDIUM';
  return 'LOW';
}

export const predictionService = {
  async getPredictions(query: PredictionQuery, user: AuthUser) {
    const monthsCount = Math.min(36, Math.max(6, parseInt(query.months ?? '24', 10) || 24));
    const horizon = Math.min(6, Math.max(1, parseInt(query.horizon ?? '3', 10) || 3));

    const where: Prisma.CaseWhereInput = {};
    const scopedBarangay = scopeByRole(user, query.barangayId);
    if (scopedBarangay) where.barangayId = scopedBarangay;
    if (query.diseaseId) where.diseaseId = query.diseaseId;

    const historical = await buildMonthlySeries(monthsCount, where);
    const values = historical.map((h) => h.cases);

    let seasonal = false;
    let caseThreshold: number | null = null;

    if (query.diseaseId) {
      const disease = await diseaseRepository.findById(query.diseaseId);
      if (disease) {
        caseThreshold = disease.caseThreshold;
        seasonal = (disease.seasonalMonths?.length ?? 0) > 0;
      }
    }

    const result = runForecast(values, horizon, { seasonal });
    const labels = futureMonthLabels(horizon);
    const nextMonthCases = result.predictions[0] ?? 0;

    const forecast = result.predictions.map((cases, i) => ({
      label: labels[i],
      cases,
      lower: result.lower[i],
      upper: result.upper[i],
    }));

    const trend = inferTrend(values, nextMonthCases);
    const thresholdBreach = caseThreshold != null && nextMonthCases >= caseThreshold;

    return {
      model: {
        name: result.model,
        trainedOnMonths: result.trainedOn,
        seasonal,
      },
      historical,
      forecast,
      summary: {
        nextMonthCases,
        trend,
        thresholdBreach,
        caseThreshold,
      },
      disclaimer: PREDICTION_DISCLAIMER,
    };
  },

  async getBarangayPredictions(query: BarangayPredictionQuery, user: AuthUser) {
    const limit = Math.min(20, Math.max(1, parseInt(query.limit ?? '10', 10) || 10));
    const monthsCount = 12;

    let caseThreshold: number | null = null;
    if (query.diseaseId) {
      const disease = await diseaseRepository.findById(query.diseaseId);
      caseThreshold = disease?.caseThreshold ?? null;
    }

    const scopedBarangay = scopeByRole(user, query.barangayId);
    let barangays = await dashboardRepository.listBarangays();
    if (scopedBarangay) {
      barangays = barangays.filter((b) => b.id === scopedBarangay);
    }

    const predictions = await Promise.all(
      barangays.map(async (b) => {
        const where: Prisma.CaseWhereInput = { barangayId: b.id };
        if (query.diseaseId) where.diseaseId = query.diseaseId;

        const historical = await buildMonthlySeries(monthsCount, where);
        const values = historical.map((h) => h.cases);
        const result = runForecast(values, 1, { seasonal: false });
        const predictedCases = result.predictions[0] ?? 0;
        const trend = inferTrend(values, predictedCases);

        return {
          id: b.id,
          name: b.name,
          predictedCases,
          lower: result.lower[0] ?? 0,
          upper: result.upper[0] ?? 0,
          trend,
          riskLevel: riskLevelFromPrediction(predictedCases, caseThreshold),
        };
      })
    );

    return predictions.sort((a, b) => b.predictedCases - a.predictedCases).slice(0, limit);
  },
};
