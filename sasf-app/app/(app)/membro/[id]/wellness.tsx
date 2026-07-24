import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { Input } from '../../../../components/ui/Input';
import { ChipSelect } from '../../../../components/ui/ChipSelect';
import { IconBadge } from '../../../../components/ui/IconBadge';
import { Button } from '../../../../components/ui/Button';
import { Icon, type IoniconsName } from '../../../../components/ui/Icon';
import { HealthScore } from '../../../../components/ui/HealthScore';
import { ProgressRing } from '../../../../components/ui/ProgressRing';
import { MiniChart } from '../../../../components/ui/MiniChart';
import { LineChart } from '../../../../components/ui/LineChart';
import { useToast } from '../../../../components/ui/Toast';
import { HealthSection } from '../../../../components/health/HealthSection';
import { AddModal } from '../../../../components/health/AddModal';
import { useVitalSigns, useSymptoms } from '../../../../hooks/useHealthRecords';
import {
  useNutritionProfile, useUpsertNutritionProfile,
  useWeightRecords, useCreateWeight, useDeleteWeight,
  useWaterRecords, useCreateWater,
  useMeals, useCreateMeal, useDeleteMeal,
  useExercises, useCreateExercise, useDeleteExercise, useExerciseWeeklyStats,
  usePsychologyRecords, useCreatePsychology, useDeletePsychology,
  useHealthInsights, useHealthScore,
} from '../../../../hooks/useWellness';
import type { RegistroPeso, RegistroRefeicao, RegistroExercicio, RegistroPsicologico } from '../../../../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: '#06B6D4' };
  if (imc < 25) return { label: 'Peso normal', color: '#16A34A' };
  if (imc < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
  return { label: 'Obesidade', color: '#DC2626' };
}

const tipoRefeicaoLabel: Record<string, string> = {
  CAFE_DA_MANHA: 'Café', LANCHE_MANHA: 'Lanche AM', ALMOCO: 'Almoço',
  LANCHE_TARDE: 'Lanche PM', JANTAR: 'Jantar', CEIA: 'Ceia', OUTRO: 'Outro',
};
const tipoExercicioLabel: Record<string, string> = {
  CAMINHADA: 'Caminhada', CORRIDA: 'Corrida', ACADEMIA: 'Academia',
  CICLISMO: 'Ciclismo', NATACAO: 'Natação', FUTEBOL: 'Futebol', OUTRO: 'Outro',
};
const tipoRefeicaoOptions = Object.entries(tipoRefeicaoLabel).map(([value, label]) => ({ value, label }));
const tipoExercicioOptions = Object.entries(tipoExercicioLabel).map(([value, label]) => ({ value, label }));
const intensidadeOptions = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADA', label: 'Moderada' },
  { value: 'INTENSA', label: 'Intensa' },
];
const intensidadeColor: Record<string, string> = { LEVE: '#16A34A', MODERADA: '#D97706', INTENSA: '#DC2626' };

type ModalType = 'weight' | 'water' | 'meal' | 'exercise' | 'psychology' | 'profile' | null;
type WellnessTab = 'nutricao' | 'exercicios' | 'psicologia';

function SectionHeading({ icon, title, actionLabel, onAction }: { icon: IoniconsName; title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <Icon name={icon} size={17} color="#0F172A" />
        <Text className="text-base font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text className="text-primary text-xs font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RingStat({ icon, color, progress, value, label, sublabel }: { icon: IoniconsName; color: string; progress: number; value: string; label: string; sublabel: string }) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
      <View className="mb-2">
        <ProgressRing progress={progress} size={84} strokeWidth={7} color={color} label={value} />
      </View>
      <View className="flex-row items-center">
        <Icon name={icon} size={12} color={color} />
        <Text className="text-xs font-semibold text-gray-700 ml-1">{label}</Text>
      </View>
      <Text className="text-[11px] text-gray-400 mt-0.5">{sublabel}</Text>
    </View>
  );
}

