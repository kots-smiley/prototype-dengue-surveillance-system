import { prisma } from '../../configuration/prisma';
import { Prisma } from '@prisma/client';

const include = {
  patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, sex: true, birthDate: true } },
  barangay: true,
  clinician: { select: { id: true, firstName: true, lastName: true, role: true } },
  vitalSign: true,
  diagnoses: { include: { disease: true } },
  prescriptions: true,
} satisfies Prisma.EncounterInclude;

export const encounterRepository = {
  findManyPaginated(where: Prisma.EncounterWhereInput, skip: number, take: number) {
    return prisma.$transaction([
      prisma.encounter.findMany({
        where,
        include,
        orderBy: { encounterDate: 'desc' },
        skip,
        take,
      }),
      prisma.encounter.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.encounter.findUnique({ where: { id }, include });
  },

  create(data: Prisma.EncounterCreateInput) {
    return prisma.encounter.create({ data, include });
  },

  delete(id: string) {
    return prisma.encounter.delete({ where: { id } });
  },
};
