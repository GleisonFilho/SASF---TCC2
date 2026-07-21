import { api } from './api';
import type { ProfissionalDetalhe } from '../types';

export const adminService = {
  async listProfessionals(status?: string): Promise<ProfissionalDetalhe[]> {
    const params = status ? `?status=${status}` : '';
    const { data } = await api.get(`/admin/professionals${params}`);
    return data;
  },

  async getProfessional(id: string): Promise<ProfissionalDetalhe> {
    const { data } = await api.get(`/admin/professionals/${id}`);
    return data;
  },

  async approve(id: string): Promise<void> {
    await api.patch(`/admin/professionals/${id}/approve`);
  },

  async reject(id: string, motivo: string): Promise<void> {
    await api.patch(`/admin/professionals/${id}/reject`, { motivo });
  },
};
