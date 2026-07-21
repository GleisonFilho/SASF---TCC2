import { conditionRepository } from '../repositories/condition.repository';
import { familyMembersService } from './familyMembers.service';
import { StatusCondicao } from '@prisma/client';

export const conditionsService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return conditionRepository.findAllByMemberId(membroId);
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);

    const condition = await conditionRepository.findById(id);

    if (!condition || condition.membroId !== membroId) {
      throw { status: 404, message: 'Condição de saúde não encontrada.' };
    }

    return condition;
  },

  async create(
    membroId: string,
    userId: string,
    data: {
      nomeCondicao: string;
      dataDiagnostico?: string;
      status?: StatusCondicao;
      observacoes?: string;
    },
  ) {
    await familyMembersService.getById(membroId, userId);

    return conditionRepository.create({
      membroId,
      nomeCondicao: data.nomeCondicao,
      ...(data.dataDiagnostico && { dataDiagnostico: new Date(data.dataDiagnostico) }),
      ...(data.status && { status: data.status }),
      ...(data.observacoes && { observacoes: data.observacoes }),
    });
  },

  async update(
    id: string,
    membroId: string,
    userId: string,
    data: {
      nomeCondicao?: string;
      dataDiagnostico?: string;
      status?: StatusCondicao;
      observacoes?: string;
    },
  ) {
    await this.getById(id, membroId, userId);

    return conditionRepository.update(id, {
      ...(data.nomeCondicao && { nomeCondicao: data.nomeCondicao }),
      ...(data.dataDiagnostico && { dataDiagnostico: new Date(data.dataDiagnostico) }),
      ...(data.status && { status: data.status }),
      ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await conditionRepository.delete(id);
  },
};
