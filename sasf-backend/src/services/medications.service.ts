import { medicationRepository } from '../repositories/medication.repository';
import { familyMembersService } from './familyMembers.service';

export const medicationsService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return medicationRepository.findAllByMemberId(membroId);
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const medication = await medicationRepository.findById(id);
    if (!medication || medication.membroId !== membroId) {
      throw { status: 404, message: 'Medicamento não encontrado.' };
    }
    return medication;
  },

  async create(
    membroId: string,
    userId: string,
    data: {
      nomeMedicamento: string;
      dosagem?: string;
      frequencia?: string;
      dataInicio?: string;
      dataFim?: string;
      usoContinuo?: boolean;
    },
  ) {
    await familyMembersService.getById(membroId, userId);
    return medicationRepository.create({
      membroId,
      nomeMedicamento: data.nomeMedicamento,
      ...(data.dosagem && { dosagem: data.dosagem }),
      ...(data.frequencia && { frequencia: data.frequencia }),
      ...(data.dataInicio && { dataInicio: new Date(data.dataInicio) }),
      ...(data.dataFim && { dataFim: new Date(data.dataFim) }),
      ...(data.usoContinuo !== undefined && { usoContinuo: data.usoContinuo }),
    });
  },

  async update(
    id: string,
    membroId: string,
    userId: string,
    data: {
      nomeMedicamento?: string;
      dosagem?: string;
      frequencia?: string;
      dataInicio?: string;
      dataFim?: string;
      usoContinuo?: boolean;
    },
  ) {
    await this.getById(id, membroId, userId);
    return medicationRepository.update(id, {
      ...(data.nomeMedicamento && { nomeMedicamento: data.nomeMedicamento }),
      ...(data.dosagem !== undefined && { dosagem: data.dosagem }),
      ...(data.frequencia !== undefined && { frequencia: data.frequencia }),
      ...(data.dataInicio && { dataInicio: new Date(data.dataInicio) }),
      ...(data.dataFim && { dataFim: new Date(data.dataFim) }),
      ...(data.usoContinuo !== undefined && { usoContinuo: data.usoContinuo }),
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await medicationRepository.delete(id);
  },
};
