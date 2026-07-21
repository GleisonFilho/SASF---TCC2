import { prisma } from '../config/prisma';
import { TipoMedicao } from '@prisma/client';

export const vitalSignRepository = {
  findAllByMemberId(membroId: string, filters?: { tipo?: TipoMedicao; de?: Date; ate?: Date }) {
    return prisma.sinalVital.findMany({
      where: {
        membroId,
        ...(filters?.tipo && { tipoMedicao: filters.tipo }),
        ...(filters?.de || filters?.ate
          ? {
              dataHoraMedicao: {
                ...(filters.de && { gte: filters.de }),
                ...(filters.ate && { lte: filters.ate }),
              },
            }
          : {}),
      },
      orderBy: { dataHoraMedicao: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.sinalVital.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string;
    registradoPorUsuarioId: string;
    tipoMedicao: TipoMedicao;
    valorPrimario: number;
    valorSecundario?: number;
    unidade: string;
    dataHoraMedicao: Date;
    observacoes?: string;
  }) {
    return prisma.sinalVital.create({ data });
  },

  delete(id: string) {
    return prisma.sinalVital.delete({ where: { id } });
  },
};
