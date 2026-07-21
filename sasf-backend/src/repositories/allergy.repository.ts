import { prisma } from '../config/prisma';
import { GravidadeAlergia } from '@prisma/client';

export const allergyRepository = {
  findAllByMemberId(membroId: string) {
    return prisma.alergia.findMany({
      where: { membroId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.alergia.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string;
    substancia: string;
    gravidade?: GravidadeAlergia;
    reacao?: string;
  }) {
    return prisma.alergia.create({ data });
  },

  update(id: string, data: Partial<{ substancia: string; gravidade: GravidadeAlergia; reacao: string }>) {
    return prisma.alergia.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.alergia.delete({ where: { id } });
  },
};
