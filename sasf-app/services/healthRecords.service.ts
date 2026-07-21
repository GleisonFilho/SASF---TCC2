import { api } from './api';
import type { CondicaoSaude, Alergia, MedicamentoUso, ContatoEmergencia, SinalVital, RegistroSintoma } from '../types';

export const healthRecordsService = {
  async listConditions(membroId: string): Promise<CondicaoSaude[]> {
    const { data } = await api.get(`/family-members/${membroId}/conditions`);
    return data;
  },

  async createCondition(membroId: string, body: { nomeCondicao: string; dataDiagnostico?: string; status?: string; observacoes?: string }): Promise<CondicaoSaude> {
    const { data } = await api.post(`/family-members/${membroId}/conditions`, body);
    return data;
  },

  async deleteCondition(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/conditions/${id}`);
  },

  async listAllergies(membroId: string): Promise<Alergia[]> {
    const { data } = await api.get(`/family-members/${membroId}/allergies`);
    return data;
  },

  async createAllergy(membroId: string, body: { substancia: string; gravidade?: string; reacao?: string }): Promise<Alergia> {
    const { data } = await api.post(`/family-members/${membroId}/allergies`, body);
    return data;
  },

  async deleteAllergy(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/allergies/${id}`);
  },

  async listMedications(membroId: string): Promise<MedicamentoUso[]> {
    const { data } = await api.get(`/family-members/${membroId}/medications`);
    return data;
  },

  async createMedication(membroId: string, body: {
    nomeMedicamento: string;
    dosagem?: string;
    frequencia?: string;
    dataInicio?: string;
    dataFim?: string;
    usoContinuo?: boolean;
  }): Promise<MedicamentoUso> {
    const { data } = await api.post(`/family-members/${membroId}/medications`, body);
    return data;
  },

  async deleteMedication(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/medications/${id}`);
  },

  async listEmergencyContacts(membroId: string): Promise<ContatoEmergencia[]> {
    const { data } = await api.get(`/family-members/${membroId}/emergency-contacts`);
    return data;
  },

  async createEmergencyContact(membroId: string, body: { nome: string; parentesco: string; telefone: string }): Promise<ContatoEmergencia> {
    const { data } = await api.post(`/family-members/${membroId}/emergency-contacts`, body);
    return data;
  },

  async deleteEmergencyContact(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/emergency-contacts/${id}`);
  },

  async listVitalSigns(membroId: string, tipo?: string): Promise<SinalVital[]> {
    const params = tipo ? `?tipo=${tipo}` : '';
    const { data } = await api.get(`/family-members/${membroId}/vital-signs${params}`);
    return data;
  },

  async createVitalSign(membroId: string, body: {
    tipoMedicao: string;
    valorPrimario: number;
    valorSecundario?: number;
    unidade: string;
    dataHoraMedicao: string;
    observacoes?: string;
  }): Promise<SinalVital> {
    const { data } = await api.post(`/family-members/${membroId}/vital-signs`, body);
    return data;
  },

  async deleteVitalSign(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/vital-signs/${id}`);
  },

  async listSymptoms(membroId: string): Promise<RegistroSintoma[]> {
    const { data } = await api.get(`/family-members/${membroId}/symptoms`);
    return data;
  },

  async createSymptom(membroId: string, body: {
    descricao: string;
    intensidade: number;
    dataHoraOcorrencia: string;
    observacoes?: string;
  }): Promise<RegistroSintoma> {
    const { data } = await api.post(`/family-members/${membroId}/symptoms`, body);
    return data;
  },

  async deleteSymptom(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/symptoms/${id}`);
  },
};
