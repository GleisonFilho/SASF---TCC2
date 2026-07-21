import { prisma } from '../config/prisma';

export const familyMemberRepository = {
  findAllByUserId(usuarioResponsavelId: string) {
    return prisma.membroFamilia.findMany({ where: { usuarioResponsavelId } });
  },

  findById(id: string) {
    return prisma.membroFamilia.findUnique({ where: { id } });
  },

  create(data: {
    usuarioResponsavelId: string;
    nome: string;
    dataNascimento: Date;
    sexo: string;
    parentesco: string;
  }) {
    return prisma.membroFamilia.create({ data });
  },

  update(id: string, data: Partial<{ nome: string; dataNascimento: Date; sexo: string; parentesco: string }>) {
    return prisma.membroFamilia.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.membroFamilia.delete({ where: { id } });
  },
};
