import { prisma } from '../config/prisma';

export const emergencyContactRepository = {
  findAllByMemberId(membroId: string) {
    return prisma.contatoEmergencia.findMany({
      where: { membroId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.contatoEmergencia.findUnique({ where: { id } });
  },

  create(data: { membroId: string; nome: string; parentesco: string; telefone: string }) {
    return prisma.contatoEmergencia.create({ data });
  },

  update(id: string, data: Partial<{ nome: string; parentesco: string; telefone: string }>) {
    return prisma.contatoEmergencia.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.contatoEmergencia.delete({ where: { id } });
  },
};
