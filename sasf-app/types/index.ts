export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  fotoUrl?: string | null;
  dataNascimento?: string | null;
  sexo?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  tipoPerfil: 'PACIENTE' | 'PROFISSIONAL' | 'ADMIN';
  statusConta: 'ATIVO' | 'PENDENTE' | 'BLOQUEADO';
  profissionalDetalhe?: {
    registroProfissional: string;
    categoriaConselho: string;
    ufConselho: string;
    especialidade?: string;
    statusValidacao: string;
  } | null;
}

export interface UpdateProfileBody {
  nome?: string;
  telefone?: string;
  fotoUrl?: string;
  dataNascimento?: string;
  sexo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MembroFamilia {
  id: string;
  usuarioResponsavelId: string;
  nome: string;
  dataNascimento: string;
  sexo: string;
  parentesco: string;
  createdAt: string;
}

export interface CondicaoSaude {
  id: string;
  membroId: string;
  nomeCondicao: string;
  dataDiagnostico: string | null;
  status: 'ATIVA' | 'CONTROLADA' | 'RESOLVIDA';
  observacoes: string | null;
  createdAt: string;
}

export interface Alergia {
  id: string;
  membroId: string;
  substancia: string;
  gravidade: 'LEVE' | 'MODERADA' | 'GRAVE';
  reacao: string | null;
  createdAt: string;
}

export interface MedicamentoUso {
  id: string;
  membroId: string;
  nomeMedicamento: string;
  dosagem: string | null;
  frequencia: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  usoContinuo: boolean;
  createdAt: string;
}

export interface ContatoEmergencia {
  id: string;
  membroId: string;
  nome: string;
  parentesco: string;
  telefone: string;
  createdAt: string;
}

export interface SinalVital {
  id: string;
  membroId: string;
  registradoPorUsuarioId: string;
  tipoMedicao: 'PRESSAO' | 'GLICEMIA' | 'PESO' | 'TEMPERATURA' | 'FC' | 'SPO2';
  valorPrimario: string;
  valorSecundario: string | null;
  unidade: string;
  dataHoraMedicao: string;
  observacoes: string | null;
  createdAt: string;
}

export interface RegistroSintoma {
  id: string;
  membroId: string;
  registradoPorUsuarioId: string;
  descricao: string;
  intensidade: number;
  dataHoraOcorrencia: string;
  observacoes: string | null;
  createdAt: string;
}

export type EscopoCompartilhamento = 'PERFIL' | 'MEMBROS' | 'CONDICOES' | 'ALERGIAS' | 'MEDICAMENTOS' | 'CONTATOS' | 'VITAIS' | 'SINTOMAS';

export interface Compartilhamento {
  id: string;
  membroId: string;
  profissionalId: string;
  concedidoPorUsuarioId: string;
  codigoToken: string;
  dataCriacao: string;
  dataExpiracao: string;
  dataRevogacao: string | null;
  status: 'ATIVO' | 'EXPIRADO' | 'REVOGADO';
  observacoes: string | null;
  escopos: { id: string; categoriaDado: EscopoCompartilhamento }[];
  membro?: { id: string; nome: string; parentesco: string };
  profissional?: { id: string; nome: string; email: string };
}

export interface LogAcesso {
  id: string;
  tokenId: string;
  profissionalId: string;
  recursoAcessado: string;
  dataHoraAcesso: string;
  ipOrigem: string | null;
}

export interface ProfissionalDetalhe {
  id: string;
  usuarioId: string;
  registroProfissional: string;
  categoriaConselho: string;
  ufConselho: string;
  especialidade: string | null;
  statusValidacao: 'PENDING' | 'APPROVED' | 'REJECTED';
  avaliadoPorId: string | null;
  avaliadoEm: string | null;
  motivoRejeicao: string | null;
  createdAt: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    statusConta: string;
    createdAt: string;
  };
  avaliadoPor?: { id: string; nome: string } | null;
}

// ─── Nutrição ─────────────────────────────────────────

export interface PerfilNutricional {
  id: string; membroId: string;
  alturaAtualCm: string | null; pesoAtualKg: string | null;
  metaPesoKg: string | null; percentualGordura: string | null;
  circunferenciaAbdominal: string | null; metaAguaMl: number | null;
}

export interface RegistroPeso {
  id: string; membroId: string; pesoKg: string; imc: string | null;
  dataHora: string; createdAt: string;
}

export interface RegistroAgua {
  id: string; membroId: string; quantidadeMl: number;
  dataHora: string; createdAt: string;
}

export interface RegistroRefeicao {
  id: string; membroId: string;
  tipo: 'CAFE_DA_MANHA' | 'LANCHE_MANHA' | 'ALMOCO' | 'LANCHE_TARDE' | 'JANTAR' | 'CEIA' | 'OUTRO';
  descricao: string; calorias: number | null;
  dataHora: string; observacoes: string | null; createdAt: string;
}

// ─── Exercícios ───────────────────────────────────────

export interface RegistroExercicio {
  id: string; membroId: string;
  tipo: 'CAMINHADA' | 'CORRIDA' | 'ACADEMIA' | 'CICLISMO' | 'NATACAO' | 'FUTEBOL' | 'OUTRO';
  duracaoMin: number; distanciaKm: string | null; caloriasEst: number | null;
  intensidade: 'LEVE' | 'MODERADA' | 'INTENSA';
  observacoes: string | null; dataHora: string; createdAt: string;
}

export interface ExerciseWeeklyStats {
  totalMin: number; totalCal: number; totalSessions: number;
  records: RegistroExercicio[];
}

// ─── Psicologia ───────────────────────────────────────

export interface RegistroPsicologico {
  id: string; membroId: string;
  humor: number; ansiedade: number; estresse: number;
  qualidadeSono: number; energia: number;
  observacoes: string | null; dataHora: string; createdAt: string;
}

// ─── Insights ─────────────────────────────────────────

export interface HealthInsight {
  tipo: 'info' | 'alerta' | 'positivo';
  prioridade?: number;
  icone: string; mensagem: string; aviso: string;
}

export interface HealthScoreBreakdown {
  fator: string;
  pontos: number;
  maximo: number;
}

export interface HealthScoreResult {
  score: number;
  classificacao: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  breakdown: HealthScoreBreakdown[];
  explicacao: string;
}

// ─── Dispositivos (arquitetura preparada, sem integração real) ──

export type DeviceProviderId = 'samsung_health' | 'google_fit' | 'apple_health' | 'garmin' | 'fitbit';

export interface DeviceProvider {
  id: DeviceProviderId;
  nome: string;
  icone: string;
  cor: string;
  disponivel: boolean;
}

export interface ConnectedDevice {
  providerId: DeviceProviderId;
  conectadoEm: string;
}
