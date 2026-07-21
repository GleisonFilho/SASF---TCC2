import { prisma } from '../config/prisma';
import { StatusValidacao } from '@prisma/client';

export const professionalRepository = {
  findAll(status?: StatusValidacao) {
    return prisma.profissionalDetalhe.findMany({
      where: status ? { statusValidacao: status } : undefined,
      include: {
        usuario: { select: { id: true, nome: true, email: true, telefone: true, statusConta: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.profissionalDetalhe.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, email: true, telefone: true, statusConta: true, createdAt: true } },
        avaliadoPor: { select: { id: true, nome: true } },
      },
    });
  },

  async approve(id: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const prof = await tx.profissionalDetalhe.update({
        where: { id },
        data: { statusValidacao: 'APPROVED', avaliadoPorId: adminId, avaliadoEm: new Date() },
        include: { usuario: { select: { id: true, nome: true, email: true } } },
      });
      await tx.usuario.update({ where: { id: prof.usuarioId }, data: { statusConta: 'ATIVO' } });
      return prof;
    });
  },

  async reject(id: string, adminId: string, motivo: string) {
    return prisma.$transaction(async (tx) => {
      const prof = await tx.profissionalDetalhe.update({
        where: { id },
        data: { statusValidacao: 'REJECTED', avaliadoPorId: adminId, avaliadoEm: new Date(), motivoRejeicao: motivo },
        include: { usuario: { select: { id: true, nome: true, email: true } } },
      });
      await tx.usuario.update({ where: { id: prof.usuarioId }, data: { statusConta: 'BLOQUEADO' } });
      return prof;
    });
  },
};
