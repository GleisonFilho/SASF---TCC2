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

  const hasAnyData = (weight.data?.length || 0) > 0 || (psych.data?.length || 0) > 0 || (exercises.data?.length || 0) > 0 || (vitalSigns.data?.length || 0) > 0;
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

  const exerciseByWeek = (() => {
    const buckets: Record<string, number> = {};
    for (const e of exercises.data || []) {
      const dayKey = shortDate(e.dataHora);
      buckets[dayKey] = (buckets[dayKey] || 0) + e.duracaoMin;
    }
    return Object.entries(buckets).slice(-10).map(([label, value]) => ({ label, value }));
  })();

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

      {exerciseByWeek.length >= 2 && (
        <ChartCard icon="fitness-outline" title="Exercícios">
          <LineChart data={exerciseByWeek} color="#16A34A" unit="min" />
        </ChartCard>
      )}

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
