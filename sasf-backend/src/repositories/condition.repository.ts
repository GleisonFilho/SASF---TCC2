import { prisma } from '../config/prisma';
import { StatusCondicao } from '@prisma/client';

export const conditionRepository = {
  findAllByMemberId(membroId: string) {
    return prisma.condicaoSaude.findMany({
      where: { membroId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.condicaoSaude.findUnique({
      where: { id },
    });
  },

  create(data: {
    membroId: string;
    nomeCondicao: string;
    dataDiagnostico?: Date;
    status?: StatusCondicao;
    observacoes?: string;
  }) {
    return prisma.condicaoSaude.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      nomeCondicao: string;
      dataDiagnostico: Date;
      status: StatusCondicao;
      observacoes: string;
    }>,
  ) {
    return prisma.condicaoSaude.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.condicaoSaude.delete({ where: { id } });
  },
};
