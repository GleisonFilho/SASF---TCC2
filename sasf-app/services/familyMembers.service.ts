import { api } from './api';
import type { MembroFamilia } from '../types';

export const familyMembersService = {
  async list(): Promise<MembroFamilia[]> {
    const { data } = await api.get('/family-members');
    return data;
  },

  async getById(id: string): Promise<MembroFamilia> {
    const { data } = await api.get(`/family-members/${id}`);
    return data;
  },

  async create(body: { nome: string; dataNascimento: string; sexo: string; parentesco: string }): Promise<MembroFamilia> {
    const { data } = await api.post('/family-members', body);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/family-members/${id}`);
  },
};
