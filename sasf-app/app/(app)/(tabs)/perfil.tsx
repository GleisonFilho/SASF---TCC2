import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { useAuthStore } from '../../../store/authStore';
import { useFamilyMembers } from '../../../hooks/useFamilyMembers';
import { useWaterRecords, useExercises, usePsychologyRecords } from '../../../hooks/useWellness';
import { useVitalSigns, useSymptoms, useConditions, useAllergies, useMedications, useEmergencyContacts } from '../../../hooks/useHealthRecords';
import { useSharings } from '../../../hooks/useSharing';
import { computeAchievements, calculateStreak } from '../../../utils/achievements';

const perfilLabel: Record<string, string> = {
  PACIENTE: 'Paciente / Responsável', PROFISSIONAL: 'Profissional de Saúde', ADMIN: 'Administrador',
};

type MenuIcon = IoniconsName;

const accountItems: { icon: MenuIcon; iconBg: string; iconColor: string; label: string; description: string; route: string }[] = [
  { icon: 'create-outline', iconBg: 'bg-primary-50', iconColor: '#2563EB', label: 'Editar Perfil', description: 'Nome, telefone, endereço e mais', route: '/(app)/perfil/editar' },
];

const appItems: { icon: MenuIcon; iconBg: string; iconColor: string; label: string; description: string; route: string }[] = [
  { icon: 'trophy-outline', iconBg: 'bg-warning-light', iconColor: '#D97706', label: 'Conquistas', description: 'Acompanhe suas medalhas de saúde', route: '/(app)/perfil/conquistas' },
  { icon: 'watch-outline', iconBg: 'bg-accent-light', iconColor: '#0E7490', label: 'Dispositivos', description: 'Smartwatch e pulseiras fitness', route: '/(app)/perfil/dispositivos' },
  { icon: 'settings-outline', iconBg: 'bg-gray-100', iconColor: '#475569', label: 'Configurações', description: 'Tema, notificações e privacidade', route: '/(app)/perfil/configuracoes' },
  { icon: 'information-circle-outline', iconBg: 'bg-secondary-light', iconColor: '#059669', label: 'Sobre o SASF', description: 'Missão, versão e tecnologias', route: '/(app)/perfil/sobre' },
];

function MenuGroup({ label, items, onPress }: { label: string; items: typeof accountItems; onPress: (route: string) => void }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">{label}</Text>
      <View className="bg-surface rounded-2xl border border-gray-100 shadow-sm shadow-gray-900/5">
        {items.map((item, i) => (
          <TouchableOpacity
            key={item.route}
            className={`flex-row items-center px-4 py-4 ${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}
            onPress={() => onPress(item.route)}
            activeOpacity={0.7}
          >
            <View className={`w-10 h-10 rounded-xl ${item.iconBg} items-center justify-center mr-3`}>
              <Icon name={item.icon} size={18} color={item.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">{item.label}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{item.description}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const goTo = (route: string) => router.push(route as any);

  const { data: members } = useFamilyMembers();
  const membroId = members?.[0]?.id || '';
  const water = useWaterRecords(membroId);
  const exercises = useExercises(membroId);
  const psych = usePsychologyRecords(membroId);
  const vitalSigns = useVitalSigns(membroId);
  const symptoms = useSymptoms(membroId);
  const conditions = useConditions(membroId);
  const allergies = useAllergies(membroId);
  const medications = useMedications(membroId);
  const contacts = useEmergencyContacts(membroId);
  const { data: sharings } = useSharings();

  const streak = calculateStreak([
    ...(water.data || []).map((r) => r.dataHora),
    ...(exercises.data || []).map((r) => r.dataHora),
    ...(psych.data || []).map((r) => r.dataHora),
  ]);
  const achievements = computeAchievements({
    totalRegistrosSaude: (vitalSigns.data?.length || 0) + (symptoms.data?.length || 0) + (water.data?.length || 0) + (exercises.data?.length || 0) + (psych.data?.length || 0),
    diasConsecutivosAgua: calculateStreak((water.data || []).map((r) => r.dataHora)),
    diasConsecutivosExercicio: calculateStreak((exercises.data || []).map((r) => r.dataHora)),
    totalRegistrosPsicologicos: psych.data?.length || 0,
    perfilCompleto: (conditions.data?.length || 0) > 0 && (allergies.data?.length || 0) > 0 && (medications.data?.length || 0) > 0 && (contacts.data?.length || 0) > 0,
    totalExercicios: exercises.data?.length || 0,
    totalCompartilhamentos: sharings?.length || 0,
  });
  const unlockedCount = achievements.filter((a) => a.desbloqueada).length;

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 mb-5 mt-2 tracking-tight">Perfil</Text>

      {/* Hero */}
      <View className="bg-gray-900 rounded-4xl p-6 mb-4 shadow-md shadow-gray-900/20">
        <View className="items-center">
          <View className="relative mb-4">
            {user?.fotoUrl ? (
              <Image source={{ uri: user.fotoUrl }} style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)' }} />
            ) : (
              <LinearGradient
                colors={['#2563EB', '#06B6D4']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)' }}
              >
                <Text className="text-white font-extrabold text-4xl">{user?.nome?.[0] || '?'}</Text>
              </LinearGradient>
            )}
            <TouchableOpacity
              onPress={() => goTo('/(app)/perfil/editar')}
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm"
            >
              <Icon name="pencil" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-white">{user?.nome}</Text>
          <Text className="text-xs text-white/50 mt-1">{user?.email}</Text>
          <View className="bg-white/10 px-4 py-1.5 rounded-full mt-3 flex-row items-center">
            <Icon name="shield-checkmark-outline" size={13} color="#fff" />
            <Text className="text-white text-xs font-semibold ml-1.5">{perfilLabel[user?.tipoPerfil || ''] || user?.tipoPerfil}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-2.5 mb-6">
        <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
          <Text className="text-primary text-xl font-extrabold">{members?.length ?? 0}</Text>
          <Text className="text-gray-400 text-[11px] font-semibold mt-0.5">Membros</Text>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
          <Text className="text-success text-xl font-extrabold">{unlockedCount}</Text>
          <Text className="text-gray-400 text-[11px] font-semibold mt-0.5">Medalhas</Text>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-3.5 border border-gray-100 shadow-sm shadow-gray-900/5 items-center">
          <Text className="text-accent text-xl font-extrabold">{streak}d</Text>
          <Text className="text-gray-400 text-[11px] font-semibold mt-0.5">Sequência</Text>
        </View>
      </View>

      <MenuGroup label="Conta" items={accountItems} onPress={goTo} />
      <MenuGroup label="Aplicativo" items={appItems} onPress={goTo} />

      <View className="items-center mb-4">
        <View className="bg-gray-50 px-3 py-1.5 rounded-full">
          <Text className="text-xs text-gray-400">SASF v1.0 · IFPI Campus Picos</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
