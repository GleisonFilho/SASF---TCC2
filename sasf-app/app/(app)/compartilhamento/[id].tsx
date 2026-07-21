import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Button } from '../../../components/ui/Button';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Icon } from '../../../components/ui/Icon';
import { IconBadge } from '../../../components/ui/IconBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { InfoRow } from '../../../components/ui/InfoRow';
import { useToast } from '../../../components/ui/Toast';
import { useSharing, useRevokeSharing } from '../../../hooks/useSharing';
import { sharingStatusConfig as statusConfig } from '../../../utils/statusConfig';

const escopoLabels: Record<string, string> = {
  PERFIL: 'Perfil', MEMBROS: 'Membros', CONDICOES: 'Condições', ALERGIAS: 'Alergias',
  MEDICAMENTOS: 'Medicamentos', CONTATOS: 'Contatos', VITAIS: 'Sinais Vitais', SINTOMAS: 'Sintomas',
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CompartilhamentoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sharing, isLoading, error, refetch } = useSharing(id || '');
  const revokeMutation = useRevokeSharing();
  const toast = useToast();

  if (isLoading) return <LoadingScreen />;
  if (error || !sharing) return <ErrorMessage message="Erro ao carregar detalhes." onRetry={refetch} />;

  const cfg = statusConfig[sharing.status] || statusConfig.EXPIRADO;
  const logs = [...(sharing.logsAcesso || [])].sort((a, b) => new Date(b.dataHoraAcesso).getTime() - new Date(a.dataHoraAcesso).getTime());

  const handleRevoke = () => {
    Alert.alert('Revogar', 'Deseja revogar este compartilhamento? O profissional perderá o acesso imediatamente.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Revogar',
        style: 'destructive',
        onPress: () => revokeMutation.mutate(sharing.id, {
          onSuccess: () => { refetch(); toast.show('Compartilhamento revogado.', 'success'); },
          onError: (err: any) => toast.show(err?.response?.data?.error || 'Falha ao revogar.', 'error'),
        }),
      },
    ]);
  };

  return (
    <ScreenContainer>
      {/* Status */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
        <View className="items-center mb-4">
          <IconBadge icon="shield-checkmark" color={cfg.dot} size={52} />
          <Text className="text-base font-bold text-gray-900 mt-3">Compartilhamento Seguro</Text>
          <View className="mt-2">
            <StatusBadge label={cfg.label} bg={cfg.bg} textColor={cfg.text} dotColor={cfg.dot} />
          </View>
        </View>

        <InfoRow icon="person-outline" label="Profissional" value={sharing.profissional?.nome || '—'} />
        <InfoRow icon="mail-outline" label="E-mail" value={sharing.profissional?.email || '—'} />
        <InfoRow icon="people-outline" label="Membro" value={sharing.membro?.nome || '—'} />
        <InfoRow icon="calendar-outline" label="Criado em" value={fmtDateTime(sharing.dataCriacao)} />
        <InfoRow icon="time-outline" label="Expira em" value={fmtDateTime(sharing.dataExpiracao)} />
        {sharing.dataRevogacao && <InfoRow icon="close-circle-outline" label="Revogado em" value={fmtDateTime(sharing.dataRevogacao)} />}
        {sharing.observacoes && <InfoRow icon="document-text-outline" label="Observações" value={sharing.observacoes} />}
      </View>

      {/* Escopos */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
        <View className="flex-row items-center mb-3">
          <Icon name="key-outline" size={16} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Escopos Liberados</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {sharing.escopos?.map((e) => (
            <View key={e.id} className="flex-row items-center bg-primary-50 px-3 py-1.5 rounded-lg">
              <Icon name="checkmark-circle" size={13} color="#2563EB" />
              <Text className="text-xs font-semibold text-primary ml-1.5">{escopoLabels[e.categoriaDado] || e.categoriaDado}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Token */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
        <View className="flex-row items-center mb-3">
          <Icon name="key-outline" size={16} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Token de Acesso</Text>
        </View>
        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3">
          <Icon name="lock-closed-outline" size={15} color="#94A3B8" />
          <Text className="text-xs text-gray-500 ml-2.5 flex-1" style={{ fontFamily: 'monospace' }} numberOfLines={1}>
            {sharing.codigoToken.slice(0, 16)}···{sharing.codigoToken.slice(-8)}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 mt-2">Token parcialmente oculto por segurança.</Text>
      </View>

      {/* Logs de Acesso */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <View className="flex-row items-center mb-4">
          <Icon name="time-outline" size={16} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Histórico de Acessos</Text>
        </View>
        {logs.length === 0 ? (
          <Text className="text-sm text-gray-400">Nenhum acesso registrado.</Text>
        ) : (
          logs.map((log, i) => (
            <View key={log.id} className="flex-row">
              <View className="items-center mr-3">
                <View className="w-7 h-7 rounded-full bg-accent-light items-center justify-center">
                  <Icon name="eye-outline" size={13} color="#0E7490" />
                </View>
                {i < logs.length - 1 && <View className="w-px flex-1 bg-gray-100 my-1" />}
              </View>
              <View className={`flex-1 ${i < logs.length - 1 ? 'pb-4' : ''}`}>
                <Text className="text-sm font-medium text-gray-700">{log.recursoAcessado}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{fmtDateTime(log.dataHoraAcesso)}{log.ipOrigem ? ` · IP ${log.ipOrigem}` : ''}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {sharing.status === 'ATIVO' && (
        <Button title="Revogar Compartilhamento" onPress={handleRevoke} variant="danger" loading={revokeMutation.isPending} />
      )}
    </ScreenContainer>
  );
}
