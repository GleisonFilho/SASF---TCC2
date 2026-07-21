import { emergencyContactRepository } from '../repositories/emergencyContact.repository';
import { familyMembersService } from './familyMembers.service';

export const emergencyContactsService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return emergencyContactRepository.findAllByMemberId(membroId);
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const contact = await emergencyContactRepository.findById(id);
    if (!contact || contact.membroId !== membroId) {
      throw { status: 404, message: 'Contato de emergência não encontrado.' };
    }
    return contact;
  },

  async create(membroId: string, userId: string, data: { nome: string; parentesco: string; telefone: string }) {
    await familyMembersService.getById(membroId, userId);
    return emergencyContactRepository.create({ membroId, ...data });
  },

  async update(id: string, membroId: string, userId: string, data: { nome?: string; parentesco?: string; telefone?: string }) {
    await this.getById(id, membroId, userId);
    return emergencyContactRepository.update(id, {
      ...(data.nome && { nome: data.nome }),
      ...(data.parentesco && { parentesco: data.parentesco }),
      ...(data.telefone && { telefone: data.telefone }),
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await emergencyContactRepository.delete(id);
  },
};
