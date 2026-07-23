import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Input } from '../../../components/ui/Input';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { useFamilyMembers } from '../../../hooks/useFamilyMembers';
import { useCreateSharing, useProfessionalLookup } from '../../../hooks/useSharing';
import { escopoLabels, categoriaConselhoLabels, categoriaEscoposSugeridos } from '../../../utils/labels';
import type { EscopoCompartilhamento } from '../../../types';

const validacaoTag: Record<string, { label: string; bg: string; text: string }> = {
  APPROVED: { label: 'Aprovado', bg: 'bg-success-light', text: 'text-success' },
  PENDING: { label: 'Cadastro em análise', bg: 'bg-warning-light', text: 'text-warning' },
  REJECTED: { label: 'Cadastro não aprovado', bg: 'bg-danger-light', text: 'text-danger' },
};

const ESCOPOS_DISPONIVEIS: { key: EscopoCompartilhamento; label: string }[] = [
  { key: 'VITAIS', label: escopoLabels.VITAIS },
  { key: 'SINTOMAS', label: escopoLabels.SINTOMAS },
  { key: 'CONDICOES', label: escopoLabels.CONDICOES },
  { key: 'ALERGIAS', label: escopoLabels.ALERGIAS },
  { key: 'MEDICAMENTOS', label: escopoLabels.MEDICAMENTOS },
  { key: 'CONTATOS', label: escopoLabels.CONTATOS },
  { key: 'NUTRICAO', label: escopoLabels.NUTRICAO },
  { key: 'EXERCICIOS', label: escopoLabels.EXERCICIOS },
  { key: 'PSICOLOGIA', label: escopoLabels.PSICOLOGIA },
  { key: 'HEALTH_SCORE', label: escopoLabels.HEALTH_SCORE },
  { key: 'PERFIL', label: escopoLabels.PERFIL },
  { key: 'MEMBROS', label: escopoLabels.MEMBROS },
];

