import { earlyWarningRepository } from './early-warning.repository';
import { diseaseRepository } from '../disease/disease.repository';
import { RiskLevel } from '../../configuration/constants';
import { logger } from '../../helper/logger';

interface DiseaseRule {
  id: string;
  name: string;
  category: string;
  seasonalMonths: number[];
  caseThreshold: number;
  spikePercentage: number;
}

/** Percentage increase between two counts. */
function calculateIncrease(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Is the given month within the disease's elevated-transmission season? */
function isInSeason(seasonalMonths: number[], date: Date): boolean {
  if (!seasonalMonths || seasonalMonths.length === 0) return false;
  return seasonalMonths.includes(date.getMonth() + 1);
}

/**
 * Rule-based risk classification (NOT AI/ML). Uses the disease's own
 * configurable thresholds plus seasonality and environmental risk reports.
 */
function determineRiskLevel(params: {
  rule: DiseaseRule;
  currentMonthCases: number;
  increasePercentage: number;
  environmentalRisks: number;
  inSeason: boolean;
}): RiskLevel {
  const { rule, currentMonthCases, increasePercentage, environmentalRisks, inSeason } = params;
  const { caseThreshold, spikePercentage } = rule;

  const mediumCaseFloor = Math.max(1, Math.floor(caseThreshold / 2));

  // HIGH
  if (
    (currentMonthCases >= caseThreshold && inSeason) ||
    (increasePercentage >= spikePercentage && inSeason && environmentalRisks >= 5) ||
    (currentMonthCases >= caseThreshold && environmentalRisks >= 5)
  ) {
    return RiskLevel.HIGH;
  }

  // MEDIUM
  if (
    currentMonthCases >= caseThreshold ||
    (increasePercentage >= spikePercentage && inSeason) ||
    (currentMonthCases >= mediumCaseFloor && environmentalRisks >= 3) ||
    (environmentalRisks >= 5 && inSeason)
  ) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.LOW;
}

async function evaluateDisease(rule: DiseaseRule, barangayId: string): Promise<void> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [currentMonthCases, previousMonthCases, environmentalRisks] = await Promise.all([
    earlyWarningRepository.caseCountForMonth(rule.id, barangayId, currentYear, currentMonth),
    earlyWarningRepository.caseCountForMonth(rule.id, barangayId, previousYear, previousMonth),
    earlyWarningRepository.riskReportCountForMonth(
      rule.category,
      barangayId,
      currentYear,
      currentMonth
    ),
  ]);

  const increasePercentage = calculateIncrease(currentMonthCases, previousMonthCases);
  const inSeason = isInSeason(rule.seasonalMonths, now);

  const riskLevel = determineRiskLevel({
    rule,
    currentMonthCases,
    increasePercentage,
    environmentalRisks,
    inSeason,
  });

  const shouldAlert = riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.MEDIUM;

  if (!shouldAlert) {
    const active = await earlyWarningRepository.findActiveAlertsForDisease(rule.id, barangayId);
    await Promise.all(active.map((a) => earlyWarningRepository.resolveAlert(a.id)));
    return;
  }

  const metadata = JSON.stringify({
    currentMonthCases,
    previousMonthCases,
    increasePercentage: increasePercentage.toFixed(2),
    environmentalRisks,
    inSeason,
    month: currentMonth,
    year: currentYear,
    thresholds: { caseThreshold: rule.caseThreshold, spikePercentage: rule.spikePercentage },
  });

  const barangay = await earlyWarningRepository.getBarangay(barangayId);
  const message =
    `${riskLevel} risk for ${rule.name} in ${barangay?.name ?? 'barangay'}. ` +
    `This month: ${currentMonthCases} case(s) (${increasePercentage.toFixed(1)}% vs last month). ` +
    `Environmental risk reports: ${environmentalRisks}.` +
    (inSeason ? ' Seasonal transmission period is active.' : '');

  const existing = await earlyWarningRepository.findActiveAlert(rule.id, barangayId, riskLevel);
  if (existing) {
    await earlyWarningRepository.updateAlert(existing.id, { message, riskLevel, metadata });
  } else {
    await earlyWarningRepository.createAlert({
      barangayId,
      diseaseId: rule.id,
      title: `${rule.name} Early Warning – ${barangay?.name ?? 'Barangay'}`,
      message,
      riskLevel,
      metadata,
    });
  }
}

export const earlyWarningService = {
  /**
   * Re-evaluate early-warning alerts for a barangay.
   * If diseaseId is provided, only that disease is checked; otherwise all
   * active diseases are evaluated. Errors are swallowed (non-critical path).
   */
  async runCheck(barangayId: string, diseaseId?: string): Promise<void> {
    try {
      let rules: DiseaseRule[];

      if (diseaseId) {
        const disease = await diseaseRepository.findById(diseaseId);
        if (!disease || !disease.isActive) return;
        rules = [disease as unknown as DiseaseRule];
      } else {
        const diseases = await diseaseRepository.findMany({ isActive: true });
        rules = diseases as unknown as DiseaseRule[];
      }

      for (const rule of rules) {
        await evaluateDisease(rule, barangayId);
      }
    } catch (error) {
      logger.error('Early warning check failed', error);
    }
  },
};
