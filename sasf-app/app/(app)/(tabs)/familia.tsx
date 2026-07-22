import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFamilyMembers, useDeleteFamilyMember } from '../../../hooks/useFamilyMembers';
import { ListSkeleton } from '../../../components/ui/Skeleton';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { MemberScoreRing } from '../../../components/ui/MemberScoreRing';
import { useToast } from '../../../components/ui/Toast';
import { useAuthStore } from '../../../store/authStore';
import { calcAge } from '../../../utils/date';
import type { MembroFamilia } from '../../../types';

function MemberCard({ member, isYou, onPress, onDelete }: { member: MembroFamilia; isYou: boolean; onPress: () => void; onDelete: () => void }) {
  const age = calcAge(member.dataNascimento);

  const handleLongPress = () => {
    Alert.alert('Remover membro', `Deseja remover ${member.nome}? Todos os dados de saúde serão perdidos.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity className="bg-surface rounded-2xl p-3.5 mb-3 border border-gray-100 shadow-sm shadow-gray-900/5 flex-row items-center" onPress={onPress} onLongPress={handleLongPress} activeOpacity={0.7}>
      <MemberScoreRing membroId={member.id} nome={member.nome} size={52} />
      <View className="flex-1 ml-3.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-bold text-gray-900 text-base">{member.nome}</Text>
          {isYou && (
            <View className="bg-primary-50 px-1.5 py-0.5 rounded-lg">
              <Text className="text-primary text-[10px] font-extrabold">VOCÊ</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-400 mt-0.5">{member.parentesco} · {age} anos · {member.sexo}</Text>
      </View>
      <Icon name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

export default function FamiliaScreen() {
  const { data: members, isLoading, error, refetch } = useFamilyMembers();
  const deleteMutation = useDeleteFamilyMember();
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  if (isLoading) return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2"><Text className="text-2xl font-bold text-gray-900 tracking-tight">Família</Text></View>
      <ListSkeleton count={4} />
    </SafeAreaView>
  );
  if (error) return <ErrorMessage message="Erro ao carregar membros." onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 tracking-tight">Família</Text>
        <Text className="text-sm text-gray-400 mt-1">{members?.length || 0} membro(s)</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            isYou={item.nome === user?.nome}
            onPress={() => router.push(`/(app)/membro/${item.id}`)}
            onDelete={() => deleteMutation.mutate(item.id, {
              onSuccess: () => toast.show('Membro removido.', 'success'),
              onError: () => toast.show('Erro ao remover.', 'error'),
            })}
          />
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Nenhum membro" description="Cadastre o primeiro membro da família." />}
        refreshing={false}
        onRefresh={refetch}
      />

      <View className="px-5 pb-5">
        <TouchableOpacity
          className="border-[1.5px] border-gray-300 rounded-2xl py-4 items-center justify-center flex-row"
          style={{ borderStyle: 'dashed' }}
          onPress={() => router.push('/(app)/membro/novo')}
          activeOpacity={0.7}
        >
          <Icon name="person-add-outline" size={19} color="#2563EB" />
          <Text className="text-primary font-bold text-sm ml-2">Novo membro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
