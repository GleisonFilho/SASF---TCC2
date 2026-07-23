import { prisma } from '../config/prisma';
import { familyMembersService } from './familyMembers.service';

interface Insight {
  tipo: 'info' | 'alerta' | 'positivo';
  prioridade: number;
  icone: string;
  mensagem: string;
  aviso: string;
}

interface HealthScoreBreakdown {
  fator: string;
  pontos: number;
  maximo: number;
}

interface HealthScoreTrendPoint {
  data: string;
  score: number;
}

interface HealthScoreResult {
  score: number;
  classificacao: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  breakdown: HealthScoreBreakdown[];
  trend: HealthScoreTrendPoint[];
  explicacao: string;
}

/**
 * Camada de geração de recomendações de saúde.
 *
 * Implementação atual: motor de regras determinístico (sem chamadas externas).
 * Arquitetura preparada para evolução futura: basta implementar um novo
 * "provider" (ex.: OpenAIInsightProvider, GeminiInsightProvider) que receba
 * o mesmo `HealthSnapshot` produzido por `fetchHealthData()` e devolva
 * `Insight[]` no mesmo formato — o restante do sistema (controller, rotas,
 * frontend) não precisa mudar.
 */
const AVISO = 'Estas recomendações são apenas informativas e não substituem orientação médica.';

async function fetchHealthData(membroId: string) {
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [
    profile, weightRecords, waterToday, exercisesWeek, psychRecent, mealsToday, conditions, medications, vitalSigns,
    vitalSignsWide, mealsWeek, waterWeek, psychWeek,
  ] = await Promise.all([
    prisma.perfilNutricional.findUnique({ where: { membroId } }),
    prisma.registroPeso.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: 10 }),
    prisma.registroAgua.findMany({ where: { membroId, dataHora: { gte: today, lte: todayEnd } } }),
    prisma.registroExercicio.findMany({ where: { membroId, dataHora: { gte: weekAgo } } }),
    prisma.registroPsicologico.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: 7 }),
    prisma.registroRefeicao.findMany({ where: { membroId, dataHora: { gte: today, lte: todayEnd } } }),
    prisma.condicaoSaude.findMany({ where: { membroId, status: 'ATIVA' } }),
    prisma.medicamentoUso.findMany({ where: { membroId, usoContinuo: true } }),
    prisma.sinalVital.findMany({ where: { membroId }, orderBy: { dataHoraMedicao: 'desc' }, take: 5 }),
    // Janelas mais largas, usadas só pelo novo cálculo de 7 pilares/tendência —
    // isoladas das consultas acima para não alterar o comportamento de generate().
    prisma.sinalVital.findMany({ where: { membroId }, orderBy: { dataHoraMedicao: 'desc' }, take: 30 }),
    prisma.registroRefeicao.findMany({ where: { membroId, dataHora: { gte: weekAgo } } }),
    prisma.registroAgua.findMany({ where: { membroId, dataHora: { gte: weekAgo } } }),
    prisma.registroPsicologico.findMany({ where: { membroId, dataHora: { gte: weekAgo } }, orderBy: { dataHora: 'desc' } }),
  ]);

  return {
    profile, weightRecords, waterToday, exercisesWeek, psychRecent, mealsToday, conditions, medications, vitalSigns, weekAgo,
    vitalSignsWide, mealsWeek, waterWeek, psychWeek,
  };
}

type FetchedHealthData = Awaited<ReturnType<typeof fetchHealthData>>;
type SinalVitalRecord = FetchedHealthData['vitalSignsWide'][number];
type PsicoRecord = FetchedHealthData['psychWeek'][number];
type PesoRecord = FetchedHealthData['weightRecords'][number];
type RefeicaoRecord = FetchedHealthData['mealsWeek'][number];
type AguaRecord = FetchedHealthData['waterWeek'][number];
type ExercicioRecord = FetchedHealthData['exercisesWeek'][number];
type MedicamentoRecord = FetchedHealthData['medications'][number];

const TIPOS_SINAIS_VITAIS = ['PRESSAO', 'GLICEMIA', 'FC', 'SPO2', 'TEMPERATURA'] as const;

/**
 * Pontuação dos 7 pilares do Health Score. Cada pilar tem um "default neutro"
 * quando não há dado suficiente, no mesmo espírito do cálculo anterior
 * (nunca zera um pilar só por falta de registro).
 */
