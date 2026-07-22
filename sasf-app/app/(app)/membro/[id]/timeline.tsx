import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../../components/ui/LoadingScreen';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Icon, type IoniconsName } from '../../../../components/ui/Icon';
import { useVitalSigns, useSymptoms } from '../../../../hooks/useHealthRecords';
import { useWeightRecords, useExercises, usePsychologyRecords } from '../../../../hooks/useWellness';
import { tipoMedicaoLabels } from '../../../../utils/labels';
import { formatFullDatePt } from '../../../../utils/date';

type TimelineEntry = {
  id: string;
  data: Date;
  icone: IoniconsName;
  titulo: string;
  detalhe: string;
  cor: string;
};

const tipoExercicioLabel: Record<string, string> = { CAMINHADA: 'Caminhada', CORRIDA: 'Corrida', ACADEMIA: 'Academia', CICLISMO: 'Ciclismo', NATACAO: 'Natação', FUTEBOL: 'Futebol', OUTRO: 'Exercício' };

function dayLabel(date: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date); target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Hoje';
  if (target.getTime() === yesterday.getTime()) return 'Ontem';
  return formatFullDatePt(target, { year: true });
}

function fmtTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const membroId = id || '';

  const vitalSigns = useVitalSigns(membroId);
  const symptoms = useSymptoms(membroId);
  const weight = useWeightRecords(membroId);
  const exercises = useExercises(membroId);
  const psych = usePsychologyRecords(membroId);

  const isLoading = vitalSigns.isLoading || symptoms.isLoading || weight.isLoading || exercises.isLoading || psych.isLoading;
  if (isLoading) return <LoadingScreen />;

  const entries: TimelineEntry[] = [
    ...(vitalSigns.data || []).map((v) => ({
      id: `vital-${v.id}`, data: new Date(v.dataHoraMedicao), icone: 'heart' as IoniconsName,
      titulo: tipoMedicaoLabels[v.tipoMedicao] || v.tipoMedicao,
      detalhe: `${v.valorPrimario}${v.valorSecundario ? `/${v.valorSecundario}` : ''} ${v.unidade}`,
      cor: '#DC2626',
    })),
    ...(symptoms.data || []).map((s) => ({
      id: `symptom-${s.id}`, data: new Date(s.dataHoraOcorrencia), icone: 'thermometer' as IoniconsName,
      titulo: s.descricao, detalhe: `Intensidade: ${s.intensidade}/10`, cor: '#F59E0B',
    })),
    ...(weight.data || []).map((w) => ({
      id: `weight-${w.id}`, data: new Date(w.dataHora), icone: 'scale' as IoniconsName,
      titulo: 'Peso registrado', detalhe: `${w.pesoKg} kg${w.imc ? ` · IMC ${w.imc}` : ''}`, cor: '#2563EB',
    })),
    ...(exercises.data || []).map((e) => ({
      id: `exercise-${e.id}`, data: new Date(e.dataHora), icone: 'fitness' as IoniconsName,
      titulo: tipoExercicioLabel[e.tipo] || e.tipo, detalhe: `${e.duracaoMin}min · ${e.intensidade}`, cor: '#16A34A',
    })),
    ...(psych.data || []).map((p) => ({
      id: `psych-${p.id}`, data: new Date(p.dataHora), icone: 'happy' as IoniconsName,
      titulo: 'Bem-estar registrado', detalhe: `Humor ${p.humor}/10 · Sono ${p.qualidadeSono}/10`, cor: '#06B6D4',
    })),
  ].sort((a, b) => b.data.getTime() - a.data.getTime());

  if (entries.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState icon="time-outline" title="Nenhum registro ainda" description="Registre sinais vitais, exercícios, peso e bem-estar para ver sua linha do tempo." />
      </ScreenContainer>
    );
  }

  // Agrupa por dia mantendo a ordem cronológica decrescente
  const groups: { label: string; items: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const label = dayLabel(entry.data);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }

  return (
    <ScreenContainer>
      {groups.map((group, gi) => (
        <View key={gi} className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-primary-50 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">{group.label}</Text>
            </View>
            <View className="flex-1 h-px bg-gray-100 ml-3" />
          </View>

          {group.items.map((item, i) => (
            <View key={item.id} className="flex-row mb-3">
              <View className="items-center mr-3">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: `${item.cor}1A` }}>
                  <Icon name={item.icone} size={16} color={item.cor} />
                </View>
                {i < group.items.length - 1 && <View className="w-px flex-1 bg-gray-100 mt-1" />}
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-sm shadow-gray-900/5 mb-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 text-sm">{item.titulo}</Text>
                  <Text className="text-xs text-gray-400">{fmtTime(item.data)}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-0.5">{item.detalhe}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}
