import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import ms from '../utils/ms';

function parseRefreshExpiry(): Date {
  const milliseconds = ms(env.JWT_REFRESH_EXPIRES_IN);
  return new Date(Date.now() + milliseconds);
}

function buildTokenPayload(user: { id: string; tipoPerfil: string; statusConta: string }) {
  return {
    userId: user.id,
    tipoPerfil: user.tipoPerfil,
    statusConta: user.statusConta,
  };
}

export const authService = {
  async registerPatient(data: { nome: string; email: string; senha: string; telefone?: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { status: 409, message: 'E-mail já cadastrado.' };
    }

    const senhaHash = await hashPassword(data.senha);
    const user = await userRepository.create({
      nome: data.nome,
      email: data.email,
      senhaHash,
      telefone: data.telefone,
      tipoPerfil: 'PACIENTE',
      statusConta: 'ATIVO',
    });

    const payload = buildTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.saveRefreshToken(user.id, refreshToken, parseRefreshExpiry());

    return {
      user: { id: user.id, nome: user.nome, email: user.email, tipoPerfil: user.tipoPerfil, statusConta: user.statusConta },
      accessToken,
      refreshToken,
    };
  },

  async registerProfessional(data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    registroProfissional: string;
    categoriaConselho: string;
    ufConselho: string;
    especialidade?: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { status: 409, message: 'E-mail já cadastrado.' };
    }

    const senhaHash = await hashPassword(data.senha);
    const user = await userRepository.createProfessional(
      { nome: data.nome, email: data.email, senhaHash, telefone: data.telefone },
      {
        registroProfissional: data.registroProfissional,
        categoriaConselho: data.categoriaConselho,
        ufConselho: data.ufConselho,
        especialidade: data.especialidade,
      },
    );

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoPerfil: user.tipoPerfil,
        statusConta: user.statusConta,
        profissionalDetalhe: user.profissionalDetalhe,
      },
      message: 'Cadastro realizado. Aguarde a aprovação do administrador.',
    };
  },

  async login(data: { email: string; senha: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw { status: 401, message: 'E-mail ou senha inválidos.' };
    }

    if (user.statusConta === 'BLOQUEADO') {
      throw { status: 403, message: 'Conta bloqueada. Entre em contato com o suporte.' };
    }

    const senhaValida = await comparePassword(data.senha, user.senhaHash);
    if (!senhaValida) {
      throw { status: 401, message: 'E-mail ou senha inválidos.' };
    }

    const payload = buildTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.saveRefreshToken(user.id, refreshToken, parseRefreshExpiry());

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoPerfil: user.tipoPerfil,
        statusConta: user.statusConta,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshTokenValue: string) {
    const stored = await userRepository.findRefreshToken(refreshTokenValue);
    if (!stored) {
      throw { status: 401, message: 'Refresh token inválido.' };
    }

    if (stored.expiresAt < new Date()) {
      await userRepository.deleteRefreshToken(refreshTokenValue);
      throw { status: 401, message: 'Refresh token expirado.' };
    }

    const user = stored.usuario;
    if (user.statusConta === 'BLOQUEADO') {
      throw { status: 403, message: 'Conta bloqueada.' };
    }

    await userRepository.deleteRefreshToken(refreshTokenValue);

    const payload = buildTokenPayload(user);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await userRepository.saveRefreshToken(user.id, newRefreshToken, parseRefreshExpiry());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshTokenValue: string) {
    const stored = await userRepository.findRefreshToken(refreshTokenValue);
    if (stored) {
      await userRepository.deleteRefreshToken(refreshTokenValue);
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: 'Usuário não encontrado.' };
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      fotoUrl: user.fotoUrl,
      dataNascimento: user.dataNascimento,
      sexo: user.sexo,
      endereco: user.endereco,
      cidade: user.cidade,
      estado: user.estado,
      tipoPerfil: user.tipoPerfil,
      statusConta: user.statusConta,
      profissionalDetalhe: user.profissionalDetalhe
        ? {
            registroProfissional: user.profissionalDetalhe.registroProfissional,
            categoriaConselho: user.profissionalDetalhe.categoriaConselho,
            ufConselho: user.profissionalDetalhe.ufConselho,
            especialidade: user.profissionalDetalhe.especialidade,
            statusValidacao: user.profissionalDetalhe.statusValidacao,
          }
        : null,
    };
  },
};
