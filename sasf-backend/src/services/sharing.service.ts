import { sharingRepository } from '../repositories/sharing.repository';
import { auditRepository } from '../repositories/audit.repository';
import { userRepository } from '../repositories/user.repository';
import { familyMembersService } from './familyMembers.service';
import { generateShareToken } from '../utils/tokenGenerator';
import { CategoriaDado } from '@prisma/client';
import { conditionRepository } from '../repositories/condition.repository';
import { allergyRepository } from '../repositories/allergy.repository';
import { medicationRepository } from '../repositories/medication.repository';
import { emergencyContactRepository } from '../repositories/emergencyContact.repository';
import { vitalSignRepository } from '../repositories/vitalSign.repository';
import { symptomRepository } from '../repositories/symptom.repository';
import { professionalNoteRepository } from '../repositories/professionalNote.repository';
import { nutritionRepository } from '../repositories/nutrition.repository';
import { exerciseRepository } from '../repositories/exercise.repository';
import { psychologyRepository } from '../repositories/psychology.repository';
import { computeHealthScore } from './healthInsight.service';

async function validateActiveToken(codigoToken: string, profissionalId: string) {
  const token = await sharingRepository.findByToken(codigoToken);

  if (!token) {
    throw { status: 404, message: 'Token de acesso não encontrado.' };
  }
  if (token.profissionalId !== profissionalId) {
    throw { status: 403, message: 'Este token não pertence a você.' };
  }
  if (token.status === 'REVOGADO') {
    throw { status: 403, message: 'Este compartilhamento foi revogado.' };
  }
  if (token.dataExpiracao < new Date()) {
    throw { status: 403, message: 'Este compartilhamento expirou.' };
  }

  return token;
}

