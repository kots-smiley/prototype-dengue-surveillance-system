import { prisma } from '../../configuration/prisma';
import { consentService } from '../consent/consent.service';
import { fhirService } from '../fhir/fhir.service';
import { AppError } from '../../helper/app-error';
import { logger } from '../../helper/logger';
import { AuthUser } from '../../types';
import { HieAccessQuery } from './hie.schema';

/**
 * Health Information Exchange: lets a clinician at one facility access a
 * patient's cross-facility record, gated by the patient's consent directives
 * (ISO 22600). Every access is recorded as an audit event (ISO 27799),
 * including break-glass emergency overrides.
 */
async function recordAccess(params: {
  user: AuthUser;
  patientId: string;
  purpose: string;
  breakGlass: boolean;
  granted: boolean;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.user.id,
        action: params.granted ? 'HIE_ACCESS_GRANTED' : 'HIE_ACCESS_DENIED',
        resource: 'PATIENT',
        resourceId: params.patientId,
        purposeOfUse: params.purpose,
        facilityId: params.user.facilityId ?? undefined,
        breakGlass: params.breakGlass,
        details: JSON.stringify({ via: 'HIE' }),
      },
    });
  } catch (error) {
    logger.error('Failed to record HIE access event', error);
  }
}

export const hieService = {
  /** Cross-facility encounter timeline for a patient (lightweight summary). */
  async timeline(patientId: string) {
    const encounters = await prisma.encounter.findMany({
      where: { patientId },
      orderBy: { encounterDate: 'desc' },
      include: {
        facility: true,
        diagnoses: { include: { disease: true } },
        clinician: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
    return encounters;
  },

  async getSharedRecord(patientId: string, user: AuthUser, query: HieAccessQuery) {
    const purpose = query.purpose;
    const breakGlass = query.breakGlass === 'true';

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError('Patient not found', 404);

    const consented = await consentService.hasConsent({
      patientId,
      requestingFacilityId: user.facilityId,
      purpose,
    });

    const granted = consented || breakGlass;
    await recordAccess({ user, patientId, purpose, breakGlass, granted });

    if (!granted) {
      throw new AppError(
        'Patient consent does not permit cross-facility access for this purpose. Use emergency (break-glass) access if clinically necessary.',
        403
      );
    }

    const [summary, timeline] = await Promise.all([
      fhirService.getSummary(patientId),
      this.timeline(patientId),
    ]);

    return { summary, timeline, breakGlass, purpose };
  },
};
