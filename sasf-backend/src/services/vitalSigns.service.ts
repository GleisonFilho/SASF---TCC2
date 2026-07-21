import { vitalSignRepository } from '../repositories/vitalSign.repository';
import { familyMembersService } from './familyMembers.service';
import { TipoMedicao } from '@prisma/client';

export const vitalSignsService = {
  async list(membroId: string, userId: string, filters?: { tipo?: string; de?: string; ate?: string }) {
    await familyMembersService.getById(membroId, userId);
    return vitalSignRepository.findAllByMemberId(membroId, {
      tipo: filters?.tipo as TipoMedicao | undefined,
      de: filters?.de ? new Date(filters.de) : undefined,
      ate: filters?.ate ? new Date(filters.ate) : undefined,
    });
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await vitalSignRepository.findById(id);
    if (!record || record.membroId !== membroId) {
      throw { status: 404, message: 'Sinal vital não encontrado.' };
    }
    return record;
  },

  async create(membroId: string, userId: string, data: {
    tipoMedicao: TipoMedicao;
    valorPrimario: number;
    valorSecundario?: number;
    unidade: string;
    dataHoraMedicao: string;
    observacoes?: string;
  }) {
    await familyMembersService.getById(membroId, userId);
    return vitalSignRepository.create({
      membroId,
      registradoPorUsuarioId: userId,
      tipoMedicao: data.tipoMedicao,
      valorPrimario: data.valorPrimario,
      valorSecundario: data.valorSecundario,
      unidade: data.unidade,
      dataHoraMedicao: new Date(data.dataHoraMedicao),
      observacoes: data.observacoes,
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await vitalSignRepository.delete(id);
  },
};
