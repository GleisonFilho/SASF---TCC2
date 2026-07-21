import { prisma } from '../config/prisma';

export const symptomRepository = {
  findAllByMemberId(membroId: string) {
    return prisma.registroSintoma.findMany({
      where: { membroId },
      orderBy: { dataHoraOcorrencia: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.registroSintoma.findUnique({ where: { id } });
  },

  create(data: {
    membroId: string;
    registradoPorUsuarioId: string;
    descricao: string;
    intensidade: number;
    dataHoraOcorrencia: Date;
    observacoes?: string;
  }) {
    return prisma.registroSintoma.create({ data });
  },

  delete(id: string) {
    return prisma.registroSintoma.delete({ where: { id } });
  },
};
