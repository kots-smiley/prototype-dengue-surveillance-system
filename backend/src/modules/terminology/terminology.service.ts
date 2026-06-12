import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { ListTerminologyQuery } from './terminology.schema';

export const terminologyService = {
  async list(query: ListTerminologyQuery) {
    const where: Prisma.TerminologyConceptWhereInput = {};
    if (query.system) where.system = query.system;
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { display: { contains: term, mode: 'insensitive' } },
      ];
    }
    const concepts = await prisma.terminologyConcept.findMany({
      where,
      orderBy: [{ system: 'asc' }, { code: 'asc' }],
      take: 200,
    });
    return { concepts };
  },
};