function scoreVitalSign(vitals: SinalVitalRecord[], tipo: (typeof TIPOS_SINAIS_VITAIS)[number]): number {
  const reading = vitals.find((v) => v.tipoMedicao === tipo);
  if (!reading) return 3; // sem leitura registrada — neutro

  const primario = Number(reading.valorPrimario);
  const secundario = reading.valorSecundario ? Number(reading.valorSecundario) : 0;

  switch (tipo) {
    case 'PRESSAO':
      if (primario >= 140 || secundario >= 90) return 1;
      if (primario >= 120 || secundario >= 80) return 3;
      return 5;
    case 'GLICEMIA':
      if (primario >= 126) return 1;
      if (primario >= 100) return 3;
      return 5;
    case 'FC':
      return primario >= 60 && primario <= 100 ? 5 : 2;
    case 'SPO2':
      return primario >= 95 ? 5 : 1;
    case 'TEMPERATURA':
      return primario >= 36 && primario <= 37.5 ? 5 : 2;
    default:
      return 3;
  }
}

function scoreSinaisVitais(vitals: SinalVitalRecord[]): number {
  return TIPOS_SINAIS_VITAIS.reduce((sum, tipo) => sum + scoreVitalSign(vitals, tipo), 0);
}

function scoreBemEstar(records: PsicoRecord[]): number {
  if (!records.length) return 12; // neutro (60% de 20)
  const avg = (campo: 'humor' | 'ansiedade' | 'estresse' | 'energia') => records.reduce((s, r) => s + r[campo], 0) / records.length;
  const humorPts = (avg('humor') / 10) * 6;
  const energiaPts = (avg('energia') / 10) * 5;
  const ansiedadePts = ((10 - avg('ansiedade')) / 10) * 5;
  const estressePts = ((10 - avg('estresse')) / 10) * 4;
  return humorPts + energiaPts + ansiedadePts + estressePts;
}

function scoreSono(records: PsicoRecord[]): number {
  if (!records.length) return 6; // neutro (60% de 10)
  const avgSono = records.reduce((s, r) => s + r.qualidadeSono, 0) / records.length;
  return (avgSono / 10) * 10;
}

function scoreImc(weightRecords: PesoRecord[]): number {
  if (!weightRecords.length || !weightRecords[0].imc) return 4.5; // neutro (50% de 9)
  const imc = Number(weightRecords[0].imc);
  if (imc >= 18.5 && imc < 25) return 9;
  if ((imc >= 25 && imc < 30) || (imc >= 17 && imc < 18.5)) return 5.4;
  return 1.8;
}

function scoreNutricao(weightRecords: PesoRecord[], mealsWeek: RefeicaoRecord[]): number {
  const imcPts = scoreImc(weightRecords);
  const mealsPts = Math.min(mealsWeek.length / 14, 1) * 6; // ~2 refeições/dia registradas = pontuação máxima
  return imcPts + mealsPts;
}

function scoreExercicios(minutos: number): number {
  return Math.min(minutos / 150, 1) * 15;
}

function scoreHidratacao(ml: number, metaMl: number): number {
  return Math.min(ml / metaMl, 1) * 10;
}

/**
 * Não há registro de dose tomada/pulada no modelo de dados — este pilar é uma
 * estimativa (proxy) baseada em engajamento recente, não uma medição real de
 * adesão. Documentado explicitamente na `explicacao` retornada pela API.
 */
function scoreAdesao(medications: MedicamentoRecord[], vitalsWide: SinalVitalRecord[]): number {
  if (medications.length === 0) return 5; // nada a aderir
  const quatorzeDiasAtras = new Date();
  quatorzeDiasAtras.setDate(quatorzeDiasAtras.getDate() - 14);
  const engajamentoRecente = vitalsWide.some((v) => v.dataHoraMedicao >= quatorzeDiasAtras);
  return engajamentoRecente ? 5 : 3;
}

/**
 * Tendência dos últimos 7 dias para a mini-sparkline do card de Health Score.
 * Sem tabela de histórico: recalcula, por dia, apenas os pilares com
 * granularidade diária real (Hidratação, Sono, Bem-estar, Exercícios).
 * Sinais Vitais, Nutrição e Adesão não variam dia a dia neste modelo de dados
 * e entram como uma constante (`pontosConstantes`) igual em todos os pontos —
 * isso é uma simplificação assumida, não um dado fabricado.
 */
