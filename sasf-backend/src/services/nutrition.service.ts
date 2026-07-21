import { nutritionRepository } from '../repositories/nutrition.repository';
import { familyMembersService } from './familyMembers.service';
import { TipoRefeicao } from '@prisma/client';

function calcIMC(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  return Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10;
}

export const nutritionService = {
  async getProfile(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.findProfile(membroId);
  },

  async upsertProfile(membroId: string, userId: string, data: any) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.upsertProfile(membroId, data);
  },

  async listWeight(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.findWeightRecords(membroId);
  },

  async createWeight(membroId: string, userId: string, data: { pesoKg: number; dataHora: string }) {
    await familyMembersService.getById(membroId, userId);
    const profile = await nutritionRepository.findProfile(membroId);
    let imc: number | undefined;
    if (profile?.alturaAtualCm) {
      imc = calcIMC(data.pesoKg, Number(profile.alturaAtualCm));
    }
    const record = await nutritionRepository.createWeightRecord({
      membroId, pesoKg: data.pesoKg, imc, dataHora: new Date(data.dataHora),
    });
    if (profile) {
      await nutritionRepository.upsertProfile(membroId, { pesoAtualKg: data.pesoKg });
    }
    return record;
  },

  async deleteWeight(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await nutritionRepository.findWeightRecordById(id);
    if (!record || record.membroId !== membroId) throw { status: 404, message: 'Registro não encontrado.' };
    await nutritionRepository.deleteWeightRecord(id);
  },

  async listWater(membroId: string, userId: string, date: string) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.findWaterRecords(membroId, new Date(date));
  },

  async createWater(membroId: string, userId: string, data: { quantidadeMl: number; dataHora: string }) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.createWaterRecord({ membroId, quantidadeMl: data.quantidadeMl, dataHora: new Date(data.dataHora) });
  },

  async deleteWater(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await nutritionRepository.findWaterRecordById(id);
    if (!record || record.membroId !== membroId) throw { status: 404, message: 'Registro não encontrado.' };
    await nutritionRepository.deleteWaterRecord(id);
  },

  async listMeals(membroId: string, userId: string, date?: string) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.findMeals(membroId, date ? new Date(date) : undefined);
  },

  async createMeal(membroId: string, userId: string, data: {
    tipo: TipoRefeicao; descricao: string; calorias?: number; dataHora: string; observacoes?: string;
  }) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.createMeal({ membroId, ...data, dataHora: new Date(data.dataHora) });
  },

  async deleteMeal(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await nutritionRepository.findMealById(id);
    if (!record || record.membroId !== membroId) throw { status: 404, message: 'Refeição não encontrada.' };
    await nutritionRepository.deleteMeal(id);
  },

  async listMealPlans(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return nutritionRepository.findMealPlans(membroId);
  },

  async createMealPlan(userId: string, data: {
    membroId: string; titulo: string; descricao?: string;
    metaCaloricaDia?: number; dataInicio: string; dataFim?: string; observacoes?: string;
  }) {
    return nutritionRepository.createMealPlan({
      ...data,
      profissionalId: userId,
      dataInicio: new Date(data.dataInicio),
      dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
    });
  },

  async updateMealPlan(id: string, userId: string, data: Partial<{
    titulo: string; descricao: string; metaCaloricaDia: number; ativo: boolean; dataFim: string; observacoes: string;
  }>) {
    const plan = await nutritionRepository.findMealPlanById(id);
    if (!plan) throw { status: 404, message: 'Plano não encontrado.' };
    if (plan.profissionalId !== userId) throw { status: 403, message: 'Acesso negado.' };
    const { dataFim, ...rest } = data;
    return nutritionRepository.updateMealPlan(id, {
      ...rest,
      ...(dataFim && { dataFim: new Date(dataFim) }),
    });
  },
};