export const sharingService = {
  async list(userId: string) {
    return sharingRepository.findAllByUserId(userId);
  },

  async lookupProfessional(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.tipoPerfil !== 'PROFISSIONAL') {
      throw { status: 404, message: 'Profissional não encontrado com este e-mail.' };
    }

    return {
      id: user.id,
      nome: user.nome,
      statusConta: user.statusConta,
      categoriaConselho: user.profissionalDetalhe?.categoriaConselho ?? null,
      especialidade: user.profissionalDetalhe?.especialidade ?? null,
      statusValidacao: user.profissionalDetalhe?.statusValidacao ?? null,
    };
  },

  async getById(id: string, userId: string) {
    const token = await sharingRepository.findById(id);
    if (!token) {
      throw { status: 404, message: 'Compartilhamento não encontrado.' };
    }
    if (token.concedidoPorUsuarioId !== userId) {
      throw { status: 403, message: 'Acesso negado.' };
    }
    return token;
  },

  async create(
    userId: string,
    ip: string | undefined,
    data: {
      membroId: string;
      profissionalEmail: string;
      dataExpiracao: string;
      observacoes?: string;
      escopos: CategoriaDado[];
    },
  ) {
    await familyMembersService.getById(data.membroId, userId);

    const profissional = await userRepository.findByEmail(data.profissionalEmail);
    if (!profissional || profissional.tipoPerfil !== 'PROFISSIONAL') {
      throw { status: 404, message: 'Profissional não encontrado com este e-mail.' };
    }
    if (profissional.statusConta !== 'ATIVO') {
      throw { status: 400, message: 'Profissional ainda não foi aprovado pelo administrador.' };
    }

    const expiracao = new Date(data.dataExpiracao);
    if (expiracao <= new Date()) {
      throw { status: 400, message: 'Data de expiração deve ser futura.' };
    }

    const codigoToken = generateShareToken();

    const token = await sharingRepository.create({
      membroId: data.membroId,
      profissionalId: profissional.id,
      concedidoPorUsuarioId: userId,
      codigoToken,
      dataExpiracao: expiracao,
      observacoes: data.observacoes,
      escopos: data.escopos,
    });

    await auditRepository.log({
      userId,
      acao: 'COMPARTILHAMENTO_CRIADO',
      recurso: `token:${token.id}`,
      ip,
      detalhes: `Membro: ${data.membroId}, Profissional: ${profissional.email}, Escopos: ${data.escopos.join(',')}`,
    });

    return token;
  },

  async revoke(id: string, userId: string, ip: string | undefined) {
    const token = await this.getById(id, userId);

    if (token.status !== 'ATIVO') {
      throw { status: 400, message: 'Este compartilhamento já foi revogado ou expirou.' };
    }

    const revoked = await sharingRepository.revoke(id);

    await auditRepository.log({
      userId,
      acao: 'COMPARTILHAMENTO_REVOGADO',
      recurso: `token:${id}`,
      ip,
      detalhes: `Token revogado manualmente.`,
    });

    return revoked;
  },

  async getAccessLogs(id: string, userId: string) {
    await this.getById(id, userId);
    return sharingRepository.findAccessLogs(id);
  },

  async accessByToken(codigoToken: string, profissionalId: string, ip: string | undefined) {
    const token = await validateActiveToken(codigoToken, profissionalId);

    await auditRepository.log({
      userId: profissionalId,
      acao: 'ACESSO_POR_TOKEN',
      recurso: `token:${token.id}`,
      ip,
      detalhes: `Profissional acessou dados do membro ${token.membroId}.`,
    });

    const escopos = token.escopos.map((e: { categoriaDado: CategoriaDado }) => e.categoriaDado);

    const dados: Record<string, unknown> = {};
    if (escopos.includes('CONDICOES')) dados.condicoes = await conditionRepository.findAllByMemberId(token.membroId);
    if (escopos.includes('ALERGIAS')) dados.alergias = await allergyRepository.findAllByMemberId(token.membroId);
    if (escopos.includes('MEDICAMENTOS')) dados.medicamentos = await medicationRepository.findAllByMemberId(token.membroId);
    if (escopos.includes('CONTATOS')) dados.contatos = await emergencyContactRepository.findAllByMemberId(token.membroId);
    if (escopos.includes('VITAIS')) dados.sinaisVitais = (await vitalSignRepository.findAllByMemberId(token.membroId)).slice(0, 30);
    if (escopos.includes('SINTOMAS')) dados.sintomas = (await symptomRepository.findAllByMemberId(token.membroId)).slice(0, 30);
    if (escopos.includes('NUTRICAO')) {
      dados.nutricao = {
        perfil: await nutritionRepository.findProfile(token.membroId),
        pesoRecente: await nutritionRepository.findWeightRecords(token.membroId, 30),
        refeicoes: await nutritionRepository.findMeals(token.membroId),
      };
    }
    if (escopos.includes('EXERCICIOS')) dados.exercicios = await exerciseRepository.findByMemberId(token.membroId, 30);
    if (escopos.includes('PSICOLOGIA')) dados.psicologico = await psychologyRepository.findByMemberId(token.membroId, 30);
    if (escopos.includes('HEALTH_SCORE')) dados.healthScore = await computeHealthScore(token.membroId);

    return {
      membro: token.membro,
      concedidoPor: token.concedidoPor,
      escopos,
      dataExpiracao: token.dataExpiracao,
      dados,
    };
  },

  async listProfessionalTokens(profissionalId: string) {
    return sharingRepository.findActiveByProfessionalId(profissionalId);
  },

  async listNotes(codigoToken: string, profissionalId: string) {
    const token = await validateActiveToken(codigoToken, profissionalId);
    return professionalNoteRepository.findAllByMemberAndProfessional(token.membroId, profissionalId);
  },

  async createNote(codigoToken: string, profissionalId: string, texto: string) {
    const token = await validateActiveToken(codigoToken, profissionalId);
    return professionalNoteRepository.create({ membroId: token.membroId, profissionalId, texto });
  },

  async deleteNote(id: string, profissionalId: string) {
    const note = await professionalNoteRepository.findById(id);
    if (!note) {
      throw { status: 404, message: 'Anotação não encontrada.' };
    }
    if (note.profissionalId !== profissionalId) {
      throw { status: 403, message: 'Acesso negado.' };
    }
    return professionalNoteRepository.delete(id);
  },
};
