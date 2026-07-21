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

interface HealthScoreResult {
  score: number;
  classificacao: 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico';
  breakdown: HealthScoreBreakdown[];
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

  const [profile, weightRecords, waterToday, exercisesWeek, psychRecent, mealsToday, conditions, medications, vitalSigns] = await Promise.all([
    prisma.perfilNutricional.findUnique({ where: { membroId } }),
    prisma.registroPeso.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: 10 }),
    prisma.registroAgua.findMany({ where: { membroId, dataHora: { gte: today, lte: todayEnd } } }),
    prisma.registroExercicio.findMany({ where: { membroId, dataHora: { gte: weekAgo } } }),
    prisma.registroPsicologico.findMany({ where: { membroId }, orderBy: { dataHora: 'desc' }, take: 7 }),
    prisma.registroRefeicao.findMany({ where: { membroId, dataHora: { gte: today, lte: todayEnd } } }),
    prisma.condicaoSaude.findMany({ where: { membroId, status: 'ATIVA' } }),
    prisma.medicamentoUso.findMany({ where: { membroId, usoContinuo: true } }),
    prisma.sinalVital.findMany({ where: { membroId }, orderBy: { dataHoraMedicao: 'desc' }, take: 5 }),
  ]);

  return { profile, weightRecords, waterToday, exercisesWeek, psychRecent, mealsToday, conditions, medications, vitalSigns, weekAgo };
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
    const { profile, weightRecords, waterToday, exercisesWeek, psychRecent, conditions, medications, vitalSigns } = await fetchHealthData(membroId);

    const breakdown: HealthScoreBreakdown[] = [];

    // IMC — 15 pts (quanto mais perto de 18.5–24.9, melhor)
    let imcPts = 7; // neutro quando não há dado
    if (weightRecords.length > 0 && weightRecords[0].imc) {
      const imc = Number(weightRecords[0].imc);
      if (imc >= 18.5 && imc < 25) imcPts = 15;
      else if (imc >= 25 && imc < 30) imcPts = 9;
      else if (imc >= 17 && imc < 18.5) imcPts = 9;
      else imcPts = 3;
    }
    breakdown.push({ fator: 'IMC', pontos: imcPts, maximo: 15 });

    // Sono — 12 pts
    const avgSono = psychRecent.length ? psychRecent.reduce((s, r) => s + r.qualidadeSono, 0) / psychRecent.length : 6;
    breakdown.push({ fator: 'Qualidade do Sono', pontos: Math.round((avgSono / 10) * 12), maximo: 12 });

    // Humor — 12 pts
    const avgHumor = psychRecent.length ? psychRecent.reduce((s, r) => s + r.humor, 0) / psychRecent.length : 6;
    breakdown.push({ fator: 'Humor', pontos: Math.round((avgHumor / 10) * 12), maximo: 12 });

    // Ansiedade (invertida — menos é melhor) — 10 pts
    const avgAnsiedade = psychRecent.length ? psychRecent.reduce((s, r) => s + r.ansiedade, 0) / psychRecent.length : 5;
    breakdown.push({ fator: 'Ansiedade (controle)', pontos: Math.round(((10 - avgAnsiedade) / 10) * 10), maximo: 10 });

    // Água — 13 pts
    const totalWaterMl = waterToday.reduce((s, r) => s + r.quantidadeMl, 0);
    const metaAgua = profile?.metaAguaMl || 2000;
    const aguaPct = Math.min(totalWaterMl / metaAgua, 1);
    breakdown.push({ fator: 'Hidratação', pontos: Math.round(aguaPct * 13), maximo: 13 });

    // Exercício — 13 pts
    const exerciseMinWeek = exercisesWeek.reduce((s, r) => s + r.duracaoMin, 0);
    const exercicioPct = Math.min(exerciseMinWeek / 150, 1);
    breakdown.push({ fator: 'Exercícios', pontos: Math.round(exercicioPct * 13), maximo: 13 });

    // Sinais vitais — 10 pts
    let vitaisPts = 10;
    const pressao = vitalSigns.find((v) => v.tipoMedicao === 'PRESSAO');
    if (pressao) {
      const sis = Number(pressao.valorPrimario);
      const dia = Number(pressao.valorSecundario || 0);
      if (sis >= 140 || dia >= 90) vitaisPts -= 5;
    }
    const glicemia = vitalSigns.find((v) => v.tipoMedicao === 'GLICEMIA');
    if (glicemia && Number(glicemia.valorPrimario) >= 126) vitaisPts -= 5;
    breakdown.push({ fator: 'Sinais Vitais', pontos: Math.max(vitaisPts, 0), maximo: 10 });

    // Condições ativas — 8 pts (cada condição reduz)
    const condPts = Math.max(8 - conditions.length * 2, 0);
    breakdown.push({ fator: 'Condições de Saúde', pontos: condPts, maximo: 8 });

    // Medicamentos — 7 pts (informativo, leve penalização por carga de medicação)
    const medPts = Math.max(7 - medications.length, 2);
    breakdown.push({ fator: 'Medicamentos', pontos: medPts, maximo: 7 });

    const score = Math.min(breakdown.reduce((s, b) => s + b.pontos, 0), 100);

    let classificacao: HealthScoreResult['classificacao'];
    if (score >= 85) classificacao = 'Excelente';
    else if (score >= 70) classificacao = 'Bom';
    else if (score >= 50) classificacao = 'Regular';
    else if (score >= 30) classificacao = 'Atenção';
    else classificacao = 'Crítico';

    return {
      score,
      classificacao,
      breakdown,
      explicacao: 'O score combina IMC, qualidade do sono, humor, ansiedade, hidratação, exercícios, sinais vitais, condições de saúde ativas e medicamentos em uso, cada um com um peso específico, somando até 100 pontos.',
    };
  },
};
