import { prisma } from '../config/prisma';
import { TipoPerfil, StatusConta } from '@prisma/client';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      include: { profissionalDetalhe: true },
    });
  },

  findById(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      include: { profissionalDetalhe: true },
    });
  },

  create(data: {
    nome: string;
    email: string;
    senhaHash: string;
    telefone?: string;
    tipoPerfil: TipoPerfil;
    statusConta?: StatusConta;
  }) {
    return prisma.usuario.create({ data });
  },

  createProfessional(
    userData: {
      nome: string;
      email: string;
      senhaHash: string;
      telefone?: string;
    },
    professionalData: {
      registroProfissional: string;
      categoriaConselho: string;
      ufConselho: string;
      especialidade?: string;
    },
  ) {
    return prisma.usuario.create({
      data: {
        ...userData,
        tipoPerfil: 'PROFISSIONAL',
        statusConta: 'PENDENTE',
        profissionalDetalhe: {
          create: professionalData,
        },
      },
      include: { profissionalDetalhe: true },
    });
  },

  update(id: string, data: Partial<{
    nome: string;
    telefone: string;
    fotoUrl: string;
    dataNascimento: Date;
    sexo: string;
    endereco: string;
    cidade: string;
    estado: string;
  }>) {
    return prisma.usuario.update({
      where: { id },
      data,
      include: { profissionalDetalhe: true },
    });
  },

  delete(id: string) {
    return prisma.usuario.delete({ where: { id } });
  },

  saveRefreshToken(usuarioId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { usuarioId, token, expiresAt },
    });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { usuario: { include: { profissionalDetalhe: true } } },
    });
  },

  deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  },

  deleteAllRefreshTokens(usuarioId: string) {
    return prisma.refreshToken.deleteMany({ where: { usuarioId } });
  },
};
