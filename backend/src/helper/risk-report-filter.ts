import { Prisma } from '@prisma/client';
import { RiskReportStatus } from '../configuration/constants';

/** Match approved reports, including legacy rows created before the status field existed. */
export const approvedRiskReportWhere = {
  OR: [
    { status: RiskReportStatus.APPROVED },
    // MongoDB-only: legacy documents may omit status even though the field is required in schema.
    { status: { isSet: false } },
  ],
} as Prisma.RiskReportWhereInput;

export function withApprovedRiskReports(
  where: Prisma.RiskReportWhereInput = {}
): Prisma.RiskReportWhereInput {
  return {
    AND: [approvedRiskReportWhere, where],
  };
}
