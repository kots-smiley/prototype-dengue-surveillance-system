import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const listInclude = {
  barangay: true,
  homeFacility: true,
  registeredBy: { select: { id: true, firstName: true, lastName: true, role: true } },
  _count: { select: { encounters: true } },
} satisfies Prisma.PatientInclude;

const detailInclude = {
  barangay: true,
  homeFacility: true,
  registeredBy: { select: { id: true, firstName: true, lastName: true, role: true } },
  allergies: { orderBy: { createdAt: 'desc' } },
  problems: { orderBy: { createdAt: 'desc' } },
  medications: { where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } },
  medicalHistoryEntries: { orderBy: { createdAt: 'desc' } },
  immunizations: { orderBy: { dateGiven: 'desc' } },
  maternalRecords: { orderBy: { visitDate: 'desc' } },
  labResults: { orderBy: { resultDate: 'desc' } },
  consents: { orderBy: { createdAt: 'desc' }, include: { grantedToFacility: true } },
  documents: { orderBy: { createdAt: 'desc' } },
  referrals: {
    orderBy: { createdAt: 'desc' },
    include: { fromFacility: true, toFacility: true },
  },
  cases: {
    orderBy: { dateReported: 'desc' },
    include: { disease: true, barangay: true },
  },
  encounters: {
    orderBy: { encounterDate: 'desc' },
    include: {
      facility: true,
      clinician: { select: { id: true, firstName: true, lastName: true, role: true } },
      vitalSign: true,
      diagnoses: { include: { disease: true } },
      prescriptions: true,
    },
  },
} satisfies Prisma.PatientInclude;

const portalInclude = {
  barangay: true,
  homeFacility: true,
  allergies: { orderBy: { createdAt: 'desc' as const } },
  problems: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' as const } },
  medications: { where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' as const } },
  immunizations: { orderBy: { dateGiven: 'desc' as const }, take: 20 },
  labResults: { where: { status: 'RESULTED' }, orderBy: { resultDate: 'desc' as const }, take: 20 },
  encounters: {
    orderBy: { encounterDate: 'desc' as const },
    take: 5,
    include: {
      facility: true,
      diagnoses: { where: { isPrimary: true }, take: 1 },
    },
  },
} satisfies Prisma.PatientInclude;

export const patientRepository = {
  findManyPaginated(where: Prisma.PatientWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.patient.findMany({
        where,
        include: listInclude,
        orderBy: { lastName: 'asc' },
        skip,
        take,
      }),
      prisma.patient.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.patient.findUnique({ where: { id }, include: detailInclude });
  },

  findByIdForPortal(id: string) {
    return prisma.patient.findUnique({ where: { id }, include: portalInclude });
  },

  findRawById(id: string) {
    return prisma.patient.findUnique({ where: { id } });
  },

  countAll() {
    return prisma.patient.count();
  },

  create(data: Prisma.PatientCreateInput) {
    return prisma.patient.create({ data, include: listInclude });
  },

  update(id: string, data: Prisma.PatientUpdateInput) {
    return prisma.patient.update({ where: { id }, data, include: listInclude });
  },

  delete(id: string) {
    return prisma.patient.delete({ where: { id } });
  },
};
