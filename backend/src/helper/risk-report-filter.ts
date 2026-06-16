import { Prisma } from '@prisma/client';
import { RiskReportStatus } from '../configuration/constants';

/**
 * Match approved reports, including legacy rows that omit status.
 * Do not use `isSet` on `status` — it is required in the Prisma schema and
 * breaks MongoDB count queries at runtime.
 */
export const approvedRiskReportWhere: Prisma.RiskReportWhereInput = {
  NOT: {
    status: {
      in: [RiskReportStatus.PENDING, RiskReportStatus.REJECTED],
    },
  },
};

export function withApprovedRiskReports(
  where: Prisma.RiskReportWhereInput = {}
): Prisma.RiskReportWhereInput {
  if (Object.keys(where).length === 0) {
    return approvedRiskReportWhere;
  }
  return {
    AND: [approvedRiskReportWhere, where],
  };
}
