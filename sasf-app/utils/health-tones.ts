import type { IoniconsName } from '../components/ui/Icon';

export interface Tone { bg: string; text: string; color: string; bgHex: string; textHex: string }

const RED: Tone = { bg: 'bg-red-100', text: 'text-red-700', color: '#DC2626', bgHex: '#FEE2E2', textHex: '#B91C1C' };
const YELLOW: Tone = { bg: 'bg-yellow-100', text: 'text-yellow-700', color: '#D97706', bgHex: '#FEF9C3', textHex: '#A16207' };
const GREEN: Tone = { bg: 'bg-green-100', text: 'text-green-700', color: '#16A34A', bgHex: '#DCFCE7', textHex: '#15803D' };

export const statusColors: Record<string, Tone> = {
  ATIVA: RED,
  CONTROLADA: YELLOW,
  RESOLVIDA: GREEN,
};

export const gravidadeColors: Record<string, Tone> = {
  LEVE: GREEN,
  MODERADA: YELLOW,
  GRAVE: RED,
};

export function intensityTone(value: number): Tone {
  if (value >= 7) return RED;
  if (value >= 4) return YELLOW;
  return GREEN;
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
