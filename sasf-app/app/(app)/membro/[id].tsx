import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Input } from '../../../components/ui/Input';
import { ChipSelect } from '../../../components/ui/ChipSelect';
import { IconBadge } from '../../../components/ui/IconBadge';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { HealthSection } from '../../../components/health/HealthSection';
import { AddModal } from '../../../components/health/AddModal';
import { useFamilyMember } from '../../../hooks/useFamilyMembers';
import { useHealthScore } from '../../../hooks/useWellness';
import {
  useConditions, useCreateCondition, useDeleteCondition,
  useAllergies, useCreateAllergy, useDeleteAllergy,
  useMedications, useCreateMedication, useDeleteMedication,
  useEmergencyContacts, useCreateEmergencyContact, useDeleteEmergencyContact,
  useVitalSigns, useCreateVitalSign, useDeleteVitalSign,
  useSymptoms, useCreateSymptom, useDeleteSymptom,
} from '../../../hooks/useHealthRecords';
import { calcAge } from '../../../utils/date';
import { tipoMedicaoLabels } from '../../../utils/labels';
import { statusColors, gravidadeColors, intensityTone, tipoMedicaoIcon, getScoreColor } from '../../../utils/health-tones';
import { accentShadow } from '../../../constants/shadows';
import type { CondicaoSaude, Alergia, MedicamentoUso, ContatoEmergencia, SinalVital, RegistroSintoma } from '../../../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const tipoMedicaoOptions = Object.entries(tipoMedicaoLabels).map(([value, label]) => ({ value, label }));
const gravidadeOptions = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADA', label: 'Moderada' },
  { value: 'GRAVE', label: 'Grave' },
];

type ModalType = 'condition' | 'allergy' | 'medication' | 'contact' | 'vitalSign' | 'symptom' | null;

