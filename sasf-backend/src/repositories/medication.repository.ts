import { prisma } from '../config/prisma';

export const medicationRepository = {
  findAllByMemberId(membroId: string) {
    return prisma.medicamentoUso.findMany({
      where: { membroId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.medicamentoUso.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string;
    nomeMedicamento: string;
    dosagem?: string;
    frequencia?: string;
    dataInicio?: Date;
    dataFim?: Date;
    usoContinuo?: boolean;
  }) {
    return prisma.medicamentoUso.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      nomeMedicamento: string;
      dosagem: string;
      frequencia: string;
      dataInicio: Date;
      dataFim: Date;
      usoContinuo: boolean;
    }>,
  ) {
    return prisma.medicamentoUso.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.medicamentoUso.delete({ where: { id } });
  },
};
