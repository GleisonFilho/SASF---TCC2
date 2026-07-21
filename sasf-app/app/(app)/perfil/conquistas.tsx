import { View, Text } from 'react-native';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
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

  if (loadingMembers || !membroId) return <LoadingScreen />;

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
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-6 items-center">
        <Text className="text-3xl font-bold text-primary">{unlockedCount}/{achievements.length}</Text>
        <Text className="text-sm text-gray-400 mt-1">conquistas desbloqueadas</Text>
      </View>

      {achievements.map((a) => (
        <View key={a.id} className={`bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5 flex-row items-center ${a.desbloqueada ? '' : 'opacity-50'}`}>
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${a.desbloqueada ? 'bg-primary-50' : 'bg-gray-100'}`}>
            <Icon name={a.icone} size={22} color={a.desbloqueada ? '#2563EB' : '#94A3B8'} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900">{a.titulo}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{a.descricao}</Text>
          </View>
          {a.desbloqueada && <Icon name="checkmark-circle" size={22} color="#16A34A" />}
        </View>
      ))}
    </ScreenContainer>
  );
}
