import { prisma } from '../config/prisma';

export const auditRepository = {
  log(data: {
    userId: string;
    acao: string;
    recurso: string;
    ip?: string | null;
    detalhes?: string;
  }) {
    return prisma.auditLog.create({ data });
  },

  findByUserId(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { dataHora: 'desc' },
      take: limit,
    });
  },
};
