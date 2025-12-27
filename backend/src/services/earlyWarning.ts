import { RiskLevel, AlertStatus } from '../types';
import { prisma } from '../utils/prisma';

// Rainy season months in the Philippines (typically June to November)
const RAINY_SEASON_MONTHS = [6, 7, 8, 9, 10, 11];

// Thresholds for early warning
const THRESHOLDS = {
  CASE_INCREASE_PERCENTAGE: 50, // 50% increase triggers warning
  CONSECUTIVE_MONTHS: 2, // 2 consecutive months of increase
  ENVIRONMENTAL_RISK_COUNT: 5, // 5+ environmental risk reports in a month
  CASE_COUNT_HIGH: 10 // 10+ cases in a month = high risk
};

/**
 * Check if current month is within rainy season
 */
function isRainySeason(date: Date = new Date()): boolean {
  return RAINY_SEASON_MONTHS.includes(date.getMonth() + 1);
}

/**
 * Calculate percentage increase between two numbers
 */
function calculateIncrease(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get case count for a specific month
 */
async function getCaseCountForMonth(barangayId: string, year: number, month: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return await prisma.dengueCase.count({
    where: {
      barangayId,
      dateReported: {
        gte: startDate,
        lte: endDate
      }
    }
  });
}

/**
 * Get environmental risk report count for a specific month
 */
async function getEnvironmentalRiskCountForMonth(
  barangayId: string,
  year: number,
  month: number
): Promise<number> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return await prisma.environmentalReport.count({
    where: {
      barangayId,
      dateReported: {
        gte: startDate,
        lte: endDate
      },
      OR: [
        { stagnantWater: true },
        { poorWasteDisposal: true },
        { cloggedDrainage: true },
        { housingCongestion: true }
      ]
    }
  });
}

/**
 * Determine risk level based on case count and trends
 */
function determineRiskLevel(
  currentMonthCases: number,
  previousMonthCases: number,
  increasePercentage: number,
  environmentalRisks: number,
  isRainy: boolean
): RiskLevel {
  // High risk conditions
  if (
    (currentMonthCases >= THRESHOLDS.CASE_COUNT_HIGH && isRainy) ||
    (increasePercentage >= THRESHOLDS.CASE_INCREASE_PERCENTAGE && isRainy && environmentalRisks >= THRESHOLDS.ENVIRONMENTAL_RISK_COUNT) ||
    (currentMonthCases >= THRESHOLDS.CASE_COUNT_HIGH && environmentalRisks >= THRESHOLDS.ENVIRONMENTAL_RISK_COUNT)
  ) {
    return RiskLevel.HIGH;
  }

  // Medium risk conditions
  if (
    (increasePercentage >= THRESHOLDS.CASE_INCREASE_PERCENTAGE && isRainy) ||
    (currentMonthCases >= 5 && environmentalRisks >= 3) ||
    (environmentalRisks >= THRESHOLDS.ENVIRONMENTAL_RISK_COUNT && isRainy)
  ) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.LOW;
}

/**
 * Check if alert should be triggered for a barangay
 */
export async function triggerEarlyWarningCheck(barangayId: string): Promise<void> {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get case counts
    const currentMonthCases = await getCaseCountForMonth(barangayId, currentYear, currentMonth);
    const previousMonthCases = await getCaseCountForMonth(barangayId, previousYear, previousMonth);
    const twoMonthsAgoCases = await getCaseCountForMonth(
      barangayId,
      previousMonth === 12 ? currentYear - 1 : currentYear,
      previousMonth === 1 ? 12 : previousMonth - 1
    );

    // Get environmental risk count
    const environmentalRisks = await getEnvironmentalRiskCountForMonth(
      barangayId,
      currentYear,
      currentMonth
    );

    // Calculate increases
    const currentIncrease = calculateIncrease(currentMonthCases, previousMonthCases);
    const previousIncrease = calculateIncrease(previousMonthCases, twoMonthsAgoCases);

    // Check if in rainy season
    const isRainy = isRainySeason(now);

    // Determine risk level
    const riskLevel = determineRiskLevel(
      currentMonthCases,
      previousMonthCases,
      currentIncrease,
      environmentalRisks,
      isRainy
    );

    // Check if we should create/update an alert
    const shouldAlert =
      riskLevel === RiskLevel.HIGH ||
      (riskLevel === RiskLevel.MEDIUM &&
        currentIncrease >= THRESHOLDS.CASE_INCREASE_PERCENTAGE &&
        previousIncrease >= THRESHOLDS.CASE_INCREASE_PERCENTAGE &&
        isRainy);

    if (shouldAlert) {
      // Check if there's already an active alert for this barangay
      const existingAlert = await prisma.alert.findFirst({
        where: {
          barangayId,
          status: AlertStatus.ACTIVE,
          riskLevel: riskLevel
        },
        orderBy: { triggeredAt: 'desc' }
      });

      if (!existingAlert) {
        // Create new alert
        const barangay = await prisma.barangay.findUnique({
          where: { id: barangayId }
        });

        const metadata = JSON.stringify({
          currentMonthCases,
          previousMonthCases,
          currentIncrease: currentIncrease.toFixed(2),
          previousIncrease: previousIncrease.toFixed(2),
          environmentalRisks,
          isRainySeason: isRainy,
          month: currentMonth,
          year: currentYear
        });

        await prisma.alert.create({
          data: {
            barangayId,
            title: `Early Warning Alert - ${barangay?.name || 'Barangay'}`,
            message: `High dengue risk detected. Current month: ${currentMonthCases} cases (${currentIncrease.toFixed(1)}% increase). Environmental risks: ${environmentalRisks}. ${isRainy ? 'Rainy season active.' : ''}`,
            riskLevel,
            status: AlertStatus.ACTIVE,
            metadata
          }
        });
      } else {
        // Update existing alert
        await prisma.alert.update({
          where: { id: existingAlert.id },
          data: {
            message: `High dengue risk detected. Current month: ${currentMonthCases} cases (${currentIncrease.toFixed(1)}% increase). Environmental risks: ${environmentalRisks}. ${isRainy ? 'Rainy season active.' : ''}`,
            riskLevel,
            metadata: JSON.stringify({
              currentMonthCases,
              previousMonthCases,
              currentIncrease: currentIncrease.toFixed(2),
              previousIncrease: previousIncrease.toFixed(2),
              environmentalRisks,
              isRainySeason: isRainy,
              month: currentMonth,
              year: currentYear
            })
          }
        });
      }
    } else {
      // If risk is low, resolve any active high/medium alerts
      const activeAlerts = await prisma.alert.findMany({
        where: {
          barangayId,
          status: AlertStatus.ACTIVE,
          riskLevel: { in: [RiskLevel.HIGH, RiskLevel.MEDIUM] }
        }
      });

      for (const alert of activeAlerts) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            status: AlertStatus.RESOLVED,
            resolvedAt: new Date()
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in early warning check:', error);
    // Don't throw - early warning is non-critical
  }
}


