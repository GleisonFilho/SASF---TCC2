import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { useFamilyMembers } from '../../../hooks/useFamilyMembers';
import { useVitalSigns, useSymptoms, useConditions, useAllergies, useMedications, useEmergencyContacts } from '../../../hooks/useHealthRecords';
import { useWeightRecords, useWaterRecords, useExercises, usePsychologyRecords } from '../../../hooks/useWellness';
import { useSharings } from '../../../hooks/useSharing';
import { computeAchievements, calculateStreak } from '../../../utils/achievements';

export default function ConquistasScreen() {
  const { data: members, isLoading: loadingMembers } = useFamilyMembers();
  const membroId = members?.[0]?.id || '';

  const vitalSigns = useVitalSigns(membroId);
  const symptoms = useSymptoms(membroId);
  const conditions = useConditions(membroId);
  const allergies = useAllergies(membroId);
  const medications = useMedications(membroId);
  const contacts = useEmergencyContacts(membroId);
  const weight = useWeightRecords(membroId);
  const water = useWaterRecords(membroId);
  const exercises = useExercises(membroId);
  const psych = usePsychologyRecords(membroId);
  const { data: sharings } = useSharings();

  if (loadingMembers) return <LoadingScreen />;
  if (!membroId) {
    return (
      <ScreenContainer>
        <EmptyState icon="trophy-outline" title="Nenhuma conquista ainda" description="Cadastre um membro da família e registre dados de saúde para desbloquear medalhas." />
      </ScreenContainer>
    );
  }

  const totalRegistrosSaude =
    (vitalSigns.data?.length || 0) + (symptoms.data?.length || 0) + (weight.data?.length || 0) +
    (water.data?.length || 0) + (exercises.data?.length || 0) + (psych.data?.length || 0);

  const diasConsecutivosAgua = calculateStreak((water.data || []).map((r) => r.dataHora));
  const diasConsecutivosExercicio = calculateStreak((exercises.data || []).map((r) => r.dataHora));

  const perfilCompleto =
    (conditions.data?.length || 0) > 0 &&
    (allergies.data?.length || 0) > 0 &&
    (medications.data?.length || 0) > 0 &&
    (contacts.data?.length || 0) > 0;

  const achievements = computeAchievements({
    totalRegistrosSaude,
    diasConsecutivosAgua,
    diasConsecutivosExercicio,
    totalRegistrosPsicologicos: psych.data?.length || 0,
    perfilCompleto,
    totalExercicios: exercises.data?.length || 0,
    totalCompartilhamentos: sharings?.length || 0,
  });

  const unlockedCount = achievements.filter((a) => a.desbloqueada).length;

  return (
    <ScreenContainer>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ borderRadius: 20, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}
      >
        <View className="w-13 h-13 rounded-2xl items-center justify-center" style={{ width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <Icon name="trophy" size={26} color="#fff" />
        </View>
        <View>
          <Text className="text-2xl font-extrabold text-white">{unlockedCount} de {achievements.length}</Text>
          <Text className="text-white/85 text-xs mt-0.5">medalhas desbloqueadas</Text>
        </View>
      </LinearGradient>

      <View className="flex-row flex-wrap gap-3">
        {achievements.map((a) => (
          <View key={a.id} className={`bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5 items-center ${a.desbloqueada ? '' : 'opacity-45'}`} style={{ width: '47%' }}>
            <View className={`w-13 h-13 rounded-2xl items-center justify-center mb-2`} style={{ width: 52, height: 52, backgroundColor: a.desbloqueada ? '#EFF6FF' : '#F1F5F9' }}>
              <Icon name={a.icone} size={26} color={a.desbloqueada ? '#2563EB' : '#94A3B8'} />
            </View>
            <Text className="font-extrabold text-gray-900 text-xs text-center">{a.titulo}</Text>
            <Text className="text-[10.5px] text-gray-400 mt-1 text-center leading-4">{a.descricao}</Text>
            <View className={`mt-2 px-2.5 py-1 rounded-lg ${a.desbloqueada ? 'bg-success-light' : 'bg-gray-100'}`}>
              <Text className={`text-[10px] font-extrabold ${a.desbloqueada ? 'text-success' : 'text-gray-400'}`}>{a.desbloqueada ? 'Desbloqueada' : 'Bloqueada'}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
