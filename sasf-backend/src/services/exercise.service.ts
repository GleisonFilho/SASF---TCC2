import { exerciseRepository } from '../repositories/exercise.repository';
import { familyMembersService } from './familyMembers.service';
import { TipoExercicio, IntensidadeExercicio } from '@prisma/client';

export const exerciseService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return exerciseRepository.findByMemberId(membroId);
  },

  async create(membroId: string, userId: string, data: {
    tipo: TipoExercicio; duracaoMin: number; distanciaKm?: number;
    caloriasEst?: number; intensidade: IntensidadeExercicio; observacoes?: string; dataHora: string;
  }) {
    await familyMembersService.getById(membroId, userId);
    return exerciseRepository.create({ membroId, ...data, dataHora: new Date(data.dataHora) });
  },

  async delete(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await exerciseRepository.findById(id);
    if (!record || record.membroId !== membroId) throw { status: 404, message: 'Exercício não encontrado.' };
    await exerciseRepository.delete(id);
  },

  async weeklyStats(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const records = await exerciseRepository.weeklyStats(membroId);
    const totalMin = records.reduce((s, r) => s + r.duracaoMin, 0);
    const totalCal = records.reduce((s, r) => s + (r.caloriasEst || 0), 0);
    return { totalMin, totalCal, totalSessions: records.length, records };
  },
};
