import { api } from './api';
import type {
  PerfilNutricional, RegistroPeso, RegistroAgua, RegistroRefeicao,
  RegistroExercicio, ExerciseWeeklyStats, RegistroPsicologico, HealthInsight, HealthScoreResult,
} from '../types';

export const wellnessService = {
  async getNutritionProfile(membroId: string): Promise<PerfilNutricional | null> {
    const { data } = await api.get(`/family-members/${membroId}/nutrition/profile`);
    return Object.keys(data).length ? data : null;
  },
  async upsertNutritionProfile(membroId: string, body: any): Promise<PerfilNutricional> {
    const { data } = await api.put(`/family-members/${membroId}/nutrition/profile`, body);
    return data;
  },

  async listWeight(membroId: string): Promise<RegistroPeso[]> {
    const { data } = await api.get(`/family-members/${membroId}/nutrition/weight`);
    return data;
  },
  async createWeight(membroId: string, body: { pesoKg: number; dataHora: string }): Promise<RegistroPeso> {
    const { data } = await api.post(`/family-members/${membroId}/nutrition/weight`, body);
    return data;
  },
  async deleteWeight(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/nutrition/weight/${id}`);
  },

  async listWater(membroId: string, date?: string): Promise<RegistroAgua[]> {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get(`/family-members/${membroId}/nutrition/water${params}`);
    return data;
  },
  async createWater(membroId: string, body: { quantidadeMl: number; dataHora: string }): Promise<RegistroAgua> {
    const { data } = await api.post(`/family-members/${membroId}/nutrition/water`, body);
    return data;
  },

  async listMeals(membroId: string, date?: string): Promise<RegistroRefeicao[]> {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get(`/family-members/${membroId}/nutrition/meals${params}`);
    return data;
  },
  async createMeal(membroId: string, body: any): Promise<RegistroRefeicao> {
    const { data } = await api.post(`/family-members/${membroId}/nutrition/meals`, body);
    return data;
  },
  async deleteMeal(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/nutrition/meals/${id}`);
  },

  async listExercises(membroId: string): Promise<RegistroExercicio[]> {
    const { data } = await api.get(`/family-members/${membroId}/exercises`);
    return data;
  },
  async createExercise(membroId: string, body: any): Promise<RegistroExercicio> {
    const { data } = await api.post(`/family-members/${membroId}/exercises`, body);
    return data;
  },
  async deleteExercise(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/exercises/${id}`);
  },
  async exerciseWeeklyStats(membroId: string): Promise<ExerciseWeeklyStats> {
    const { data } = await api.get(`/family-members/${membroId}/exercises/weekly-stats`);
    return data;
  },

  async listPsychology(membroId: string): Promise<RegistroPsicologico[]> {
    const { data } = await api.get(`/family-members/${membroId}/psychology`);
    return data;
  },
  async createPsychology(membroId: string, body: any): Promise<RegistroPsicologico> {
    const { data } = await api.post(`/family-members/${membroId}/psychology`, body);
    return data;
  },
  async deletePsychology(membroId: string, id: string): Promise<void> {
    await api.delete(`/family-members/${membroId}/psychology/${id}`);
  },

  async getInsights(membroId: string): Promise<HealthInsight[]> {
    const { data } = await api.get(`/family-members/${membroId}/insights`);
    return data;
  },

  async getHealthScore(membroId: string): Promise<HealthScoreResult> {
    const { data } = await api.get(`/family-members/${membroId}/insights/score`);
    return data;
  },
};
