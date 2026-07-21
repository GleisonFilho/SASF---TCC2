import { prisma } from '../config/prisma';
import { TipoRefeicao } from '@prisma/client';

export const nutritionRepository = {
  findProfile(membroId: string) {
    return prisma.perfilNutricional.findUnique({ where: { membroId } });
  },

  upsertProfile(membroId: string, data: {
    alturaAtualCm?: number; pesoAtualKg?: number; metaPesoKg?: number;
    percentualGordura?: number; circunferenciaAbdominal?: number; metaAguaMl?: number;
  }) {
    return prisma.perfilNutricional.upsert({
      where: { membroId },
      update: data,
      create: { membroId, ...data },
    });
  },

  findWeightRecords(membroId: string, limit = 30) {
    return prisma.registroPeso.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: limit });
  },

  createWeightRecord(data: { membroId: string; pesoKg: number; imc?: number; dataHora: Date }) {
    return prisma.registroPeso.create({ data });
  },

  deleteWeightRecord(id: string) {
    return prisma.registroPeso.delete({ where: { id } });
  },

  findWeightRecordById(id: string) {
    return prisma.registroPeso.findUnique({ where: { id } });
  },

  findWaterRecords(membroId: string, date: Date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    return prisma.registroAgua.findMany({
      where: { membroId, dataHora: { gte: start, lte: end } },
      orderBy: { dataHora: 'desc' },
    });
  },

  createWaterRecord(data: { membroId: string; quantidadeMl: number; dataHora: Date }) {
    return prisma.registroAgua.create({ data });
  },

  deleteWaterRecord(id: string) {
    return prisma.registroAgua.delete({ where: { id } });
  },

  findWaterRecordById(id: string) {
    return prisma.registroAgua.findUnique({ where: { id } });
  },

  findMeals(membroId: string, date?: Date) {
    const where: any = { membroId };
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      where.dataHora = { gte: start, lte: end };
    }
    return prisma.registroRefeicao.findMany({ where, orderBy: { dataHora: 'desc' }, take: 50 });
  },

  createMeal(data: {
    membroId: string; tipo: TipoRefeicao; descricao: string;
    calorias?: number; dataHora: Date; observacoes?: string;
  }) {
    return prisma.registroRefeicao.create({ data });
  },

  findMealById(id: string) {
    return prisma.registroRefeicao.findUnique({ where: { id } });
  },

  deleteMeal(id: string) {
    return prisma.registroRefeicao.delete({ where: { id } });
  },

  findMealPlans(membroId: string) {
    return prisma.planoAlimentar.findMany({ where: { membroId }, orderBy: { createdAt: 'desc' } });
  },

  createMealPlan(data: {
    membroId: string; profissionalId: string; titulo: string; descricao?: string;
    metaCaloricaDia?: number; dataInicio: Date; dataFim?: Date; observacoes?: string;
  }) {
    return prisma.planoAlimentar.create({ data });
  },

  findMealPlanById(id: string) {
    return prisma.planoAlimentar.findUnique({ where: { id } });
  },

  updateMealPlan(id: string, data: Partial<{
    titulo: string; descricao: string; metaCaloricaDia: number;
    ativo: boolean; dataFim: Date; observacoes: string;
  }>) {
    return prisma.planoAlimentar.update({ where: { id }, data });
  },
};
