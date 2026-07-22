import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { StatCard } from '../../../components/ui/StatCard';
import { HealthScore } from '../../../components/ui/HealthScore';
import { AchievementBadge } from '../../../components/ui/AchievementBadge';
import { MemberScoreRing } from '../../../components/ui/MemberScoreRing';
import { CardSkeleton } from '../../../components/ui/Skeleton';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { primaryShadow, accentShadow } from '../../../constants/shadows';
import { useAuthStore } from '../../../store/authStore';
import { useFamilyMembers } from '../../../hooks/useFamilyMembers';
import { useSharings } from '../../../hooks/useSharing';
import { useConditions, useMedications } from '../../../hooks/useHealthRecords';
import { useWaterRecords, useWeightRecords, useExerciseWeeklyStats, usePsychologyRecords, useHealthScore } from '../../../hooks/useWellness';
import { computeAchievements, calculateStreak } from '../../../utils/achievements';
import { formatFullDatePt } from '../../../utils/date';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia,';
  if (hour < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function todayLabel(): string {
  return formatFullDatePt(new Date(), { weekday: true });
}

function NumberChip({ icon, color, value, label }: { icon: IoniconsName; color: string; value: string | number; label: string }) {
  return (
    <View className="flex-row items-center bg-surface rounded-2xl px-3.5 py-2.5 mr-2.5 border border-gray-100 shadow-sm shadow-gray-900/5">
      <Icon name={icon} size={15} color={color} />
      <Text className="text-sm font-bold text-gray-900 ml-1.5">{value}</Text>
      <Text className="text-xs text-gray-400 ml-1">{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: members, isLoading, error, refetch } = useFamilyMembers();
  const { data: sharings } = useSharings();
  const router = useRouter();

  const firstName = user?.nome.split(' ')[0] || '';
  const isAdmin = user?.tipoPerfil === 'ADMIN';
  const activeShareCount = sharings?.filter((s) => s.status === 'ATIVO').length || 0;
  const firstMemberId = members?.[0]?.id || '';

  const water = useWaterRecords(firstMemberId);
  const weight = useWeightRecords(firstMemberId);
  const exerciseStats = useExerciseWeeklyStats(firstMemberId);
  const psych = usePsychologyRecords(firstMemberId);
  const conditions = useConditions(firstMemberId);
  const medications = useMedications(firstMemberId);
  const healthScore = useHealthScore(firstMemberId);

  if (error) return <ErrorMessage message="Erro ao carregar dados." onRetry={refetch} />;

  const totalWater = water.data?.reduce((s, r) => s + r.quantidadeMl, 0) || 0;
  const weightData = weight.data?.slice(0, 7).reverse().map((w) => parseFloat(w.pesoKg)) || [];
  const currentWeight = weight.data?.[0]?.pesoKg || '—';
  const currentIMC = weight.data?.[0]?.imc || '—';
  const exerciseMin = exerciseStats.data?.totalMin || 0;

  const recentPsych = psych.data?.slice(0, 7) || [];
  const avgMood = recentPsych.length ? Math.round((recentPsych.reduce((s, p) => s + p.humor, 0) / recentPsych.length) * 10) / 10 : null;

  const streak = calculateStreak([
    ...(water.data || []).map((r) => r.dataHora),
    ...(exerciseStats.data?.records || []).map((r) => r.dataHora),
    ...(psych.data || []).map((r) => r.dataHora),
  ]);

  const achievements = computeAchievements({
    totalRegistrosSaude: (water.data?.length || 0) + (exerciseStats.data?.records.length || 0) + (psych.data?.length || 0) + (weight.data?.length || 0),
    diasConsecutivosAgua: calculateStreak((water.data || []).map((r) => r.dataHora)),
    diasConsecutivosExercicio: calculateStreak((exerciseStats.data?.records || []).map((r) => r.dataHora)),
    totalRegistrosPsicologicos: psych.data?.length || 0,
    perfilCompleto: (conditions.data?.length || 0) > 0 && (medications.data?.length || 0) > 0,
    totalExercicios: exerciseStats.data?.records.length || 0,
    totalCompartilhamentos: sharings?.length || 0,
  });
  const unlockedAchievements = achievements.filter((a) => a.desbloqueada);

  // Resumo do dia: só entram no grid os indicadores com dado disponível.
  const summaryTiles = [
    { key: 'peso', icon: 'scale-outline' as const, iconColor: '#2563EB', iconBg: 'bg-primary-50', title: 'Último Peso', value: `${currentWeight} kg`, subtitle: `IMC ${currentIMC}`, chartData: weightData, chartColor: '#2563EB' },
    { key: 'agua', icon: 'water-outline' as const, iconColor: '#06B6D4', iconBg: 'bg-accent-light', title: 'Água Hoje', value: `${totalWater} ml`, subtitle: 'Meta 2000ml' },
    { key: 'exercicio', icon: 'fitness-outline' as const, iconColor: '#16A34A', iconBg: 'bg-success-light', title: 'Exercícios', value: `${exerciseMin} min`, subtitle: 'Meta 150min/sem' },
    ...(avgMood !== null ? [{ key: 'humor', icon: 'happy-outline' as const, iconColor: '#F59E0B', iconBg: 'bg-warning-light', title: 'Humor Médio', value: `${avgMood}/10`, subtitle: `${recentPsych.length} registros` }] : []),
  ];
  const tileRows: (typeof summaryTiles)[] = [];
  for (let i = 0; i < summaryTiles.length; i += 2) tileRows.push(summaryTiles.slice(i, i + 2));

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 mt-2">
        <View>
          <Text className="text-sm text-gray-400">{getGreeting()}</Text>
          <Text className="text-2xl font-bold text-gray-900 tracking-tight">{firstName}</Text>
          <Text className="text-xs text-gray-400 mt-0.5">{todayLabel()}</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            className="w-11 h-11 rounded-2xl bg-surface border border-gray-100 items-center justify-center"
            style={{ shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
            onPress={() => router.push('/(app)/perfil/configuracoes')}
            activeOpacity={0.7}
          >
            <Icon name="notifications-outline" size={21} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/perfil')} activeOpacity={0.8}>
            {user?.fotoUrl ? (
              <Image source={{ uri: user.fotoUrl }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: '#EFF6FF' }} />
            ) : (
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#EFF6FF' }}
              >
                <Text className="text-white font-extrabold text-lg">{user?.nome?.[0] || '?'}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin banner */}
      {isAdmin && (
        <TouchableOpacity className="bg-gray-900 rounded-2xl p-4 mb-5 flex-row items-center shadow-sm shadow-gray-900/20" onPress={() => router.push('/(app)/admin/profissionais')} activeOpacity={0.8}>
          <View className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center">
            <Icon name="shield-checkmark" size={20} color="#fff" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">Painel Administrativo</Text>
            <Text className="text-white/60 text-xs">Gerenciar profissionais</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      )}

      {/* Health Score — destaque principal */}
      {healthScore.data && (
        <HealthScore
          score={healthScore.data.score}
          classificacao={healthScore.data.classificacao}
          breakdown={healthScore.data.breakdown}
          trend={healthScore.data.trend}
          explicacao={healthScore.data.explicacao}
          streak={streak}
        />
      )}

      {/* Resumo do dia */}
      <Text className="text-base font-bold text-gray-900 mb-3">Resumo do Dia</Text>
      {tileRows.map((row, ri) => (
        <View key={ri} className="flex-row gap-3 mb-3">
          {row.map((tile) => (
            <StatCard key={tile.key} icon={tile.icon} iconColor={tile.iconColor} iconBg={tile.iconBg} title={tile.title} value={tile.value} subtitle={tile.subtitle} chartData={'chartData' in tile ? tile.chartData : undefined} chartColor={'chartColor' in tile ? tile.chartColor : undefined} />
          ))}
        </View>
      ))}

      {/* Números rápidos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-5 px-5">
        <NumberChip icon="medkit-outline" color="#DC2626" value={medications.data?.length ?? 0} label="medicamentos" />
        <NumberChip icon="pulse-outline" color="#F97316" value={conditions.data?.length ?? 0} label="condições" />
        <NumberChip icon="people-outline" color="#2563EB" value={members?.length ?? 0} label="membros" />
        <NumberChip icon="shield-checkmark-outline" color="#06B6D4" value={activeShareCount} label="acessos ativos" />
      </ScrollView>

      {/* Conquistas recentes */}
      {unlockedAchievements.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Icon name="trophy" size={17} color="#0F172A" />
              <Text className="text-base font-bold text-gray-900 ml-2">Conquistas Recentes</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(app)/perfil/conquistas')} activeOpacity={0.7}>
              <Text className="text-primary text-xs font-semibold">Ver todas</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            <View className="flex-row gap-4">
              {unlockedAchievements.map((a) => <AchievementBadge key={a.id} achievement={a} />)}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Atalhos rápidos */}
      <Text className="text-base font-bold text-gray-900 mb-3">Atalhos Rápidos</Text>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity className="flex-1" onPress={() => router.push('/(app)/membro/novo')} activeOpacity={0.8} style={primaryShadow}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={{ borderRadius: 18, padding: 16, alignItems: 'center' }}>
            <Icon name="person-add-outline" size={22} color="#fff" />
            <Text className="text-white text-xs font-semibold mt-2">Novo Membro</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1" onPress={() => router.push('/(app)/compartilhamento/novo')} activeOpacity={0.8} style={accentShadow}>
          <LinearGradient colors={['#06B6D4', '#0E7490']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={{ borderRadius: 18, padding: 16, alignItems: 'center' }}>
            <Icon name="share-outline" size={22} color="#fff" />
            <Text className="text-white text-xs font-semibold mt-2">Compartilhar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Família */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-gray-900">Família</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/familia')} activeOpacity={0.7}>
          <Text className="text-primary text-xs font-semibold">Ver todos</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <><CardSkeleton /><CardSkeleton /></>
      ) : !members?.length ? (
        <View className="bg-surface rounded-2xl p-6 items-center border border-gray-100 shadow-sm shadow-gray-900/5">
          <Icon name="people-outline" size={32} color="#CBD5E1" />
          <Text className="text-gray-400 text-sm mt-3">Nenhum membro cadastrado.</Text>
        </View>
      ) : (
        members.slice(0, 3).map((m) => (
          <TouchableOpacity key={m.id} className="bg-surface rounded-2xl p-3 mb-2.5 border border-gray-100 shadow-sm shadow-gray-900/5 flex-row items-center" onPress={() => router.push(`/(app)/membro/${m.id}`)} activeOpacity={0.7}>
            <MemberScoreRing membroId={m.id} nome={m.nome} size={44} />
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-900">{m.nome}</Text>
              <Text className="text-xs text-gray-400">{m.parentesco}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))
      )}
    </ScreenContainer>
  );
}
