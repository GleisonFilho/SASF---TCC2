import { prisma } from '../config/prisma';

export const psychologyRepository = {
  findByMemberId(membroId: string, limit = 30) {
    return prisma.registroPsicologico.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: limit });
  },

  findById(id: string) {
    return prisma.registroPsicologico.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string; humor: number; ansiedade: number; estresse: number;
    qualidadeSono: number; energia: number; observacoes?: string; dataHora: Date;
  }) {
    return prisma.registroPsicologico.create({ data });
  },

  delete(id: string) {
    return prisma.registroPsicologico.delete({ where: { id } });
  },
};
