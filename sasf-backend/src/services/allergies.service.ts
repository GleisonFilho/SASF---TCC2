import { allergyRepository } from '../repositories/allergy.repository';
import { familyMembersService } from './familyMembers.service';
import { GravidadeAlergia } from '@prisma/client';

export const allergiesService = {
  async list(membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    return allergyRepository.findAllByMemberId(membroId);
  },

  async getById(id: string, membroId: string, userId: string) {
    await familyMembersService.getById(membroId, userId);
    const allergy = await allergyRepository.findById(id);
    if (!allergy || allergy.membroId !== membroId) {
      throw { status: 404, message: 'Alergia não encontrada.' };
    }
    return allergy;
  },

  async create(membroId: string, userId: string, data: { substancia: string; gravidade?: GravidadeAlergia; reacao?: string }) {
    await familyMembersService.getById(membroId, userId);
    return allergyRepository.create({ membroId, ...data });
  },

  async update(id: string, membroId: string, userId: string, data: { substancia?: string; gravidade?: GravidadeAlergia; reacao?: string }) {
    await this.getById(id, membroId, userId);
    return allergyRepository.update(id, {
      ...(data.substancia && { substancia: data.substancia }),
      ...(data.gravidade && { gravidade: data.gravidade }),
      ...(data.reacao !== undefined && { reacao: data.reacao }),
    });
  },

  async delete(id: string, membroId: string, userId: string) {
    await this.getById(id, membroId, userId);
    await allergyRepository.delete(id);
  },
};