function computeTrend(params: {
  waterWeek: AguaRecord[];
  exercisesWeek: ExercicioRecord[];
  psychWeek: PsicoRecord[];
  metaAgua: number;
  pontosConstantes: number;
}): HealthScoreTrendPoint[] {
  const { waterWeek, exercisesWeek, psychWeek, metaAgua, pontosConstantes } = params;
  const pontos: HealthScoreTrendPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date(); dia.setHours(0, 0, 0, 0); dia.setDate(dia.getDate() - i);
    const diaFim = new Date(dia); diaFim.setHours(23, 59, 59, 999);

    const aguaNoDia = waterWeek.filter((r) => r.dataHora >= dia && r.dataHora <= diaFim).reduce((s, r) => s + r.quantidadeMl, 0);
    const hidratacaoPts = scoreHidratacao(aguaNoDia, metaAgua);

    const exercicioNoDia = exercisesWeek.filter((r) => r.dataHora >= dia && r.dataHora <= diaFim).reduce((s, r) => s + r.duracaoMin, 0);
    const exerciciosPts = Math.min(exercicioNoDia / (150 / 7), 1) * 15;

    const psicoNoDia = psychWeek.filter((r) => r.dataHora >= dia && r.dataHora <= diaFim);
    // Sem registro psicológico naquele dia específico: usa a média da semana
    // em vez de zerar, evitando um dente-de-serra artificial por falta de log.
    const bemEstarPts = scoreBemEstar(psicoNoDia.length ? psicoNoDia : psychWeek);
    const sonoPts = scoreSono(psicoNoDia.length ? psicoNoDia : psychWeek);

    const total = Math.round(pontosConstantes + hidratacaoPts + exerciciosPts + bemEstarPts + sonoPts);
    pontos.push({ data: dia.toISOString().slice(0, 10), score: Math.min(Math.max(total, 0), 100) });
  }

  return pontos;
}

