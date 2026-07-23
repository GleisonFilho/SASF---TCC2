import { prisma } from '../config/prisma';

export const professionalNoteRepository = {
  findAllByMemberAndProfessional(membroId: string, profissionalId: string) {
    return prisma.anotacaoProfissional.findMany({
      where: { membroId, profissionalId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.anotacaoProfissional.findUnique({ where: { id } });
  },

  create(data: { membroId: string; profissionalId: string; texto: string }) {
    return prisma.anotacaoProfissional.create({ data });
  },

  delete(id: string) {
    return prisma.anotacaoProfissional.delete({ where: { id } });
  },
};
