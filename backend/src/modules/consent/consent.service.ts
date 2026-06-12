import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { CreateConsentInput, ListConsentQuery } from './consent.schema';
import { AppError } from '../../helper/app-error';

export const consentService = {
  async list(query: ListConsentQuery) {
    const where: Prisma.ConsentWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    const consents = await prisma.consent.findMany({
      where,
      include: { grantedToFacility: true },
      orderBy: { createdAt: 'desc' },
    });
    return { consents };
  },

  async create(input: CreateConsentInput) {
    const { patientId, grantedToFacilityId, ...rest } = input;
    const data: Prisma.ConsentCreateInput = {
      ...rest,
      status: 'ACTIVE',
      patient: { connect: { id: patientId } },
    };
    if (grantedToFacilityId) data.grantedToFacility = { connect: { id: grantedToFacilityId } };
    return prisma.consent.create({ data, include: { grantedToFacility: true } });
  },

  async revoke(id: string) {
    const existing = await prisma.consent.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Consent not found', 404);
    }
    return prisma.consent.update({
      where: { id },
      data: { status: 'REVOKED' },
      include: { grantedToFacility: true },
    });
  },

  /**
   * Decide whether a requesting facility may access a patient's shared record
   * for a given purpose (ISO 22600 privilege management). Emergency purpose is
   * always permitted but must be break-glass audited by the caller.
   */
  async hasConsent(params: {
    patientId: string;
    requestingFacilityId?: string | null;
    purpose: 'TREATMENT' | 'EMERGENCY' | 'PUBLIC_HEALTH';
  }): Promise<boolean> {
    if (params.purpose === 'EMERGENCY') return true; // break-glass (audited separately)

    const now = new Date();
    const active = await prisma.consent.findMany({
      where: {
        patientId: params.patientId,
        status: 'ACTIVE',
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
    });

    return active.some((c) => {
      const purposeOk = c.purpose === params.purpose || c.purpose === 'TREATMENT';
      const facilityOk =
        !c.grantedToFacilityId || c.grantedToFacilityId === params.requestingFacilityId;
      return purposeOk && facilityOk;
    });
  },
};
