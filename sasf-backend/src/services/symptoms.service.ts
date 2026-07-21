import { symptomRepository } from '../repositories/symptom.repository';
import { familyMembersService } from './familyMembers.service';

export const symptomsService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return symptomRepository.findAllByMemberId(membroId);
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await symptomRepository.findById(id);
    if (!record || record.membroId !== membroId) {
      throw { status: 404, message: 'Sintoma não encontrado.' };
    }
    return record;
  },

  async create(membroId: string, userId: string, data: {
    descricao: string;
    intensidade: number;
    dataHoraOcorrencia: string;
    observacoes?: string;
  }) {
    await familyMembersService.getById(membroId, userId);
    return symptomRepository.create({
      membroId,
      registradoPorUsuarioId: userId,
      descricao: data.descricao,
      intensidade: data.intensidade,
      dataHoraOcorrencia: new Date(data.dataHoraOcorrencia),
      observacoes: data.observacoes,
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await symptomRepository.delete(id);
  },
};
