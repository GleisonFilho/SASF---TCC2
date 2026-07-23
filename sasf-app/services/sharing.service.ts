import { api } from './api';
import type { Compartilhamento, EscopoCompartilhamento, LogAcesso, AcessoProfissional, PacienteCompartilhado } from '../types';

export const sharingService = {
  async list(): Promise<Compartilhamento[]> {
    const { data } = await api.get('/sharing');
    return data;
  },

  async getById(id: string): Promise<Compartilhamento & { logsAcesso: LogAcesso[] }> {
    const { data } = await api.get(`/sharing/${id}`);
    return data;
  },

  async create(body: {
    membroId: string;
    profissionalEmail: string;
    dataExpiracao: string;
    observacoes?: string;
    escopos: EscopoCompartilhamento[];
  }): Promise<Compartilhamento> {
    const { data } = await api.post('/sharing', body);
    return data;
  },

  async revoke(id: string): Promise<void> {
    await api.patch(`/sharing/${id}/revoke`);
  },

  async listProfessionalAccess(): Promise<AcessoProfissional[]> {
    const { data } = await api.get('/professional/shared-access');
    return data;
  },

  async getPatientData(token: string): Promise<PacienteCompartilhado> {
    const { data } = await api.get(`/professional/access/${token}`);
    return data;
  },
};
