import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../../components/ui/LoadingScreen';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { LineChart } from '../../../../components/ui/LineChart';
import { Icon, type IoniconsName } from '../../../../components/ui/Icon';
import { useVitalSigns } from '../../../../hooks/useHealthRecords';
import { useWeightRecords, useWaterRecords, useExercises, usePsychologyRecords } from '../../../../hooks/useWellness';

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function ChartCard({ icon, title, children }: { icon: IoniconsName; title: string; children: React.ReactNode }) {
  return (
    <View className="bg-surface rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm shadow-gray-900/5">
      <View className="flex-row items-center mb-3">
        <Icon name={icon} size={16} color="#0F172A" />
        <Text className="text-sm font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const BAR_AREA_HEIGHT = 100;
const WEEKLY_GOAL_MIN = 150;

function ExerciseWeekBars({ exercises }: { exercises: { dataHora: string; duracaoMin: number }[] }) {
  const dailyGoal = WEEKLY_GOAL_MIN / 7;
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - (6 - i));
    const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
    const minutos = exercises
      .filter((e) => { const d = new Date(e.dataHora); return d >= day && d <= dayEnd; })
      .reduce((s, e) => s + e.duracaoMin, 0);
    return { label: WEEKDAY_LABELS[day.getDay()], minutos };
  });
  const maxMinutos = Math.max(...days.map((d) => d.minutos), 1);
  const totalSemana = days.reduce((s, d) => s + d.minutos, 0);

  return (
    <View className="bg-surface rounded-3xl p-4 mb-4 border border-gray-100 shadow-sm shadow-gray-900/5">
      <View className="flex-row items-center mb-1">
        <Icon name="fitness-outline" size={16} color="#0F172A" />
        <Text className="text-sm font-bold text-gray-900 ml-2">Minutos de Exercício</Text>
      </View>
      <Text className="text-xs text-gray-400 mb-4">Esta semana · meta {WEEKLY_GOAL_MIN} min ({totalSemana} min registrados)</Text>
      <View style={{ height: BAR_AREA_HEIGHT }} className="flex-row items-end justify-between gap-2">
        {days.map((d, i) => (
          <View key={i} className="flex-1 items-center justify-end" style={{ height: BAR_AREA_HEIGHT }}>
            <View
              style={{
                width: '100%',
                maxWidth: 26,
                height: Math.max((d.minutos / maxMinutos) * (BAR_AREA_HEIGHT - 18), 4),
                backgroundColor: d.minutos >= dailyGoal ? '#16A34A' : '#E2E8F0',
                borderRadius: 6,
              }}
            />
            <Text className="text-[10.5px] text-gray-400 font-semibold mt-1.5">{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function EstatisticasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const membroId = id || '';

  const vitalSigns = useVitalSigns(membroId);
  const weight = useWeightRecords(membroId);
  const water = useWaterRecords(membroId);
  const exercises = useExercises(membroId);
  const psych = usePsychologyRecords(membroId);

  const isLoading = vitalSigns.isLoading || weight.isLoading || water.isLoading || exercises.isLoading || psych.isLoading;
  if (isLoading) return <LoadingScreen />;

  const hasAnyData = (weight.data?.length || 0) > 0 || (psych.data?.length || 0) > 0 || (exercises.data?.length || 0) > 0 || (vitalSigns.data?.length || 0) > 0 || (water.data?.length || 0) > 0;
  if (!hasAnyData) {
    return (
      <ScreenContainer>
        <EmptyState icon="stats-chart-outline" title="Sem dados ainda" description="Registre peso, exercícios, sinais vitais e bem-estar para visualizar gráficos." />
      </ScreenContainer>
    );
  }

  const weightData = [...(weight.data || [])].reverse().slice(-10).map((w) => ({ label: shortDate(w.dataHora), value: parseFloat(w.pesoKg) }));
  const moodData = [...(psych.data || [])].reverse().slice(-10).map((p) => ({ label: shortDate(p.dataHora), value: p.humor }));
  const sleepData = [...(psych.data || [])].reverse().slice(-10).map((p) => ({ label: shortDate(p.dataHora), value: p.qualidadeSono }));

  const pressaoRecords = (vitalSigns.data || []).filter((v) => v.tipoMedicao === 'PRESSAO').reverse().slice(-10);
  const pressaoData = pressaoRecords.map((v) => ({ label: shortDate(v.dataHoraMedicao), value: parseFloat(v.valorPrimario) }));

  const glicemiaData = (vitalSigns.data || []).filter((v) => v.tipoMedicao === 'GLICEMIA').reverse().slice(-10).map((v) => ({ label: shortDate(v.dataHoraMedicao), value: parseFloat(v.valorPrimario) }));

  const waterByDay = (() => {
    const buckets: Record<string, number> = {};
    for (const w of water.data || []) {
      const key = shortDate(w.dataHora);
      buckets[key] = (buckets[key] || 0) + w.quantidadeMl;
    }
    return Object.entries(buckets).slice(-10).map(([label, value]) => ({ label, value }));
  })();

  return (
    <ScreenContainer>
      {weightData.length >= 2 && (
        <ChartCard icon="scale-outline" title="Evolução do Peso">
          <LineChart data={weightData} color="#2563EB" unit="kg" />
        </ChartCard>
      )}

      {waterByDay.length >= 2 && (
        <ChartCard icon="water-outline" title="Consumo de Água">
          <LineChart data={waterByDay} color="#06B6D4" unit="ml" />
        </ChartCard>
      )}

      {(exercises.data?.length || 0) > 0 && <ExerciseWeekBars exercises={exercises.data || []} />}

      {moodData.length >= 2 && (
        <ChartCard icon="happy-outline" title="Humor">
          <LineChart data={moodData} color="#F59E0B" />
        </ChartCard>
      )}

      {pressaoData.length >= 2 && (
        <ChartCard icon="heart-outline" title="Pressão Arterial (sistólica)">
          <LineChart data={pressaoData} color="#DC2626" unit="mmHg" />
        </ChartCard>
      )}

      {glicemiaData.length >= 2 && (
        <ChartCard icon="water-outline" title="Glicemia">
          <LineChart data={glicemiaData} color="#EC4899" unit="mg/dL" />
        </ChartCard>
      )}

      {sleepData.length >= 2 && (
        <ChartCard icon="moon-outline" title="Qualidade do Sono">
          <LineChart data={sleepData} color="#6366F1" />
        </ChartCard>
      )}
    </ScreenContainer>
  );
}
