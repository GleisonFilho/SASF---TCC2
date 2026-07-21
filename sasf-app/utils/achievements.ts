import type { IoniconsName } from '../components/ui/Icon';

export interface Achievement {
  id: string;
  icone: IoniconsName;
  titulo: string;
  descricao: string;
  desbloqueada: boolean;
}

export interface AchievementInput {
  totalRegistrosSaude: number; // sinais vitais + sintomas + peso + água + refeições + exercícios + psicologia
  diasConsecutivosAgua: number;
  diasConsecutivosExercicio: number;
  totalRegistrosPsicologicos: number;
  perfilCompleto: boolean; // tem condições, alergias, medicamentos e contatos cadastrados
  totalExercicios: number;
  totalCompartilhamentos: number;
}

/**
 * Calcula a lista de conquistas com base nos dados já carregados pelo app.
 * Cálculo 100% client-side — não há persistência de medalhas no backend.
 */
export function computeAchievements(input: AchievementInput): Achievement[] {
  return [
    {
      id: 'primeiro_registro',
      icone: 'trophy',
      titulo: 'Primeiro Registro',
      descricao: 'Registre seu primeiro dado de saúde.',
      desbloqueada: input.totalRegistrosSaude >= 1,
    },
    {
      id: 'agua_7_dias',
      icone: 'water',
      titulo: '7 Dias Hidratado',
      descricao: 'Registre consumo de água por 7 dias seguidos.',
      desbloqueada: input.diasConsecutivosAgua >= 7,
    },
    {
      id: 'exercicio_7_dias',
      icone: 'heart',
      titulo: 'Semana Ativa',
      descricao: 'Registre exercícios por 7 dias seguidos.',
      desbloqueada: input.diasConsecutivosExercicio >= 7,
    },
    {
      id: 'humor_registrado',
      icone: 'happy',
      titulo: 'Bem-estar em Dia',
      descricao: 'Registre seu humor pela primeira vez.',
      desbloqueada: input.totalRegistrosPsicologicos >= 1,
    },
    {
      id: 'perfil_completo',
      icone: 'medkit',
      titulo: 'Perfil Completo',
      descricao: 'Cadastre condições, alergias, medicamentos e contatos de emergência.',
      desbloqueada: input.perfilCompleto,
    },
    {
      id: 'dez_exercicios',
      icone: 'walk',
      titulo: 'Atleta em Treinamento',
      descricao: 'Registre 10 exercícios.',
      desbloqueada: input.totalExercicios >= 10,
    },
    {
      id: 'compartilhamento_lgpd',
      icone: 'lock-closed',
      titulo: 'Saúde Compartilhada',
      descricao: 'Compartilhe seus dados com um profissional de saúde.',
      desbloqueada: input.totalCompartilhamentos >= 1,
    },
  ];
}

/** Calcula a maior sequência de dias consecutivos com pelo menos um registro na data informada. */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10))),
  ).sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0 && day < expected) {
      // Sem registro hoje ainda — permite começar a contagem em "ontem"
      const yesterday = new Date(cursor);
      yesterday.setDate(yesterday.getDate() - 1);
      if (day === yesterday.toISOString().slice(0, 10)) {
        streak++;
        cursor.setDate(cursor.getDate() - 2);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}
