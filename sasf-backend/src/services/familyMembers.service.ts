import { familyMemberRepository } from '../repositories/familyMember.repository';

export const familyMembersService = {
  async list(userId: string) {
    return familyMemberRepository.findAllByUserId(userId);
  },

  async getById(id: string, userId: string) {
    const member = await familyMemberRepository.findById(id);

    if (!member) {
      throw { status: 404, message: 'Membro não encontrado.' };
    }

    if (member.usuarioResponsavelId !== userId) {
      throw { status: 403, message: 'Acesso negado. Este membro não pertence à sua família.' };
    }

    return member;
  },

  async create(userId: string, data: { nome: string; dataNascimento: string; sexo: string; parentesco: string }) {
    return familyMemberRepository.create({
      usuarioResponsavelId: userId,
      nome: data.nome,
      dataNascimento: new Date(data.dataNascimento),
      sexo: data.sexo,
      parentesco: data.parentesco,
    });
  },

  async update(
    id: string,
    userId: string,
    data: { nome?: string; dataNascimento?: string; sexo?: string; parentesco?: string },
  ) {
    await this.getById(id, userId);

    return familyMemberRepository.update(id, {
      ...(data.nome && { nome: data.nome }),
      ...(data.dataNascimento && { dataNascimento: new Date(data.dataNascimento) }),
      ...(data.sexo && { sexo: data.sexo }),
      ...(data.parentesco && { parentesco: data.parentesco }),
    });
  },

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await familyMemberRepository.delete(id);
  },
};
