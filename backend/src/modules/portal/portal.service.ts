import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { patientRepository } from '../patient/patient.repository';
import { PortalConsentInput } from './portal.schema';
import { AppError } from '../../helper/app-error';

/** Resolve the Patient linked to the logged-in portal (RESIDENT) account. */
async function resolveMyPatientId(userId: string): Promise<string> {
  const patient = await prisma.patient.findFirst({ where: { userId } });
  if (!patient) {
    throw new AppError('No patient record is linked to your account', 404);
  }
  return patient.id;
}

export const portalService = {
  async getMyRecord(userId: string) {
    const patientId = await resolveMyPatientId(userId);
    const record = await patientRepository.findByIdForPortal(patientId);
    return { patient: record };
  },

  async listMyConsents(userId: string) {
    const patientId = await resolveMyPatientId(userId);
    const consents = await prisma.consent.findMany({
      where: { patientId },
      include: { grantedToFacility: true },
      orderBy: { createdAt: 'desc' },
    });
    return { consents };
  },

  async createMyConsent(userId: string, input: PortalConsentInput) {
    const patientId = await resolveMyPatientId(userId);
    const { grantedToFacilityId, ...rest } = input;
    const data: Prisma.ConsentCreateInput = {
      ...rest,
      status: 'ACTIVE',
      patient: { connect: { id: patientId } },
    };
    if (grantedToFacilityId) data.grantedToFacility = { connect: { id: grantedToFacilityId } };
    return prisma.consent.create({ data, include: { grantedToFacility: true } });
  },

  async revokeMyConsent(userId: string, consentId: string) {
    const patientId = await resolveMyPatientId(userId);
    const consent = await prisma.consent.findUnique({ where: { id: consentId } });
    if (!consent || consent.patientId !== patientId) {
      throw new AppError('Consent not found', 404);
    }
    return prisma.consent.update({
      where: { id: consentId },
      data: { status: 'REVOKED' },
      include: { grantedToFacility: true },
    });
  },
};