export const healthInsightService = {
  async generate(membroId: string, userId: string): Promise<Insight[]> {
    await familyMembersService.getById(membroId, userId);
    const { profile, weightRecords, waterToday, exercisesWeek, psychRecent, mealsToday, conditions, medications, vitalSigns } = await fetchHealthData(membroId);
    const insights: Insight[] = [];

    // ── IMC ──
    if (weightRecords.length > 0 && profile?.alturaAtualCm) {
      const imc = Number(weightRecords[0].imc);
      if (imc > 0) {
        if (imc < 18.5) insights.push({ tipo: 'alerta', prioridade: 1, icone: '📊', mensagem: `IMC atual: ${imc} — Abaixo do peso. Procure orientação nutricional.`, aviso: AVISO });
        else if (imc >= 30) insights.push({ tipo: 'alerta', prioridade: 1, icone: '📊', mensagem: `IMC atual: ${imc} — Faixa de obesidade (IMC elevado). Acompanhamento profissional recomendado.`, aviso: AVISO });
        else if (imc >= 25) insights.push({ tipo: 'alerta', prioridade: 2, icone: '📊', mensagem: `IMC atual: ${imc} — Sobrepeso (IMC elevado). Atenção à alimentação e exercícios.`, aviso: AVISO });
        else insights.push({ tipo: 'positivo', prioridade: 5, icone: '📊', mensagem: `IMC atual: ${imc} — Faixa saudável.`, aviso: AVISO });
      }
    }

    // ── Sono, Humor, Ansiedade (Psicologia) ──
    if (psychRecent.length > 0) {
      const avgHumor = psychRecent.reduce((s, r) => s + r.humor, 0) / psychRecent.length;
      const avgSono = psychRecent.reduce((s, r) => s + r.qualidadeSono, 0) / psychRecent.length;
      const avgAnsiedade = psychRecent.reduce((s, r) => s + r.ansiedade, 0) / psychRecent.length;
      const avgEstresse = psychRecent.reduce((s, r) => s + r.estresse, 0) / psychRecent.length;

      if (avgHumor <= 4) {
        insights.push({ tipo: 'alerta', prioridade: 1, icone: '😔', mensagem: `Humor médio baixo nos últimos ${psychRecent.length} registros (${avgHumor.toFixed(1)}/10). Considere buscar apoio profissional.`, aviso: AVISO });
      } else if (avgHumor >= 7) {
        insights.push({ tipo: 'positivo', prioridade: 5, icone: '😊', mensagem: `Humor positivo nos últimos registros (${avgHumor.toFixed(1)}/10).`, aviso: AVISO });
      }

      if (avgSono <= 4) {
        insights.push({ tipo: 'alerta', prioridade: 2, icone: '😴', mensagem: `Qualidade do sono baixa (${avgSono.toFixed(1)}/10). O sono é essencial para a recuperação física e mental.`, aviso: AVISO });
      } else if (avgSono >= 8) {
        insights.push({ tipo: 'positivo', prioridade: 5, icone: '😴', mensagem: `Boa qualidade de sono nos últimos registros (${avgSono.toFixed(1)}/10).`, aviso: AVISO });
      }

      if (avgAnsiedade >= 7) {
        insights.push({ tipo: 'alerta', prioridade: 1, icone: '😰', mensagem: `Nível de ansiedade elevado (${avgAnsiedade.toFixed(1)}/10). Técnicas de respiração e relaxamento podem ajudar.`, aviso: AVISO });
      }

      if (avgEstresse >= 7) {
        insights.push({ tipo: 'alerta', prioridade: 2, icone: '🧘', mensagem: `Nível de estresse elevado (${avgEstresse.toFixed(1)}/10). Pausas regulares ao longo do dia podem ajudar.`, aviso: AVISO });
      }
    }

    // ── Peso ──
    if (weightRecords.length >= 2) {
      const diff = Number(weightRecords[0].pesoKg) - Number(weightRecords[weightRecords.length - 1].pesoKg);
      if (Math.abs(diff) >= 0.5) {
        const dir = diff < 0 ? 'reduziu' : 'aumentou';
        const tipo = profile?.metaPesoKg && Number(weightRecords[0].pesoKg) > Number(profile.metaPesoKg) && diff < 0 ? 'positivo' as const : 'info' as const;
        insights.push({ tipo, prioridade: 3, icone: '⚖️', mensagem: `Seu peso ${dir} ${Math.abs(diff).toFixed(1)} kg nos últimos registros.`, aviso: AVISO });
      }
    }

    // ── Hidratação ──
    const totalWaterMl = waterToday.reduce((s, r) => s + r.quantidadeMl, 0);
    const metaAgua = profile?.metaAguaMl || 2000;
    if (totalWaterMl >= metaAgua) {
      insights.push({ tipo: 'positivo', prioridade: 4, icone: '💧', mensagem: `Meta de hidratação atingida! ${totalWaterMl}ml de ${metaAgua}ml.`, aviso: AVISO });
    } else if (totalWaterMl < metaAgua * 0.3) {
      insights.push({ tipo: 'alerta', prioridade: 2, icone: '💧', mensagem: `Hidratação baixa hoje: ${totalWaterMl}ml de ${metaAgua}ml. Beba água regularmente.`, aviso: AVISO });
    }

    // ── Exercícios / Sedentarismo ──
    const exerciseMinWeek = exercisesWeek.reduce((s, r) => s + r.duracaoMin, 0);
    if (exerciseMinWeek >= 150) {
      insights.push({ tipo: 'positivo', prioridade: 4, icone: '🏃', mensagem: `${exerciseMinWeek} minutos de exercício esta semana — acima da meta da OMS!`, aviso: AVISO });
    } else if (exerciseMinWeek > 0) {
      insights.push({ tipo: 'info', prioridade: 3, icone: '🏃', mensagem: `${exerciseMinWeek} de 150 minutos recomendados (OMS) de exercício esta semana.`, aviso: AVISO });
    } else {
      insights.push({ tipo: 'alerta', prioridade: 2, icone: '🛋️', mensagem: 'Nenhum exercício registrado esta semana. Sedentarismo aumenta riscos à saúde — que tal uma caminhada?', aviso: AVISO });
    }

    // ── Nutrição / Refeições ──
    if (mealsToday.length === 0) {
      const hour = new Date().getHours();
      if (hour >= 10) {
        insights.push({ tipo: 'alerta', prioridade: 3, icone: '🍽️', mensagem: 'Nenhuma refeição registrada hoje. Registrar suas refeições ajuda a manter uma nutrição equilibrada.', aviso: AVISO });
      }
    } else if (mealsToday.length >= 3) {
      insights.push({ tipo: 'positivo', prioridade: 5, icone: '🍽️', mensagem: `${mealsToday.length} refeições registradas hoje — boa rotina nutricional.`, aviso: AVISO });
    }

    // ── Hipertensão (Pressão Arterial) ──
    const pressao = vitalSigns.find((v) => v.tipoMedicao === 'PRESSAO');
    if (pressao) {
      const sis = Number(pressao.valorPrimario);
      const dia = Number(pressao.valorSecundario || 0);
      if (sis >= 140 || dia >= 90) {
        insights.push({ tipo: 'alerta', prioridade: 1, icone: '❤️', mensagem: `Última pressão arterial elevada: ${sis}/${dia} mmHg — sinal de possível hipertensão. Acompanhe regularmente.`, aviso: AVISO });
      } else {
        insights.push({ tipo: 'positivo', prioridade: 5, icone: '❤️', mensagem: `Pressão arterial dentro da faixa normal: ${sis}/${dia} mmHg.`, aviso: AVISO });
      }
    }

    // ── Diabetes (Glicemia) ──
    const glicemia = vitalSigns.find((v) => v.tipoMedicao === 'GLICEMIA');
    if (glicemia) {
      const val = Number(glicemia.valorPrimario);
      if (val >= 126) {
        insights.push({ tipo: 'alerta', prioridade: 1, icone: '🩸', mensagem: `Glicemia elevada no último registro: ${val} mg/dL — sinal de possível diabetes. Consulte um médico.`, aviso: AVISO });
      }
    }

    // ── Condições crônicas ──
    if (conditions.length > 0) {
      insights.push({ tipo: 'info', prioridade: 4, icone: '🩺', mensagem: `${conditions.length} condição(ões) de saúde ativa(s) em acompanhamento.`, aviso: AVISO });
    }

    // ── Medicamentos ──
    if (medications.length > 0) {
      insights.push({ tipo: 'info', prioridade: 4, icone: '💊', mensagem: `${medications.length} medicamento(s) de uso contínuo. Mantenha a regularidade dos horários.`, aviso: AVISO });
    }

    return insights.sort((a, b) => a.prioridade - b.prioridade);
  },

  async calculateScore(membroId: string, userId: string): Promise<HealthScoreResult> {
    await familyMembersService.getById(membroId, userId);
    return computeHealthScore(membroId);
  },
};

