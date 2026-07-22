import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/ui/ScreenContainer';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Icon } from '../../../../components/ui/Icon';
import { IconBadge } from '../../../../components/ui/IconBadge';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { InfoRow } from '../../../../components/ui/InfoRow';
import { useToast } from '../../../../components/ui/Toast';
import { LoadingScreen } from '../../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';
import { AddModal } from '../../../../components/health/AddModal';
import { useProfessional, useApproveProfessional, useRejectProfessional } from '../../../../hooks/useAdmin';
import { professionalStatusConfig as statusConfig } from '../../../../utils/statusConfig';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ProfissionalDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: prof, isLoading, error, refetch } = useProfessional(id || '');
  const approveMutation = useApproveProfessional();
  const rejectMutation = useRejectProfessional();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const toast = useToast();

  if (isLoading) return <LoadingScreen />;
  if (error || !prof) return <ErrorMessage message="Erro ao carregar profissional." onRetry={refetch} />;

  const cfg = statusConfig[prof.statusValidacao] || statusConfig.PENDING;
  const isPending = prof.statusValidacao === 'PENDING';

  const handleApprove = () => {
    Alert.alert('Aprovar', `Confirma a aprovação de ${prof.usuario.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprovar',
        onPress: () => approveMutation.mutate(prof.id, {
          onSuccess: () => { refetch(); toast.show('Profissional aprovado com sucesso!', 'success'); },
          onError: (err: any) => toast.show(err?.response?.data?.error || 'Falha ao aprovar.', 'error'),
        }),
      },
    ]);
  };

  const handleReject = () => {
    if (motivo.length < 5) { toast.show('Motivo deve ter no mínimo 5 caracteres.', 'error'); return; }
    rejectMutation.mutate({ id: prof.id, motivo }, {
      onSuccess: () => { setShowRejectModal(false); refetch(); toast.show('Profissional rejeitado.', 'info'); },
      onError: (err: any) => toast.show(err?.response?.data?.error || 'Falha ao rejeitar.', 'error'),
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
        <View className="items-center mb-4">
          <IconBadge icon={cfg.icon} color={cfg.dot} size={56} />
          <Text className="text-xl font-bold text-gray-900 mt-3">{prof.usuario.nome}</Text>
          <View className="mt-2">
            <StatusBadge label={cfg.label} bg={cfg.bg} textColor={cfg.text} dotColor={cfg.dot} />
          </View>
        </View>

        <InfoRow icon="mail-outline" label="E-mail" value={prof.usuario.email} />
        <InfoRow icon="call-outline" label="Telefone" value={prof.usuario.telefone || 'Não informado'} />
        <InfoRow icon="calendar-outline" label="Cadastro em" value={fmtDate(prof.usuario.createdAt)} />
      </View>

      {/* Dados Profissionais */}
      <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
        <View className="flex-row items-center mb-3">
          <Icon name="ribbon-outline" size={16} color="#0F172A" />
          <Text className="text-base font-bold text-gray-900 ml-2">Dados Profissionais</Text>
        </View>
        <InfoRow icon="school-outline" label="Conselho" value={prof.categoriaConselho} />
        <InfoRow icon="document-text-outline" label="Registro" value={prof.registroProfissional} />
        <InfoRow icon="location-outline" label="UF" value={prof.ufConselho} />
        <InfoRow icon="medkit-outline" label="Especialidade" value={prof.especialidade || 'Não informada'} />
      </View>

      {/* Avaliação */}
      {!isPending && (
        <View className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
          <View className="flex-row items-center mb-3">
            <Icon name="shield-checkmark-outline" size={16} color="#0F172A" />
            <Text className="text-base font-bold text-gray-900 ml-2">Avaliação</Text>
          </View>
          <InfoRow icon="person-outline" label="Avaliado por" value={prof.avaliadoPor?.nome || '—'} />
          <InfoRow icon="calendar-outline" label="Data" value={fmtDate(prof.avaliadoEm)} />
          {prof.motivoRejeicao && <InfoRow icon="alert-circle-outline" label="Motivo" value={prof.motivoRejeicao} />}
        </View>
      )}

      {/* Ações */}
      {isPending && (
        <View className="gap-3">
          <Button title="Aprovar Profissional" onPress={handleApprove} variant="secondary" loading={approveMutation.isPending} />
          <Button title="Rejeitar" onPress={() => setShowRejectModal(true)} variant="danger-outline" />
        </View>
      )}

      {/* Modal Rejeição */}
      <AddModal visible={showRejectModal} title="Rejeitar Profissional" onClose={() => setShowRejectModal(false)}>
        <Text className="text-sm text-gray-600 mb-4">
          Informe o motivo da rejeição. O profissional será notificado.
        </Text>
        <Input
          label="Motivo da rejeição"
          icon="alert-circle-outline"
          placeholder="Mínimo 5 caracteres"
          multiline
          numberOfLines={3}
          value={motivo}
          onChangeText={setMotivo}
        />
        <Button title="Confirmar Rejeição" onPress={handleReject} variant="danger" loading={rejectMutation.isPending} />
      </AddModal>
    </ScreenContainer>
  );
}
