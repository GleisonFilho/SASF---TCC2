import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharings, useRevokeSharing } from '../../../hooks/useSharing';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { IconBadge } from '../../../components/ui/IconBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { sharingStatusConfig as statusConfig } from '../../../utils/statusConfig';
import type { Compartilhamento } from '../../../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ShareCard({ item, onRevoke, onPress }: { item: Compartilhamento; onRevoke: () => void; onPress: () => void }) {
  const cfg = statusConfig[item.status] || statusConfig.EXPIRADO;

  const handleRevoke = () => {
    Alert.alert('Revogar', 'Deseja revogar este compartilhamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Revogar', style: 'destructive', onPress: onRevoke },
    ]);
  };

  return (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View className="flex-row items-start">
          <IconBadge icon="shield-checkmark" color={cfg.dot} />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.profissional?.nome || 'Profissional'}</Text>
              <StatusBadge label={cfg.label} bg={cfg.bg} textColor={cfg.text} dotColor={cfg.dot} />
            </View>
            <Text className="text-xs text-gray-400">{item.profissional?.email}</Text>

            <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1 mt-2.5">
              <View className="flex-row items-center">
                <Icon name="person-outline" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-500 ml-1">{item.membro?.nome}</Text>
              </View>
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
        </View>
      </TouchableOpacity>

      {item.status === 'ATIVO' && (
        <TouchableOpacity className="mt-3 bg-danger-light rounded-xl py-2.5 flex-row items-center justify-center" onPress={handleRevoke} activeOpacity={0.7}>
          <Icon name="lock-closed-outline" size={13} color="#DC2626" />
          <Text className="text-danger text-xs font-semibold ml-1.5">Revogar acesso</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CompartilhamentoScreen() {
  const { data: sharings, isLoading, error, refetch } = useSharings();
  const revokeMutation = useRevokeSharing();
  const router = useRouter();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage message="Erro ao carregar compartilhamentos." onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center">
          <Icon name="shield-checkmark-outline" size={20} color="#0F172A" />
          <Text className="text-2xl font-bold text-gray-900 ml-2 tracking-tight">Compartilhamentos</Text>
        </View>
        <Text className="text-sm text-gray-400 mt-1">Gerencie o acesso dos profissionais aos dados de saúde</Text>
      </View>

      <FlatList
        data={sharings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        renderItem={({ item }) => (
          <ShareCard
            item={item}
            onRevoke={() => revokeMutation.mutate(item.id)}
            onPress={() => router.push(`/(app)/compartilhamento/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState icon="shield-checkmark-outline" title="Nenhum compartilhamento" description="Compartilhe dados de saúde com profissionais de forma segura." />}
        refreshing={false}
        onRefresh={refetch}
      />

      <View className="px-5 pb-5">
        <Button title="Novo Compartilhamento" onPress={() => router.push('/(app)/compartilhamento/novo')} />
      </View>
    </SafeAreaView>
  );
}
