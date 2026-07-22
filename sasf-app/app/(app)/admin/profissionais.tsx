import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfessionals } from '../../../hooks/useAdmin';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { IconBadge } from '../../../components/ui/IconBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { professionalStatusConfig as statusConfig } from '../../../utils/statusConfig';
import type { ProfissionalDetalhe } from '../../../types';

const FILTERS = [
  { key: undefined, label: 'Todos' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'APPROVED', label: 'Aprovados' },
  { key: 'REJECTED', label: 'Rejeitados' },
] as const;

function ProfCard({ item, onPress }: { item: ProfissionalDetalhe; onPress: () => void }) {
  const cfg = statusConfig[item.statusValidacao] || statusConfig.PENDING;
  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <IconBadge icon={cfg.icon} color={cfg.dot} />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.usuario.nome}</Text>
            <StatusBadge label={cfg.label} bg={cfg.bg} textColor={cfg.text} dotColor={cfg.dot} />
          </View>
          <Text className="text-xs text-gray-400">{item.usuario.email}</Text>
          <View className="flex-row items-center mt-1.5">
            <Icon name="ribbon-outline" size={12} color="#94A3B8" />
            <Text className="text-xs text-gray-500 ml-1.5">
              {item.categoriaConselho} {item.registroProfissional} · {item.ufConselho}
              {item.especialidade ? ` · ${item.especialidade}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProfissionaisScreen() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data: professionals, isLoading, error, refetch } = useProfessionals(filter);
  const router = useRouter();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage message="Erro ao carregar profissionais." onRetry={refetch} />;

  const pendingCount = professionals?.filter((p) => p.statusValidacao === 'PENDING').length || 0;
  const approvedCount = professionals?.filter((p) => p.statusValidacao === 'APPROVED').length || 0;
  const rejectedCount = professionals?.filter((p) => p.statusValidacao === 'REJECTED').length || 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="px-5 pt-2 pb-2">
        {filter === undefined && (professionals?.length ?? 0) > 0 && (
          <View className="flex-row gap-2.5 mb-3">
            <View className="flex-1 bg-warning-light rounded-2xl px-3 py-2.5">
              <Text className="text-yellow-700 text-xl font-extrabold">{pendingCount}</Text>
              <Text className="text-yellow-700 text-[11px] font-semibold mt-0.5">Pendentes</Text>
            </View>
            <View className="flex-1 bg-success-light rounded-2xl px-3 py-2.5">
              <Text className="text-success text-xl font-extrabold">{approvedCount}</Text>
              <Text className="text-green-700 text-[11px] font-semibold mt-0.5">Aprovados</Text>
            </View>
            <View className="flex-1 bg-danger-light rounded-2xl px-3 py-2.5">
              <Text className="text-danger text-xl font-extrabold">{rejectedCount}</Text>
              <Text className="text-red-700 text-[11px] font-semibold mt-0.5">Rejeitados</Text>
            </View>
          </View>
        )}

        <View className="flex-row gap-2 mb-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.label}
                className="px-3 py-2 rounded-xl border"
                style={active ? { backgroundColor: '#2563EB', borderColor: '#2563EB' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold" style={{ color: active ? '#fff' : '#475569' }}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4 }}
        renderItem={({ item }) => (
          <ProfCard item={item} onPress={() => router.push(`/(app)/admin/profissional/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState icon="shield-checkmark-outline" title="Nenhum profissional" description="Nenhum registro com este filtro." />}
        refreshing={false}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}
