import { prisma } from '../config/prisma';
import { TipoExercicio, IntensidadeExercicio } from '@prisma/client';

export const exerciseRepository = {
  findByMemberId(membroId: string, limit = 30) {
    return prisma.registroExercicio.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: limit });
  },

  findById(id: string) {
    return prisma.registroExercicio.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string; tipo: TipoExercicio; duracaoMin: number; distanciaKm?: number;
    caloriasEst?: number; intensidade: IntensidadeExercicio; observacoes?: string; dataHora: Date;
  }) {
    return prisma.registroExercicio.create({ data });
  },

  delete(id: string) {
    return prisma.registroExercicio.delete({ where: { id } });
  },

  weeklyStats(membroId: string) {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return prisma.registroExercicio.findMany({
      where: { membroId, dataHora: { gte: weekAgo } },
      orderBy: { dataHora: 'desc' },
    });
  },
};