export async function computeHealthScore(membroId: string): Promise<HealthScoreResult> {
    const { profile, weightRecords, exercisesWeek, medications, vitalSignsWide, mealsWeek, waterWeek, psychWeek } = await fetchHealthData(membroId);

    const metaAgua = profile?.metaAguaMl || 2000;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const hojeFim = new Date(); hojeFim.setHours(23, 59, 59, 999);
    const aguaHoje = waterWeek.filter((r) => r.dataHora >= hoje && r.dataHora <= hojeFim).reduce((s, r) => s + r.quantidadeMl, 0);
    const exerciseMinWeek = exercisesWeek.reduce((s, r) => s + r.duracaoMin, 0);

    const sinaisVitaisPts = scoreSinaisVitais(vitalSignsWide);
    const bemEstarPts = scoreBemEstar(psychWeek);
    const nutricaoPts = scoreNutricao(weightRecords, mealsWeek);
    const exerciciosPts = scoreExercicios(exerciseMinWeek);
    const hidratacaoPts = scoreHidratacao(aguaHoje, metaAgua);
    const sonoPts = scoreSono(psychWeek);
    const adesaoPts = scoreAdesao(medications, vitalSignsWide);

    const breakdown: HealthScoreBreakdown[] = [
      { fator: 'Sinais Vitais', pontos: Math.round(sinaisVitaisPts), maximo: 25 },
      { fator: 'Bem-estar Psicológico', pontos: Math.round(bemEstarPts), maximo: 20 },
      { fator: 'Nutrição', pontos: Math.round(nutricaoPts), maximo: 15 },
      { fator: 'Exercícios', pontos: Math.round(exerciciosPts), maximo: 15 },
      { fator: 'Hidratação', pontos: Math.round(hidratacaoPts), maximo: 10 },
      { fator: 'Sono', pontos: Math.round(sonoPts), maximo: 10 },
      { fator: 'Adesão ao Tratamento', pontos: Math.round(adesaoPts), maximo: 5 },
    ];

    const score = Math.min(breakdown.reduce((s, b) => s + b.pontos, 0), 100);

    let classificacao: HealthScoreResult['classificacao'];
    if (score >= 85) classificacao = 'Excelente';
    else if (score >= 70) classificacao = 'Bom';
    else if (score >= 50) classificacao = 'Regular';
    else if (score >= 30) classificacao = 'Atenção';
    else classificacao = 'Crítico';

    // Sinais Vitais, Nutrição e Adesão não têm granularidade diária neste
    // modelo de dados — entram como constante na tendência (ver computeTrend).
    const pontosConstantes = sinaisVitaisPts + nutricaoPts + adesaoPts;
    const trend = computeTrend({ waterWeek, exercisesWeek, psychWeek, metaAgua, pontosConstantes });

    return {
      score,
      classificacao,
      breakdown,
      trend,
      explicacao: 'O score combina 7 pilares baseados em evidências (Sinais Vitais, Bem-estar Psicológico, Nutrição, Exercícios, Hidratação, Sono e Adesão ao Tratamento), cada um com peso específico, somando até 100 pontos. O pilar de Adesão ao Tratamento é uma estimativa baseada em engajamento recente com o app — o sistema não registra doses tomadas, então não é uma medição real de adesão.',
    };
}
