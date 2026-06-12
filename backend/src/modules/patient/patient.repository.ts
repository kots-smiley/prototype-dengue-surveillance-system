import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const listInclude = {
  barangay: true,
  homeFacility: true,
  _count: { select: { encounters: true } },
} satisfies Prisma.PatientInclude;

const detailInclude = {
  barangay: true,
  homeFacility: true,
  registeredBy: { select: { id: true, firstName: true, lastName: true, role: true } },
  allergies: { orderBy: { createdAt: 'desc' } },
  problems: { orderBy: { createdAt: 'desc' } },
  immunizations: { orderBy: { dateGiven: 'desc' } },
  maternalRecords: { orderBy: { visitDate: 'desc' } },
  labResults: { orderBy: { resultDate: 'desc' } },
  consents: { orderBy: { createdAt: 'desc' }, include: { grantedToFacility: true } },
  documents: { orderBy: { createdAt: 'desc' } },
  referrals: {
    orderBy: { createdAt: 'desc' },
    include: { fromFacility: true, toFacility: true },
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
