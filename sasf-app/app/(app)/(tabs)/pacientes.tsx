import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfessionalAccess } from '../../../hooks/useSharing';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { IconBadge } from '../../../components/ui/IconBadge';
import type { AcessoProfissional } from '../../../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function PatientCard({ item, onPress }: { item: AcessoProfissional; onPress: () => void }) {
  return (
    <TouchableOpacity className="bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5" onPress={onPress} activeOpacity={0.7}>
      <View className="flex-row items-start">
        <IconBadge icon="person" color="#2563EB" />
        <View className="flex-1 ml-3">
          <Text className="font-bold text-gray-900" numberOfLines={1}>{item.membro?.nome}</Text>
          <Text className="text-xs text-gray-400">{item.membro?.parentesco} · Concedido por {item.concedidoPor?.nome}</Text>
          <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1 mt-2.5">
            <View className="flex-row items-center">
              <Icon name="key-outline" size={12} color="#94A3B8" />
              <Text className="text-xs text-gray-500 ml-1">{item.escopos?.length || 0} escopo(s)</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="time-outline" size={12} color="#94A3B8" />
              <Text className="text-xs text-gray-500 ml-1">Expira em {fmtDate(item.dataExpiracao)}</Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward" size={18} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
}

export default function PacientesScreen() {
  const { data: accessList, isLoading, error, refetch } = useProfessionalAccess();
  const router = useRouter();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage message="Erro ao carregar pacientes." onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center">
          <Icon name="people-outline" size={20} color="#0F172A" />
          <Text className="text-2xl font-bold text-gray-900 ml-2 tracking-tight">Meus Pacientes</Text>
        </View>
        <Text className="text-sm text-gray-400 mt-1">Dados de saúde compartilhados com você por famílias</Text>
      </View>

      <FlatList
        data={accessList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        renderItem={({ item }) => (
          <PatientCard item={item} onPress={() => router.push(`/(app)/paciente/${item.codigoToken}`)} />
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Nenhum paciente" description="Quando uma família compartilhar dados de saúde com você, eles aparecerão aqui." />}
        refreshing={false}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}
