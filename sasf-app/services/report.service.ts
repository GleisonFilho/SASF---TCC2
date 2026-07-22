import { api } from './api';
import type { RelatorioSaude } from '../types';

export const reportService = {
  async get(membroId: string): Promise<RelatorioSaude> {
    const { data } = await api.get(`/family-members/${membroId}/report`);
    return data;
  },
};