export default function NovoCompartilhamentoScreen() {
  const router = useRouter();
  const { data: members } = useFamilyMembers();
  const createMutation = useCreateSharing();

  const toast = useToast();
  const [selectedMembro, setSelectedMembro] = useState('');
  const [profissionalEmail, setProfissionalEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [diasExpiracao, setDiasExpiracao] = useState('30');
  const [observacoes, setObservacoes] = useState('');
  const [escopos, setEscopos] = useState<EscopoCompartilhamento[]>([]);
  const [escoposTouched, setEscoposTouched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(profissionalEmail.trim().toLowerCase()), 500);
    return () => clearTimeout(t);
  }, [profissionalEmail]);

  useEffect(() => {
    setEscoposTouched(false);
  }, [debouncedEmail]);

  const lookup = useProfessionalLookup(debouncedEmail);

  useEffect(() => {
    const categoria = lookup.data?.categoriaConselho;
    if (categoria && !escoposTouched && categoriaEscoposSugeridos[categoria]) {
      setEscopos(categoriaEscoposSugeridos[categoria] as EscopoCompartilhamento[]);
    }
  }, [lookup.data, escoposTouched]);

  const toggleEscopo = (key: EscopoCompartilhamento) => {
    setEscoposTouched(true);
    setEscopos((prev) => prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]);
  };

  const selectAll = () => {
    setEscoposTouched(true);
    if (escopos.length === ESCOPOS_DISPONIVEIS.length) {
      setEscopos([]);
    } else {
      setEscopos(ESCOPOS_DISPONIVEIS.map((e) => e.key));
    }
  };

  const onSubmit = () => {
    if (!selectedMembro) { toast.show('Selecione um membro.', 'error'); return; }
    if (!profissionalEmail) { toast.show('Informe o e-mail do profissional.', 'error'); return; }
    if (escopos.length === 0) { toast.show('Selecione ao menos um escopo.', 'error'); return; }

    const dias = parseInt(diasExpiracao, 10) || 30;
    const dataExpiracao = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();

    createMutation.mutate(
      { membroId: selectedMembro, profissionalEmail, dataExpiracao, observacoes: observacoes || undefined, escopos },
      {
        onSuccess: () => {
          toast.show('Compartilhamento criado com sucesso!', 'success');
          router.back();
        },
        onError: (err: any) => {
          toast.show(err?.response?.data?.error || 'Falha ao criar compartilhamento.', 'error');
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Membro da Família</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {members?.map((m) => {
            const active = selectedMembro === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                className="px-4 py-3 rounded-xl border"
                style={active ? { backgroundColor: '#2563EB', borderColor: '#2563EB' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                onPress={() => setSelectedMembro(m.id)}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold" style={{ color: active ? '#fff' : '#475569' }}>{m.nome}</Text>
                <Text className="text-xs" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>{m.parentesco}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Input
        label="E-mail do Profissional"
        icon="mail-outline"
        placeholder="profissional@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={profissionalEmail}
        onChangeText={setProfissionalEmail}
      />

      {lookup.isFetching && (
        <View className="flex-row items-center mb-4 -mt-2">
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="text-xs text-gray-400 ml-2">Buscando profissional...</Text>
        </View>
      )}

      {!lookup.isFetching && lookup.data && (
        <View className="bg-primary-50 rounded-2xl p-3.5 mb-4 -mt-2 flex-row items-start">
          <Icon name="person-circle-outline" size={18} color="#2563EB" />
          <View className="flex-1 ml-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{lookup.data.nome}</Text>
              {lookup.data.statusValidacao && (
                <View className={`px-2 py-0.5 rounded-full ${validacaoTag[lookup.data.statusValidacao]?.bg}`}>
                  <Text className={`text-[10px] font-semibold ${validacaoTag[lookup.data.statusValidacao]?.text}`}>{validacaoTag[lookup.data.statusValidacao]?.label}</Text>
                </View>
              )}
            </View>
            {lookup.data.categoriaConselho && (
              <Text className="text-xs text-gray-500 mt-0.5">
                {categoriaConselhoLabels[lookup.data.categoriaConselho] || lookup.data.categoriaConselho}
                {lookup.data.especialidade ? ` · ${lookup.data.especialidade}` : ''}
              </Text>
            )}
            {lookup.data.categoriaConselho && categoriaEscoposSugeridos[lookup.data.categoriaConselho] && !escoposTouched && (
              <Text className="text-xs text-primary mt-1">Escopos sugeridos para esta categoria já foram marcados abaixo — ajuste se precisar.</Text>
            )}
          </View>
        </View>
      )}

      {!lookup.isFetching && lookup.isError && debouncedEmail.length > 0 && (
        <View className="flex-row items-center mb-4 -mt-2">
          <Icon name="alert-circle-outline" size={14} color="#94A3B8" />
          <Text className="text-xs text-gray-400 ml-1.5">Nenhum profissional aprovado encontrado com este e-mail.</Text>
        </View>
      )}

      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-1">Expira em</Text>
      <View className="flex-row gap-2 mb-4">
        {['7', '30', '90'].map((dias) => {
          const selected = diasExpiracao === dias;
          return (
            <TouchableOpacity
              key={dias}
              className="flex-1 py-3 rounded-xl border items-center"
              style={selected ? { backgroundColor: '#EFF6FF', borderColor: '#2563EB' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              onPress={() => setDiasExpiracao(dias)}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold" style={{ color: selected ? '#2563EB' : '#64748B' }}>{dias} dias</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        label="Observações (opcional)"
        icon="document-text-outline"
        placeholder="Ex: Consulta de rotina"
        value={observacoes}
        onChangeText={setObservacoes}
      />

      <View className="flex-row items-center justify-between mb-3 mt-2">
        <View className="flex-row items-center">
          <Icon name="key-outline" size={15} color="#0F172A" />
          <Text className="text-sm font-semibold text-gray-700 ml-2">Escopos de Acesso</Text>
        </View>
        <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
          <Text className="text-xs text-primary font-semibold">
            {escopos.length === ESCOPOS_DISPONIVEIS.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-6">
        {ESCOPOS_DISPONIVEIS.map((e) => {
          const selected = escopos.includes(e.key);
          return (
            <TouchableOpacity
              key={e.key}
              className="flex-row items-center px-3.5 py-2 rounded-xl border"
              style={selected ? { backgroundColor: '#2563EB', borderColor: '#2563EB' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
              onPress={() => toggleEscopo(e.key)}
              activeOpacity={0.8}
            >
              {selected && <Icon name="checkmark" size={13} color="#fff" />}
              <Text className={`text-xs font-semibold ${selected ? 'ml-1' : ''}`} style={{ color: selected ? '#fff' : '#475569' }}>{e.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100 flex-row">
        <Icon name="lock-closed-outline" size={16} color="#2563EB" />
        <View className="flex-1 ml-2.5">
          <Text className="text-xs text-blue-900 font-semibold mb-1">Consentimento LGPD</Text>
          <Text className="text-xs text-blue-800 leading-4">
            Ao criar este compartilhamento, você consente que o profissional indicado acesse os dados
            de saúde selecionados pelo período definido. Você pode revogar este acesso a qualquer momento.
          </Text>
        </View>
      </View>

      <Button title="Criar Compartilhamento" onPress={onSubmit} loading={createMutation.isPending} />
    </ScreenContainer>
  );
}
