import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Input } from '../../../components/ui/Input';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { useFamilyMembers } from '../../../hooks/useFamilyMembers';
import { useCreateSharing } from '../../../hooks/useSharing';
import type { EscopoCompartilhamento } from '../../../types';

const ESCOPOS_DISPONIVEIS: { key: EscopoCompartilhamento; label: string }[] = [
  { key: 'VITAIS', label: 'Sinais Vitais' },
  { key: 'SINTOMAS', label: 'Sintomas' },
  { key: 'CONDICOES', label: 'Condições de Saúde' },
  { key: 'ALERGIAS', label: 'Alergias' },
  { key: 'MEDICAMENTOS', label: 'Medicamentos' },
  { key: 'CONTATOS', label: 'Contatos de Emergência' },
  { key: 'PERFIL', label: 'Perfil do Membro' },
  { key: 'MEMBROS', label: 'Lista de Membros' },
];

export default function NovoCompartilhamentoScreen() {
  const router = useRouter();
  const { data: members } = useFamilyMembers();
  const createMutation = useCreateSharing();

  const toast = useToast();
  const [selectedMembro, setSelectedMembro] = useState('');
  const [profissionalEmail, setProfissionalEmail] = useState('');
  const [diasExpiracao, setDiasExpiracao] = useState('30');
  const [observacoes, setObservacoes] = useState('');
  const [escopos, setEscopos] = useState<EscopoCompartilhamento[]>([]);

  const toggleEscopo = (key: EscopoCompartilhamento) => {
    setEscopos((prev) => prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]);
  };

  const selectAll = () => {
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
