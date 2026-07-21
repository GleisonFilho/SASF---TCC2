import { psychologyRepository } from '../repositories/psychology.repository';
import { familyMembersService } from './familyMembers.service';

export const psychologyService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return psychologyRepository.findByMemberId(membroId);
  },

  async create(membroId: string, userId: string, data: {
    humor: number; ansiedade: number; estresse: number;
    qualidadeSono: number; energia: number; observacoes?: string; dataHora: string;
  }) {
    await familyMembersService.getById(membroId, userId);
    return psychologyRepository.create({ membroId, ...data, dataHora: new Date(data.dataHora) });
  },

  async delete(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const record = await psychologyRepository.findById(id);
    if (!record || record.membroId !== membroId) throw { status: 404, message: 'Registro não encontrado.' };
    await psychologyRepository.delete(id);
  },
};