export default function MembroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const membroId = id || '';
  const router = useRouter();
  const { data: member, isLoading, error, refetch } = useFamilyMember(membroId);

  const conditions = useConditions(membroId);
  const createCondition = useCreateCondition(membroId);
  const deleteCondition = useDeleteCondition(membroId);

  const allergies = useAllergies(membroId);
  const createAllergy = useCreateAllergy(membroId);
  const deleteAllergy = useDeleteAllergy(membroId);

  const medications = useMedications(membroId);
  const createMedication = useCreateMedication(membroId);
  const deleteMedication = useDeleteMedication(membroId);

  const contacts = useEmergencyContacts(membroId);
  const createContact = useCreateEmergencyContact(membroId);
  const deleteContact = useDeleteEmergencyContact(membroId);

  const vitalSigns = useVitalSigns(membroId);
  const createVitalSign = useCreateVitalSign(membroId);
  const deleteVitalSign = useDeleteVitalSign(membroId);

  const symptoms = useSymptoms(membroId);
  const createSymptom = useCreateSymptom(membroId);
  const deleteSymptom = useDeleteSymptom(membroId);

  const healthScore = useHealthScore(membroId);

  const toast = useToast();
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  if (isLoading) return <LoadingScreen />;
  if (error || !member) return <ErrorMessage message="Erro ao carregar membro." onRetry={refetch} />;

  const resetForm = () => setForm({});
  const openModal = (type: ModalType) => { resetForm(); setModal(type); };
  const closeModal = () => setModal(null);

  const submitCondition = () => {
    if (!form.nomeCondicao) { toast.show('Nome da condição obrigatório.', 'error'); return; }
    createCondition.mutate({ nomeCondicao: form.nomeCondicao, dataDiagnostico: form.dataDiagnostico || undefined, status: form.status || undefined, observacoes: form.observacoes || undefined }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao criar condição.', 'error'),
    });
  };

  const submitAllergy = () => {
    if (!form.substancia) { toast.show('Substância obrigatória.', 'error'); return; }
    createAllergy.mutate({ substancia: form.substancia, gravidade: form.gravidade || undefined, reacao: form.reacao || undefined }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao criar alergia.', 'error'),
    });
  };

  const submitMedication = () => {
    if (!form.nomeMedicamento) { toast.show('Nome do medicamento obrigatório.', 'error'); return; }
    createMedication.mutate({ nomeMedicamento: form.nomeMedicamento, dosagem: form.dosagem || undefined, frequencia: form.frequencia || undefined }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao criar medicamento.', 'error'),
    });
  };

  const submitContact = () => {
    if (!form.contactNome || !form.contactParentesco || !form.contactTelefone) { toast.show('Todos os campos são obrigatórios.', 'error'); return; }
    createContact.mutate({ nome: form.contactNome, parentesco: form.contactParentesco, telefone: form.contactTelefone }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao criar contato.', 'error'),
    });
  };

  const submitVitalSign = () => {
    if (!form.tipoMedicao || !form.valorPrimario || !form.unidade) { toast.show('Tipo, valor e unidade são obrigatórios.', 'error'); return; }
    createVitalSign.mutate({
      tipoMedicao: form.tipoMedicao,
      valorPrimario: parseFloat(form.valorPrimario),
      valorSecundario: form.valorSecundario ? parseFloat(form.valorSecundario) : undefined,
      unidade: form.unidade,
      dataHoraMedicao: new Date().toISOString(),
      observacoes: form.observacoes || undefined,
    }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao registrar sinal vital.', 'error'),
    });
  };

  const submitSymptom = () => {
    if (!form.descricao || !form.intensidade) { toast.show('Descrição e intensidade são obrigatórios.', 'error'); return; }
    const intensidade = parseInt(form.intensidade, 10);
    if (isNaN(intensidade) || intensidade < 1 || intensidade > 10) { toast.show('Intensidade deve ser de 1 a 10.', 'error'); return; }
    createSymptom.mutate({
      descricao: form.descricao,
      intensidade,
      dataHoraOcorrencia: new Date().toISOString(),
      observacoes: form.observacoes || undefined,
    }, {
      onSuccess: () => { closeModal(); resetForm(); },
      onError: () => toast.show('Falha ao registrar sintoma.', 'error'),
    });
  };

  return (
    <ScreenContainer>
      <View className="bg-surface rounded-4xl p-5 border border-gray-100 shadow-sm shadow-gray-900/5 mb-6">
        <View className="items-center">
          <View className="bg-primary-50 w-16 h-16 rounded-full items-center justify-center mb-3">
            <Text className="text-primary font-bold text-2xl">{member.nome[0]}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{member.nome}</Text>
          <Text className="text-sm text-gray-400 mt-1">{member.parentesco} · {calcAge(member.dataNascimento)} anos · {member.sexo}</Text>
          {healthScore.data && (
            <View className="flex-row items-center mt-2.5" style={{ backgroundColor: `${getScoreColor(healthScore.data.score)}1A` }}>
              <View className="flex-row items-center px-3 py-1.5 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: getScoreColor(healthScore.data.score) }} />
                <Text className="text-xs font-extrabold" style={{ color: getScoreColor(healthScore.data.score) }}>
                  Health Score {healthScore.data.score} · {healthScore.data.classificacao}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/(app)/membro/${membroId}/wellness`)}
        activeOpacity={0.8}
        style={accentShadow}
        className="mb-6"
      >
        <LinearGradient
          colors={['#06B6D4', '#0E7490']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{ borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <View className="w-10 h-10 rounded-xl bg-white/15 items-center justify-center mr-3">
            <Icon name="pulse" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Saúde+</Text>
            <Text className="text-white/70 text-xs">Nutrição, exercícios, bem-estar e insights</Text>
          </View>
          <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </LinearGradient>
      </TouchableOpacity>

      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity className="flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-sm shadow-gray-900/5 items-center" onPress={() => router.push(`/(app)/membro/${membroId}/timeline`)} activeOpacity={0.7}>
          <Icon name="time-outline" size={20} color="#2563EB" />
          <Text className="text-xs font-semibold text-gray-700 mt-1">Linha do Tempo</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-sm shadow-gray-900/5 items-center" onPress={() => router.push(`/(app)/membro/${membroId}/estatisticas`)} activeOpacity={0.7}>
          <Icon name="stats-chart-outline" size={20} color="#2563EB" />
          <Text className="text-xs font-semibold text-gray-700 mt-1">Estatísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-surface rounded-2xl p-3 border border-gray-100 shadow-sm shadow-gray-900/5 items-center" onPress={() => router.push(`/(app)/membro/${membroId}/relatorio`)} activeOpacity={0.7}>
          <Icon name="document-text-outline" size={20} color="#2563EB" />
          <Text className="text-xs font-semibold text-gray-700 mt-1">Relatório</Text>
        </TouchableOpacity>
      </View>

      {/* Sinais Vitais */}
      <HealthSection<SinalVital>
        title="Sinais Vitais"
        icon="heart"
        emptyIcon="stats-chart-outline"
        emptyText="Nenhum sinal vital registrado."
        data={vitalSigns.data}
        isLoading={vitalSigns.isLoading}
        addLabel="Registrar"
        onAdd={() => openModal('vitalSign')}
        onDelete={(item) => deleteVitalSign.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => tipoMedicaoLabels[item.tipoMedicao] || item.tipoMedicao}
        renderItem={(item) => {
          const tone = tipoMedicaoIcon[item.tipoMedicao] || { icon: 'pulse-outline' as IoniconsName, color: '#64748B' };
          return (
            <View className="flex-row items-start">
              <IconBadge icon={tone.icon} color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900">{tipoMedicaoLabels[item.tipoMedicao]}</Text>
                  <Text className="text-xs text-gray-400">{fmtDate(item.dataHoraMedicao)}</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mt-0.5">
                  {item.valorPrimario}{item.valorSecundario ? `/${item.valorSecundario}` : ''} <Text className="text-sm font-semibold text-gray-400">{item.unidade}</Text>
                </Text>
                {item.observacoes && <Text className="text-xs text-gray-400 mt-1">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Sintomas */}
      <HealthSection<RegistroSintoma>
        title="Sintomas"
        icon="thermometer-outline"
        emptyIcon="happy-outline"
        emptyText="Nenhum sintoma registrado."
        data={symptoms.data}
        isLoading={symptoms.isLoading}
        addLabel="Registrar"
        onAdd={() => openModal('symptom')}
        onDelete={(item) => deleteSymptom.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => item.descricao}
        renderItem={(item) => {
          const tone = intensityTone(item.intensidade);
          return (
            <View className="flex-row items-start">
              <IconBadge icon="thermometer" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.descricao}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.intensidade}/10</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{fmtDate(item.dataHoraOcorrencia)}</Text>
                {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Condições de Saúde */}
      <HealthSection<CondicaoSaude>
        title="Condições de Saúde"
        icon="medkit-outline"
        emptyIcon="checkmark-circle-outline"
        emptyText="Nenhuma condição registrada."
        data={conditions.data}
        isLoading={conditions.isLoading}
        addLabel="Adicionar"
        onAdd={() => openModal('condition')}
        onDelete={(item) => deleteCondition.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => item.nomeCondicao}
        renderItem={(item) => {
          const tone = statusColors[item.status] || statusColors.ATIVA;
          return (
            <View className="flex-row items-start">
              <IconBadge icon="medkit" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.nomeCondicao}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.status}</Text>
                  </View>
                </View>
                {item.dataDiagnostico && <Text className="text-xs text-gray-400 mt-1">Diagnóstico: {item.dataDiagnostico}</Text>}
                {item.observacoes && <Text className="text-xs text-gray-400 mt-0.5">{item.observacoes}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Alergias */}
      <HealthSection<Alergia>
        title="Alergias"
        icon="warning-outline"
        emptyIcon="shield-checkmark-outline"
        emptyText="Nenhuma alergia registrada."
        data={allergies.data}
        isLoading={allergies.isLoading}
        addLabel="Adicionar"
        onAdd={() => openModal('allergy')}
        onDelete={(item) => deleteAllergy.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => item.substancia}
        renderItem={(item) => {
          const tone = gravidadeColors[item.gravidade] || gravidadeColors.LEVE;
          return (
            <View className="flex-row items-start">
              <IconBadge icon="warning" color={tone.color} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.substancia}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${tone.bg}`}>
                    <Text className={`text-xs font-semibold ${tone.text}`}>{item.gravidade}</Text>
                  </View>
                </View>
                {item.reacao && <Text className="text-xs text-gray-400 mt-1">Reação: {item.reacao}</Text>}
              </View>
            </View>
          );
        }}
      />

      {/* Medicamentos */}
      <HealthSection<MedicamentoUso>
        title="Medicamentos em Uso"
        icon="medical-outline"
        emptyIcon="medical-outline"
        emptyText="Nenhum medicamento registrado."
        data={medications.data}
        isLoading={medications.isLoading}
        addLabel="Adicionar"
        onAdd={() => openModal('medication')}
        onDelete={(item) => deleteMedication.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => item.nomeMedicamento}
        renderItem={(item) => (
          <View className="flex-row items-start">
            <IconBadge icon="medical" color="#DC2626" />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.nomeMedicamento}</Text>
                {item.usoContinuo && (
                  <View className="bg-primary-50 px-2.5 py-1 rounded-full">
                    <Text className="text-primary text-xs font-semibold">Contínuo</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {[item.dosagem, item.frequencia].filter(Boolean).join(' · ') || 'Sem detalhes'}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Contatos de Emergência */}
      <HealthSection<ContatoEmergencia>
        title="Contatos de Emergência"
        icon="call-outline"
        emptyIcon="call-outline"
        emptyText="Nenhum contato de emergência."
        data={contacts.data}
        isLoading={contacts.isLoading}
        addLabel="Adicionar"
        onAdd={() => openModal('contact')}
        onDelete={(item) => deleteContact.mutate(item.id)}
        getId={(item) => item.id}
        getLabel={(item) => item.nome}
        renderItem={(item) => (
          <View className="flex-row items-start">
            <IconBadge icon="call" color="#2563EB" />
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-900">{item.nome}</Text>
              <View className="flex-row items-center mt-1">
                <Icon name="people-outline" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-400 ml-1 mr-3">{item.parentesco}</Text>
                <Icon name="call-outline" size={12} color="#94A3B8" />
                <Text className="text-xs text-gray-400 ml-1">{item.telefone}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal: Sinal Vital */}
      <AddModal visible={modal === 'vitalSign'} title="Novo Sinal Vital" onClose={closeModal}>
        <ChipSelect label="Tipo" options={tipoMedicaoOptions} value={form.tipoMedicao || ''} onChange={(v) => setForm({ ...form, tipoMedicao: v })} />
        <Input label="Valor primário" icon="pulse-outline" placeholder="Ex: 120" keyboardType="numeric" value={form.valorPrimario || ''} onChangeText={(v) => setForm({ ...form, valorPrimario: v })} />
        <Input label="Valor secundário (opcional)" icon="pulse-outline" placeholder="Ex: 80 (para pressão)" keyboardType="numeric" value={form.valorSecundario || ''} onChangeText={(v) => setForm({ ...form, valorSecundario: v })} />
        <Input label="Unidade" icon="options-outline" placeholder="Ex: mmHg, mg/dL, kg" value={form.unidade || ''} onChangeText={(v) => setForm({ ...form, unidade: v })} />
        <Input label="Observações (opcional)" icon="document-text-outline" placeholder="Notas" value={form.observacoes || ''} onChangeText={(v) => setForm({ ...form, observacoes: v })} />
        <Button title="Registrar" onPress={submitVitalSign} loading={createVitalSign.isPending} />
      </AddModal>

      {/* Modal: Sintoma */}
      <AddModal visible={modal === 'symptom'} title="Novo Sintoma" onClose={closeModal}>
        <Input label="Descrição" icon="create-outline" placeholder="Ex: Dor de cabeça" value={form.descricao || ''} onChangeText={(v) => setForm({ ...form, descricao: v })} />
        <Input label="Intensidade (1-10)" icon="speedometer-outline" placeholder="Ex: 7" keyboardType="numeric" value={form.intensidade || ''} onChangeText={(v) => setForm({ ...form, intensidade: v })} />
        <Input label="Observações (opcional)" icon="document-text-outline" placeholder="Notas" value={form.observacoes || ''} onChangeText={(v) => setForm({ ...form, observacoes: v })} />
        <Button title="Registrar" onPress={submitSymptom} loading={createSymptom.isPending} />
      </AddModal>

      {/* Modal: Condição */}
      <AddModal visible={modal === 'condition'} title="Nova Condição" onClose={closeModal}>
        <Input label="Nome da condição" icon="medkit-outline" placeholder="Ex: Diabetes" value={form.nomeCondicao || ''} onChangeText={(v) => setForm({ ...form, nomeCondicao: v })} />
        <Input label="Data diagnóstico (opcional)" icon="calendar-outline" placeholder="AAAA-MM-DD" value={form.dataDiagnostico || ''} onChangeText={(v) => setForm({ ...form, dataDiagnostico: v })} />
        <Input label="Observações (opcional)" icon="document-text-outline" placeholder="Notas adicionais" value={form.observacoes || ''} onChangeText={(v) => setForm({ ...form, observacoes: v })} />
        <Button title="Salvar" onPress={submitCondition} loading={createCondition.isPending} />
      </AddModal>

      {/* Modal: Alergia */}
      <AddModal visible={modal === 'allergy'} title="Nova Alergia" onClose={closeModal}>
        <Input label="Substância" icon="alert-circle-outline" placeholder="Ex: Dipirona" value={form.substancia || ''} onChangeText={(v) => setForm({ ...form, substancia: v })} />
        <ChipSelect label="Gravidade (opcional)" options={gravidadeOptions} value={form.gravidade || ''} onChange={(v) => setForm({ ...form, gravidade: v })} />
        <Input label="Reação (opcional)" icon="document-text-outline" placeholder="Ex: Urticária" value={form.reacao || ''} onChangeText={(v) => setForm({ ...form, reacao: v })} />
        <Button title="Salvar" onPress={submitAllergy} loading={createAllergy.isPending} />
      </AddModal>

      {/* Modal: Medicamento */}
      <AddModal visible={modal === 'medication'} title="Novo Medicamento" onClose={closeModal}>
        <Input label="Nome" icon="medical-outline" placeholder="Ex: Losartana" value={form.nomeMedicamento || ''} onChangeText={(v) => setForm({ ...form, nomeMedicamento: v })} />
        <Input label="Dosagem (opcional)" icon="options-outline" placeholder="Ex: 50mg" value={form.dosagem || ''} onChangeText={(v) => setForm({ ...form, dosagem: v })} />
        <Input label="Frequência (opcional)" icon="time-outline" placeholder="Ex: 1x ao dia" value={form.frequencia || ''} onChangeText={(v) => setForm({ ...form, frequencia: v })} />
        <Button title="Salvar" onPress={submitMedication} loading={createMedication.isPending} />
      </AddModal>

      {/* Modal: Contato */}
      <AddModal visible={modal === 'contact'} title="Novo Contato" onClose={closeModal}>
        <Input label="Nome" icon="person-outline" placeholder="Nome completo" value={form.contactNome || ''} onChangeText={(v) => setForm({ ...form, contactNome: v })} />
        <Input label="Parentesco" icon="people-outline" placeholder="Ex: Tio, Vizinha" value={form.contactParentesco || ''} onChangeText={(v) => setForm({ ...form, contactParentesco: v })} />
        <Input label="Telefone" icon="call-outline" placeholder="(89) 99999-0000" keyboardType="phone-pad" value={form.contactTelefone || ''} onChangeText={(v) => setForm({ ...form, contactTelefone: v })} />
        <Button title="Salvar" onPress={submitContact} loading={createContact.isPending} />
      </AddModal>
    </ScreenContainer>
  );
}