function EvolutionCard({ icon, title, data, color, unit }: { icon: IoniconsName; title: string; data: { label: string; value: number }[]; color: string; unit?: string }) {
  return (
    <View style={{ width: 268 }} className="bg-surface rounded-2xl p-4 mr-3 border border-gray-100 shadow-sm shadow-gray-900/5">
      <View className="flex-row items-center mb-3">
        <Icon name={icon} size={15} color={color} />
        <Text className="text-sm font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart data={data} color={color} height={110} unit={unit} />
      </ScrollView>
    </View>
  );
}

function TabBar({ tab, onChange }: { tab: WellnessTab; onChange: (t: WellnessTab) => void }) {
  const items: { key: WellnessTab; label: string }[] = [
    { key: 'nutricao', label: 'Nutrição' },
    { key: 'exercicios', label: 'Exercícios' },
    { key: 'psicologia', label: 'Psicologia' },
  ];
  return (
    <View className="flex-row gap-2 bg-gray-100 rounded-2xl p-1.5 mb-5">
      {items.map((item) => {
        const active = tab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={active ? { backgroundColor: '#FFFFFF', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } : undefined}
            onPress={() => onChange(item.key)}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold" style={{ color: active ? '#2563EB' : '#64748B' }}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function WellnessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const membroId = id || '';
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<WellnessTab>('nutricao');

  const profile = useNutritionProfile(membroId);
  const upsertProfile = useUpsertNutritionProfile(membroId);
  const weight = useWeightRecords(membroId);
  const createWeight = useCreateWeight(membroId);
  const deleteWeight = useDeleteWeight(membroId);
  const water = useWaterRecords(membroId);
  const createWater = useCreateWater(membroId);
  const meals = useMeals(membroId);
  const createMeal = useCreateMeal(membroId);
  const deleteMeal = useDeleteMeal(membroId);
  const exercises = useExercises(membroId);
  const createExercise = useCreateExercise(membroId);
  const deleteExercise = useDeleteExercise(membroId);
  const exerciseStats = useExerciseWeeklyStats(membroId);
  const psych = usePsychologyRecords(membroId);
  const createPsych = useCreatePsychology(membroId);
  const deletePsych = useDeletePsychology(membroId);
  const insights = useHealthInsights(membroId);
  const healthScore = useHealthScore(membroId);
  const vitalSigns = useVitalSigns(membroId);
  const symptoms = useSymptoms(membroId);

  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const resetForm = () => setForm({});
  const openModal = (type: ModalType) => { resetForm(); setModal(type); };
  const closeModal = () => setModal(null);

  const totalWater = water.data?.reduce((s, r) => s + r.quantidadeMl, 0) || 0;
  const metaAgua = profile.data?.metaAguaMl || 2000;
  const exerciseMin = exerciseStats.data?.totalMin || 0;
  const metaExercicioMin = 150;

  const currentWeight = weight.data?.[0] || null;
  const currentIMC = currentWeight?.imc ? parseFloat(currentWeight.imc) : null;
  const imcCategory = currentIMC !== null ? getIMCCategory(currentIMC) : null;
  const imcPct = currentIMC !== null ? Math.min(Math.max((currentIMC - 15) / (35 - 15), 0), 1) * 100 : 0;

  const weightTrend = weight.data?.slice(0, 7).reverse().map((w) => parseFloat(w.pesoKg)) || [];
  const weightData = [...(weight.data || [])].reverse().slice(-10).map((w) => ({ label: shortDate(w.dataHora), value: parseFloat(w.pesoKg) }));
  const sleepData = [...(psych.data || [])].reverse().slice(-10).map((p) => ({ label: shortDate(p.dataHora), value: p.qualidadeSono }));
  const moodData = [...(psych.data || [])].reverse().slice(-10).map((p) => ({ label: shortDate(p.dataHora), value: p.humor }));
  const energyData = [...(psych.data || [])].reverse().slice(-10).map((p) => ({ label: shortDate(p.dataHora), value: p.energia }));

  const nutritionCharts = [
    { key: 'peso', icon: 'scale-outline' as const, title: 'Evolução do Peso', data: weightData, color: '#2563EB', unit: 'kg' },
  ].filter((c) => c.data.length >= 2);

  const psychCharts = [
    { key: 'sono', icon: 'moon-outline' as const, title: 'Qualidade do Sono', data: sleepData, color: '#6366F1' },
    { key: 'humor', icon: 'happy-outline' as const, title: 'Humor', data: moodData, color: '#F59E0B' },
    { key: 'energia', icon: 'flash-outline' as const, title: 'Energia', data: energyData, color: '#8B5CF6' },
  ].filter((c) => c.data.length >= 2);

  type TimelineEntry = { id: string; data: Date; icone: IoniconsName; titulo: string; detalhe: string; cor: string };
  const timelineEntries: TimelineEntry[] = [
    ...(vitalSigns.data || []).map((v) => ({ id: `vital-${v.id}`, data: new Date(v.dataHoraMedicao), icone: 'heart' as IoniconsName, titulo: 'Sinal vital', detalhe: `${v.valorPrimario}${v.valorSecundario ? `/${v.valorSecundario}` : ''} ${v.unidade}`, cor: '#DC2626' })),
    ...(symptoms.data || []).map((s) => ({ id: `symptom-${s.id}`, data: new Date(s.dataHoraOcorrencia), icone: 'thermometer' as IoniconsName, titulo: s.descricao, detalhe: `Intensidade ${s.intensidade}/10`, cor: '#F59E0B' })),
    ...(weight.data || []).map((w) => ({ id: `weight-${w.id}`, data: new Date(w.dataHora), icone: 'scale' as IoniconsName, titulo: 'Peso registrado', detalhe: `${w.pesoKg} kg${w.imc ? ` · IMC ${w.imc}` : ''}`, cor: '#2563EB' })),
    ...(exercises.data || []).map((e) => ({ id: `exercise-${e.id}`, data: new Date(e.dataHora), icone: 'fitness' as IoniconsName, titulo: tipoExercicioLabel[e.tipo] || e.tipo, detalhe: `${e.duracaoMin}min · ${e.intensidade}`, cor: '#16A34A' })),
    ...(psych.data || []).map((p) => ({ id: `psych-${p.id}`, data: new Date(p.dataHora), icone: 'happy' as IoniconsName, titulo: 'Bem-estar registrado', detalhe: `Humor ${p.humor}/10 · Sono ${p.qualidadeSono}/10`, cor: '#06B6D4' })),
  ].sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, 5);

  const submitWeight = () => {
    const pesoKg = parseFloat(form.pesoKg);
    if (!pesoKg) { toast.show('Peso obrigatório.', 'error'); return; }
    createWeight.mutate({ pesoKg, dataHora: new Date().toISOString() }, {
      onSuccess: () => { closeModal(); toast.show('Peso registrado!', 'success'); },
      onError: () => toast.show('Erro ao registrar.', 'error'),
    });
  };

  const submitWater = () => {
    const ml = parseInt(form.quantidadeMl, 10);
    if (!ml) { toast.show('Quantidade obrigatória.', 'error'); return; }
    createWater.mutate({ quantidadeMl: ml, dataHora: new Date().toISOString() }, {
      onSuccess: () => { closeModal(); toast.show(`+${ml}ml de água!`, 'success'); },
      onError: () => toast.show('Erro ao registrar.', 'error'),
    });
  };

  const submitMeal = () => {
    if (!form.tipo || !form.descricao) { toast.show('Tipo e descrição obrigatórios.', 'error'); return; }
    createMeal.mutate({ tipo: form.tipo, descricao: form.descricao, calorias: form.calorias ? parseInt(form.calorias) : undefined, dataHora: new Date().toISOString() }, {
      onSuccess: () => { closeModal(); toast.show('Refeição registrada!', 'success'); },
      onError: () => toast.show('Erro ao registrar.', 'error'),
    });
  };

  const submitExercise = () => {
    if (!form.tipo || !form.duracaoMin || !form.intensidade) { toast.show('Preencha tipo, duração e intensidade.', 'error'); return; }
    createExercise.mutate({
      tipo: form.tipo, duracaoMin: parseInt(form.duracaoMin), intensidade: form.intensidade,
      distanciaKm: form.distanciaKm ? parseFloat(form.distanciaKm) : undefined,
      caloriasEst: form.caloriasEst ? parseInt(form.caloriasEst) : undefined,
      dataHora: new Date().toISOString(),
    }, {
      onSuccess: () => { closeModal(); toast.show('Exercício registrado!', 'success'); },
      onError: () => toast.show('Erro ao registrar.', 'error'),
    });
  };

  const submitPsychology = () => {
    const fields = ['humor', 'ansiedade', 'estresse', 'qualidadeSono', 'energia'];
    const values: Record<string, number> = {};
    for (const f of fields) {
      const v = parseInt(form[f], 10);
      if (!v || v < 1 || v > 10) { toast.show(`${f}: valor de 1 a 10.`, 'error'); return; }
      values[f] = v;
    }
    createPsych.mutate({ ...values, observacoes: form.observacoes || undefined, dataHora: new Date().toISOString() }, {
      onSuccess: () => { closeModal(); toast.show('Registro salvo!', 'success'); },
      onError: () => toast.show('Erro ao registrar.', 'error'),
    });
  };

  const submitProfile = () => {
    const data: Record<string, number> = {};
    if (form.alturaAtualCm) data.alturaAtualCm = parseFloat(form.alturaAtualCm);
    if (form.metaPesoKg) data.metaPesoKg = parseFloat(form.metaPesoKg);
    if (form.metaAguaMl) data.metaAguaMl = parseInt(form.metaAguaMl, 10);
    upsertProfile.mutate(data, {
      onSuccess: () => { closeModal(); toast.show('Perfil atualizado!', 'success'); },
      onError: () => toast.show('Erro ao salvar.', 'error'),
    });
  };

  return (
    <ScreenContainer>
      {/* Health Score — destaque principal do painel */}
      {healthScore.data && (
        <HealthScore
          score={healthScore.data.score}
          classificacao={healthScore.data.classificacao}
          breakdown={healthScore.data.breakdown}
          trend={healthScore.data.trend}
          explicacao={healthScore.data.explicacao}
        />
      )}

      {/* Insights */}
      {insights.data && insights.data.length > 0 && (
        <View className="mb-6">
          <SectionHeading icon="bulb-outline" title="Insights de Saúde" />
          {insights.data.map((insight, i) => {
            const tone = insight.tipo === 'alerta' ? { bg: 'bg-red-50 border-red-100', icon: 'alert-circle' as const, color: '#DC2626' }
              : insight.tipo === 'positivo' ? { bg: 'bg-green-50 border-green-100', icon: 'checkmark-circle' as const, color: '#16A34A' }
              : { bg: 'bg-blue-50 border-blue-100', icon: 'information-circle' as const, color: '#2563EB' };
            return (
              <View key={i} className={`rounded-xl p-3 mb-2 border flex-row ${tone.bg}`}>
                <Icon name={tone.icon} size={18} color={tone.color} />
                <View className="flex-1 ml-2.5">
                  <Text className="text-sm text-gray-800">{insight.mensagem}</Text>
                  <Text className="text-xs text-gray-400 mt-1">{insight.aviso}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Linha do tempo */}
      {timelineEntries.length > 0 && (
        <View className="mb-6">
          <SectionHeading icon="time-outline" title="Linha do Tempo" actionLabel="Ver tudo" onAction={() => router.push(`/(app)/membro/${membroId}/timeline`)} />
          <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5">
            {timelineEntries.map((entry, i) => (
              <View key={entry.id} className={`flex-row items-center px-4 py-3 ${i < timelineEntries.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${entry.cor}1A` }}>
                  <Icon name={entry.icone} size={16} color={entry.cor} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{entry.titulo}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{entry.detalhe}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ver estatísticas completas */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-surface rounded-2xl py-3 mb-6 border border-gray-100 shadow-sm shadow-gray-900/5"
        onPress={() => router.push(`/(app)/membro/${membroId}/estatisticas`)}
        activeOpacity={0.7}
      >
        <Icon name="stats-chart-outline" size={16} color="#2563EB" />
        <Text className="text-primary text-sm font-semibold ml-2">Ver todas as estatísticas</Text>
      </TouchableOpacity>

      <TabBar tab={tab} onChange={setTab} />

      {tab === 'nutricao' && (
        <>
          {/* Hidratação */}
          <View className="flex-row gap-3 mb-6">
            <RingStat icon="water" color="#06B6D4" progress={totalWater / metaAgua} value={`${totalWater}`} label="Água" sublabel={`ml de ${metaAgua}`} />
          </View>

          {/* Peso & IMC */}
          {currentWeight && (
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm shadow-gray-900/5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Peso atual</Text>
                  <Text className="text-2xl font-bold text-gray-900 mt-0.5">{currentWeight.pesoKg} <Text className="text-sm font-semibold text-gray-400">kg</Text></Text>
                </View>
                {weightTrend.length >= 2 && <MiniChart data={weightTrend} width={90} height={36} color="#2563EB" />}
              </View>

              {currentIMC !== null && imcCategory && (
                <View className="mt-4 pt-4 border-t border-gray-50">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs text-gray-500">IMC</Text>
                    <View className="flex-row items-center">
                      <Text className="text-sm font-bold text-gray-900 mr-2">{currentIMC.toFixed(1)}</Text>
                      <View style={{ backgroundColor: `${imcCategory.color}1A` }} className="px-2.5 py-1 rounded-full">
                        <Text style={{ color: imcCategory.color }} className="text-[11px] font-bold">{imcCategory.label}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden flex-row bg-gray-100">
                    <View style={{ flex: 3.5, backgroundColor: '#06B6D4' }} />
                    <View style={{ flex: 6.5, backgroundColor: '#16A34A' }} />
                    <View style={{ flex: 5, backgroundColor: '#F59E0B' }} />
                    <View style={{ flex: 5, backgroundColor: '#DC2626' }} />
                  </View>
                  <View style={{ marginLeft: `${imcPct}%` }} className="w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-900 -mt-2" />
                </View>
              )}
            </View>
          )}

          {/* Evolução do peso */}
          {nutritionCharts.length > 0 && (
            <View className="mb-6">
              <SectionHeading icon="trending-up-outline" title="Evolução" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                {nutritionCharts.map((c) => <EvolutionCard key={c.key} icon={c.icon} title={c.title} data={c.data} color={c.color} unit={c.unit} />)}
              </ScrollView>
            </View>
          )}

          {/* Perfil nutricional */}
          <SectionHeading
            icon="clipboard-outline"
            title="Perfil Nutricional"
            actionLabel="Editar"
            onAction={() => {
              setForm({
                alturaAtualCm: profile.data?.alturaAtualCm?.toString() || '',
                metaPesoKg: profile.data?.metaPesoKg?.toString() || '',
                metaAguaMl: profile.data?.metaAguaMl?.toString() || '',
              });
              setModal('profile');
            }}
          />
          {profile.data ? (
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
                <Icon name="resize-outline" size={17} color="#2563EB" />
                <Text className="text-sm font-bold text-gray-900 mt-1.5">{profile.data.alturaAtualCm || '—'} cm</Text>
                <Text className="text-[11px] text-gray-400">Altura</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
                <Icon name="flag-outline" size={17} color="#10B981" />
                <Text className="text-sm font-bold text-gray-900 mt-1.5">{profile.data.metaPesoKg || '—'} kg</Text>
                <Text className="text-[11px] text-gray-400">Meta de peso</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
                <Icon name="water-outline" size={17} color="#06B6D4" />
                <Text className="text-sm font-bold text-gray-900 mt-1.5">{profile.data.metaAguaMl || '—'} ml</Text>
                <Text className="text-[11px] text-gray-400">Meta de água</Text>
              </View>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
              <Text className="text-gray-400 text-sm">Configure seu perfil nutricional.</Text>
            </View>
          )}

          {/* Água rápida */}
          <View className="flex-row gap-2 mb-6">
            {[200, 300, 500].map((ml) => (
              <TouchableOpacity key={ml} className="flex-1 bg-accent-light rounded-xl py-3 items-center" activeOpacity={0.7}
                onPress={() => createWater.mutate({ quantidadeMl: ml, dataHora: new Date().toISOString() }, {
                  onSuccess: () => toast.show(`+${ml}ml!`, 'success'),
                  onError: () => toast.show('Erro ao registrar água.', 'error'),
                })}>
                <Text className="text-accent-dark font-bold">+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Peso */}
          <HealthSection<RegistroPeso> title="Peso" icon="scale-outline" emptyIcon="scale-outline" emptyText="Registre seu peso." data={weight.data} isLoading={weight.isLoading} addLabel="Registrar" onAdd={() => openModal('weight')} onDelete={(item) => deleteWeight.mutate(item.id)} getId={(i) => i.id} getLabel={(i) => `${i.pesoKg}kg`}
            renderItem={(item) => (
              <View className="flex-row items-center">
                <IconBadge icon="scale" color="#2563EB" />
                <View className="flex-1 ml-3 flex-row items-center justify-between">
                  <View>
                    <Text className="font-bold text-gray-900">{item.pesoKg} kg</Text>
                    {item.imc && <Text className="text-xs text-gray-400">IMC: {item.imc}</Text>}
                  </View>
                  <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                </View>
              </View>
            )}
          />

          {/* Refeições */}
          <HealthSection<RegistroRefeicao> title="Refeições" icon="restaurant-outline" emptyIcon="restaurant-outline" emptyText="Registre suas refeições." data={meals.data} isLoading={meals.isLoading} addLabel="Registrar" onAdd={() => openModal('meal')} onDelete={(item) => deleteMeal.mutate(item.id)} getId={(i) => i.id} getLabel={(i) => i.descricao}
            renderItem={(item) => (
              <View className="flex-row items-start">
                <IconBadge icon="restaurant" color="#F97316" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">{tipoRefeicaoLabel[item.tipo] || item.tipo}</Text>
                    <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{item.descricao}</Text>
                  {item.calorias && (
                    <View className="bg-orange-50 self-start px-2.5 py-1 rounded-full mt-1.5">
                      <Text className="text-xs font-semibold" style={{ color: '#F97316' }}>{item.calorias} kcal</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        </>
      )}

      {tab === 'exercicios' && (
        <>
          {/* Meta OMS */}
          <View className="flex-row gap-3 mb-6">
            <RingStat icon="fitness" color="#16A34A" progress={exerciseMin / metaExercicioMin} value={`${exerciseMin}`} label="Atividade" sublabel={`min de ${metaExercicioMin}`} />
          </View>

          {/* Exercícios */}
          <HealthSection<RegistroExercicio> title="Exercícios" icon="barbell-outline" emptyIcon="walk-outline" emptyText="Registre seus exercícios." data={exercises.data} isLoading={exercises.isLoading} addLabel="Registrar" onAdd={() => openModal('exercise')} onDelete={(item) => deleteExercise.mutate(item.id)} getId={(i) => i.id} getLabel={(i) => tipoExercicioLabel[i.tipo] || i.tipo}
            renderItem={(item) => {
              const color = intensidadeColor[item.intensidade] || '#16A34A';
              return (
                <View className="flex-row items-start">
                  <IconBadge icon="barbell" color="#16A34A" />
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold text-gray-900">{tipoExercicioLabel[item.tipo]}</Text>
                      <Text className="text-xs text-gray-400">{fmtDate(item.dataHora)}</Text>
                    </View>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      <Text className="text-xs text-gray-500">{item.duracaoMin}min{item.caloriasEst ? ` · ${item.caloriasEst}kcal` : ''}</Text>
                      <View style={{ backgroundColor: `${color}1A` }} className="px-2 py-0.5 rounded-full">
                        <Text style={{ color }} className="text-[11px] font-semibold">{item.intensidade}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </>
      )}

      {tab === 'psicologia' && (
        <>
          {psychCharts.length > 0 && (
            <View className="mb-6">
              <SectionHeading icon="trending-up-outline" title="Evolução" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                {psychCharts.map((c) => <EvolutionCard key={c.key} icon={c.icon} title={c.title} data={c.data} color={c.color} />)}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            className="bg-warning rounded-2xl py-3.5 mb-6 flex-row items-center justify-center"
            onPress={() => openModal('psychology')}
            activeOpacity={0.8}
          >
            <Icon name="happy" size={18} color="#fff" />
            <Text className="text-white font-bold text-sm ml-2">Registrar como me sinto hoje</Text>
          </TouchableOpacity>

          {/* Bem-estar psicológico */}
          <HealthSection<RegistroPsicologico> title="Bem-estar" icon="pulse-outline" emptyIcon="pulse-outline" emptyText="Registre seu estado emocional." data={psych.data} isLoading={psych.isLoading} addLabel="Registrar" onAdd={() => openModal('psychology')} onDelete={(item) => deletePsych.mutate(item.id)} getId={(i) => i.id} getLabel={(i) => `Humor: ${i.humor}/10`}
            renderItem={(item) => (
              <View className="flex-row items-start">
                <IconBadge icon="happy" color={moodTone(item.humor)} />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-400 mb-1.5">{fmtDate(item.dataHora)}</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    <Badge label={`Humor ${item.humor}`} value={item.humor} />
                    <Badge label={`Sono ${item.qualidadeSono}`} value={item.qualidadeSono} />
                    <Badge label={`Energia ${item.energia}`} value={item.energia} />
                    <Badge label={`Ansiedade ${item.ansiedade}`} value={item.ansiedade} invert />
                    <Badge label={`Estresse ${item.estresse}`} value={item.estresse} invert />
                  </View>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* MODALS */}
      <AddModal visible={modal === 'profile'} title="Perfil Nutricional" onClose={closeModal}>
        <Input label="Altura (cm)" icon="resize-outline" placeholder="170" keyboardType="numeric" value={form.alturaAtualCm || ''} onChangeText={(v) => setForm({ ...form, alturaAtualCm: v })} />
        <Input label="Meta de peso (kg)" icon="flag-outline" placeholder="70" keyboardType="numeric" value={form.metaPesoKg || ''} onChangeText={(v) => setForm({ ...form, metaPesoKg: v })} />
        <Input label="Meta de água (ml/dia)" icon="water-outline" placeholder="2500" keyboardType="numeric" value={form.metaAguaMl || ''} onChangeText={(v) => setForm({ ...form, metaAguaMl: v })} />
        <Button title="Salvar" onPress={submitProfile} loading={upsertProfile.isPending} />
      </AddModal>

      <AddModal visible={modal === 'weight'} title="Registrar Peso" onClose={closeModal}>
        <Input label="Peso (kg)" icon="scale-outline" placeholder="75.5" keyboardType="numeric" value={form.pesoKg || ''} onChangeText={(v) => setForm({ ...form, pesoKg: v })} />
        <Button title="Registrar" onPress={submitWeight} loading={createWeight.isPending} />
      </AddModal>

      <AddModal visible={modal === 'water'} title="Registrar Água" onClose={closeModal}>
        <Input label="Quantidade (ml)" icon="water-outline" placeholder="250" keyboardType="numeric" value={form.quantidadeMl || ''} onChangeText={(v) => setForm({ ...form, quantidadeMl: v })} />
        <Button title="Registrar" onPress={submitWater} loading={createWater.isPending} />
      </AddModal>

      <AddModal visible={modal === 'meal'} title="Registrar Refeição" onClose={closeModal}>
        <ChipSelect label="Tipo" options={tipoRefeicaoOptions} value={form.tipo || ''} onChange={(v) => setForm({ ...form, tipo: v })} />
        <Input label="Descrição" icon="create-outline" placeholder="Arroz, feijão, frango..." value={form.descricao || ''} onChangeText={(v) => setForm({ ...form, descricao: v })} />
        <Input label="Calorias (opcional)" icon="flame-outline" placeholder="650" keyboardType="numeric" value={form.calorias || ''} onChangeText={(v) => setForm({ ...form, calorias: v })} />
        <Button title="Registrar" onPress={submitMeal} loading={createMeal.isPending} />
      </AddModal>

      <AddModal visible={modal === 'exercise'} title="Registrar Exercício" onClose={closeModal}>
        <ChipSelect label="Tipo" options={tipoExercicioOptions} value={form.tipo || ''} onChange={(v) => setForm({ ...form, tipo: v })} />
        <Input label="Duração (min)" icon="time-outline" placeholder="45" keyboardType="numeric" value={form.duracaoMin || ''} onChangeText={(v) => setForm({ ...form, duracaoMin: v })} />
        <ChipSelect label="Intensidade" options={intensidadeOptions} value={form.intensidade || ''} onChange={(v) => setForm({ ...form, intensidade: v })} />
        <Input label="Distância km (opcional)" icon="navigate-outline" placeholder="3.5" keyboardType="numeric" value={form.distanciaKm || ''} onChangeText={(v) => setForm({ ...form, distanciaKm: v })} />
        <Input label="Calorias est. (opcional)" icon="flame-outline" placeholder="200" keyboardType="numeric" value={form.caloriasEst || ''} onChangeText={(v) => setForm({ ...form, caloriasEst: v })} />
        <Button title="Registrar" onPress={submitExercise} loading={createExercise.isPending} />
      </AddModal>

      <AddModal visible={modal === 'psychology'} title="Como você está?" onClose={closeModal}>
        <Input label="Humor (1-10)" icon="happy-outline" placeholder="7" keyboardType="numeric" value={form.humor || ''} onChangeText={(v) => setForm({ ...form, humor: v })} />
        <Input label="Ansiedade (1-10)" icon="pulse-outline" placeholder="3" keyboardType="numeric" value={form.ansiedade || ''} onChangeText={(v) => setForm({ ...form, ansiedade: v })} />
        <Input label="Estresse (1-10)" icon="warning-outline" placeholder="4" keyboardType="numeric" value={form.estresse || ''} onChangeText={(v) => setForm({ ...form, estresse: v })} />
        <Input label="Qualidade do sono (1-10)" icon="moon-outline" placeholder="8" keyboardType="numeric" value={form.qualidadeSono || ''} onChangeText={(v) => setForm({ ...form, qualidadeSono: v })} />
        <Input label="Energia (1-10)" icon="flash-outline" placeholder="6" keyboardType="numeric" value={form.energia || ''} onChangeText={(v) => setForm({ ...form, energia: v })} />
        <Input label="Observações (opcional)" icon="document-text-outline" placeholder="Como foi seu dia?" value={form.observacoes || ''} onChangeText={(v) => setForm({ ...form, observacoes: v })} />
        <Button title="Registrar" onPress={submitPsychology} loading={createPsych.isPending} />
      </AddModal>
    </ScreenContainer>
  );
}

function moodTone(value: number): string {
  if (value >= 7) return '#16A34A';
  if (value >= 4) return '#D97706';
  return '#DC2626';
}

function Badge({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value <= 4 : value >= 7;
  const mid = invert ? value <= 6 : value >= 4;
  const bgHex = good ? '#DCFCE7' : mid ? '#FEF9C3' : '#FEE2E2';
  const textHex = good ? '#15803D' : mid ? '#A16207' : '#B91C1C';
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: bgHex }}>
      <Text className="text-xs font-semibold" style={{ color: textHex }}>{label}</Text>
    </View>
  );
}
