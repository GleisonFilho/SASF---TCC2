import { prisma } from '../config/prisma';
import { CategoriaDado } from '@prisma/client';

export const sharingRepository = {
  findAllByUserId(userId: string) {
    return prisma.tokenAcesso.findMany({
      where: { concedidoPorUsuarioId: userId },
      include: {
        escopos: true,
        membro: { select: { id: true, nome: true, parentesco: true } },
        profissional: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { dataCriacao: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.tokenAcesso.findUnique({
      where: { id },
      include: {
        escopos: true,
        membro: { select: { id: true, nome: true, parentesco: true } },
        profissional: { select: { id: true, nome: true, email: true } },
        logsAcesso: { orderBy: { dataHoraAcesso: 'desc' }, take: 50 },
      },
    });
  },

  findByToken(codigoToken: string) {
    return prisma.tokenAcesso.findUnique({
      where: { codigoToken },
      include: {
        escopos: true,
        membro: true,
        concedidoPor: { select: { id: true, nome: true } },
      },
    });
  },

  findActiveByProfessionalId(profissionalId: string) {
    return prisma.tokenAcesso.findMany({
      where: {
        profissionalId,
        status: 'ATIVO',
        dataExpiracao: { gt: new Date() },
      },
      include: {
        escopos: true,
        membro: { select: { id: true, nome: true, parentesco: true } },
        concedidoPor: { select: { id: true, nome: true } },
      },
      orderBy: { dataCriacao: 'desc' },
    });
  },

  create(data: {
    membroId: string;
    profissionalId: string;
    concedidoPorUsuarioId: string;
    codigoToken: string;
    dataExpiracao: Date;
    observacoes?: string;
    escopos: CategoriaDado[];
  }) {
    const { escopos, ...tokenData } = data;
    return prisma.tokenAcesso.create({
      data: {
        ...tokenData,
        escopos: { create: escopos.map((categoriaDado) => ({ categoriaDado })) },
      },
      include: {
        escopos: true,
        membro: { select: { id: true, nome: true, parentesco: true } },
        profissional: { select: { id: true, nome: true, email: true } },
      },
    });
  },

  revoke(id: string) {
    return prisma.tokenAcesso.update({
      where: { id },
      data: { status: 'REVOGADO', dataRevogacao: new Date() },
      include: { escopos: true },
    });
  },

  findAccessLogs(tokenId: string) {
    return prisma.logAcessoDados.findMany({
      where: { tokenId },
      orderBy: { dataHoraAcesso: 'desc' },
    });
  },
};
