import type { IoniconsName } from '../components/ui/Icon';

export const statusColors: Record<string, { bg: string; text: string; color: string }> = {
  ATIVA: { bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626' },
  CONTROLADA: { bg: 'bg-yellow-100', text: 'text-yellow-700', color: '#D97706' },
  RESOLVIDA: { bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A' },
};

export const gravidadeColors: Record<string, { bg: string; text: string; color: string }> = {
  LEVE: { bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A' },
  MODERADA: { bg: 'bg-yellow-100', text: 'text-yellow-700', color: '#D97706' },
  GRAVE: { bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626' },
};

export function intensityTone(value: number): { bg: string; text: string; color: string } {
  if (value >= 7) return { bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626' };
  if (value >= 4) return { bg: 'bg-yellow-100', text: 'text-yellow-700', color: '#D97706' };
  return { bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A' };
}

export const tipoMedicaoIcon: Record<string, { icon: IoniconsName; color: string }> = {
  PRESSAO: { icon: 'heart', color: '#DC2626' },
  GLICEMIA: { icon: 'water', color: '#EC4899' },
  PESO: { icon: 'scale', color: '#2563EB' },
  TEMPERATURA: { icon: 'thermometer', color: '#F59E0B' },
  FC: { icon: 'pulse', color: '#DC2626' },
  SPO2: { icon: 'fitness', color: '#06B6D4' },
};

export function getScoreColor(score: number): string {
  if (score >= 85) return '#16A34A';
  if (score >= 70) return '#84CC16';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#F97316';
  return '#DC2626';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 50) return 'Regular';
  if (score >= 30) return 'Atenção';
  return 'Crítico';
}
