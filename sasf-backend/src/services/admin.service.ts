import { professionalRepository } from '../repositories/professional.repository';
import { auditRepository } from '../repositories/audit.repository';
import { StatusValidacao } from '@prisma/client';

export const adminService = {
  async listProfessionals(status?: string) {
    const validStatus = status as StatusValidacao | undefined;
    return professionalRepository.findAll(validStatus);
  },

  async getProfessional(id: string) {
    const prof = await professionalRepository.findById(id);
    if (!prof) {
      throw { status: 404, message: 'Profissional não encontrado.' };
    }
    return prof;
  },

  async approve(id: string, adminId: string, ip: string | undefined) {
    const prof = await this.getProfessional(id);

    if (prof.statusValidacao !== 'PENDING') {
      throw { status: 400, message: `Profissional já foi ${prof.statusValidacao === 'APPROVED' ? 'aprovado' : 'rejeitado'}.` };
    }

    const updated = await professionalRepository.approve(id, adminId);

    await auditRepository.log({
      userId: adminId,
      acao: 'PROFISSIONAL_APROVADO',
      recurso: `profissional:${id}`,
      ip,
      detalhes: `Profissional ${prof.usuario.nome} (${prof.registroProfissional}) aprovado.`,
    });

    return updated;
  },

  async reject(id: string, adminId: string, motivo: string, ip: string | undefined) {
    const prof = await this.getProfessional(id);

    if (prof.statusValidacao !== 'PENDING') {
      throw { status: 400, message: `Profissional já foi ${prof.statusValidacao === 'APPROVED' ? 'aprovado' : 'rejeitado'}.` };
    }

    const updated = await professionalRepository.reject(id, adminId, motivo);

    await auditRepository.log({
      userId: adminId,
      acao: 'PROFISSIONAL_REJEITADO',
      recurso: `profissional:${id}`,
      ip,
      detalhes: `Profissional ${prof.usuario.nome} rejeitado. Motivo: ${motivo}`,
    });

    return updated;
  },
};
