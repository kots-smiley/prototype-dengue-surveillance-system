import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { ListTerminologyQuery } from './terminology.schema';
import { buildContainsOr } from '../../helper/text-search';

export const terminologyService = {
  async list(query: ListTerminologyQuery) {
    const where: Prisma.TerminologyConceptWhereInput = {};
    if (query.system) where.system = query.system;
    if (query.search) {
      where.OR = buildContainsOr(['code', 'display'], query.search.trim());
    }
    const concepts = await prisma.terminologyConcept.findMany({
      where,
      orderBy: [{ system: 'asc' }, { code: 'asc' }],
      take: 200,
    });
    return { concepts };
  },
};
