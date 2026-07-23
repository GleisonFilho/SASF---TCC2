export const tipoMedicaoLabels: Record<string, string> = {
  PRESSAO: 'Pressão', GLICEMIA: 'Glicemia', PESO: 'Peso', TEMPERATURA: 'Temperatura', FC: 'Freq. Cardíaca', SPO2: 'SpO2',
};

export const escopoLabels: Record<string, string> = {
  PERFIL: 'Perfil do Membro',
  MEMBROS: 'Lista de Membros',
  CONDICOES: 'Condições de Saúde',
  ALERGIAS: 'Alergias',
  MEDICAMENTOS: 'Medicamentos',
  CONTATOS: 'Contatos de Emergência',
  VITAIS: 'Sinais Vitais',
  SINTOMAS: 'Sintomas',
  NUTRICAO: 'Nutrição',
  EXERCICIOS: 'Exercícios',
  PSICOLOGIA: 'Bem-estar Psicológico',
  HEALTH_SCORE: 'Health Score',
};

export const tipoRefeicaoLabels: Record<string, string> = {
  CAFE_DA_MANHA: 'Café', LANCHE_MANHA: 'Lanche AM', ALMOCO: 'Almoço',
  LANCHE_TARDE: 'Lanche PM', JANTAR: 'Jantar', CEIA: 'Ceia', OUTRO: 'Outro',
};

export const tipoExercicioLabels: Record<string, string> = {
  CAMINHADA: 'Caminhada', CORRIDA: 'Corrida', ACADEMIA: 'Academia',
  CICLISMO: 'Ciclismo', NATACAO: 'Natação', FUTEBOL: 'Futebol', OUTRO: 'Outro',
};

export const intensidadeExercicioColor: Record<string, string> = { LEVE: '#16A34A', MODERADA: '#D97706', INTENSA: '#DC2626' };

export const escopoIcons: Record<string, import('../components/ui/Icon').IoniconsName> = {
  PERFIL: 'person-outline',
  MEMBROS: 'people-outline',
  CONDICOES: 'medkit-outline',
  ALERGIAS: 'warning-outline',
  MEDICAMENTOS: 'medical-outline',
  CONTATOS: 'call-outline',
  VITAIS: 'heart-outline',
  SINTOMAS: 'thermometer-outline',
  NUTRICAO: 'nutrition-outline',
  EXERCICIOS: 'fitness-outline',
  PSICOLOGIA: 'happy-outline',
  HEALTH_SCORE: 'pulse-outline',
};
