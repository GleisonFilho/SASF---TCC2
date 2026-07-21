import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Input } from '../../../components/ui/Input';
import { ChipSelect } from '../../../components/ui/ChipSelect';
import { Button } from '../../../components/ui/Button';
import { Icon, type IoniconsName } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toast';
import { useAuthStore } from '../../../store/authStore';
import { useUpdateProfile } from '../../../hooks/useUsers';

const sexOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
];

function SectionCard({ icon, title, children }: { icon: IoniconsName; title: string; children: React.ReactNode }) {
  return (
    <View className="bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-900/5 mb-4">
      <View className="flex-row items-center mb-4">
        <Icon name={icon} size={16} color="#2563EB" />
        <Text className="text-sm font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function EditarPerfilScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const toast = useToast();
  const updateProfile = useUpdateProfile();

  const [nome, setNome] = useState(user?.nome || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [dataNascimento, setDataNascimento] = useState(user?.dataNascimento?.slice(0, 10) || '');
  const [sexo, setSexo] = useState(user?.sexo || '');
  const [endereco, setEndereco] = useState(user?.endereco || '');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [estado, setEstado] = useState(user?.estado || '');

  const handlePhotoPress = () => {
    toast.show('Funcionalidade de foto será adicionada em breve.', 'info');
  };

  const handleSave = () => {
    if (nome.trim().length < 2) {
      toast.show('Nome deve ter no mínimo 2 caracteres.', 'error');
      return;
    }

    updateProfile.mutate(
      {
        nome: nome.trim(),
        telefone: telefone || undefined,
        dataNascimento: dataNascimento || undefined,
        sexo: sexo || undefined,
        endereco: endereco || undefined,
        cidade: cidade || undefined,
        estado: estado ? estado.toUpperCase() : undefined,
      },
      {
        onSuccess: () => {
          toast.show('Perfil atualizado com sucesso!', 'success');
          router.back();
        },
        onError: (err: any) => {
          toast.show(err?.response?.data?.error || 'Erro ao atualizar perfil.', 'error');
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <View className="items-center mb-6 mt-1">
        <TouchableOpacity onPress={handlePhotoPress} activeOpacity={0.7}>
          <View className="bg-primary-50 w-24 h-24 rounded-full items-center justify-center border-[3px] border-white shadow-sm shadow-gray-900/10">
            <Text className="text-primary font-bold text-4xl">{nome?.[0] || '?'}</Text>
          </View>
          <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-surface">
            <Icon name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400 mt-2.5">Toque para alterar a foto</Text>
      </View>

      <SectionCard icon="person-outline" title="Informações pessoais">
        <Input label="Nome completo" icon="person-outline" placeholder="Seu nome" value={nome} onChangeText={setNome} />
        <Input label="Telefone" icon="call-outline" placeholder="(89) 99999-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
        <Input label="Data de nascimento" icon="calendar-outline" placeholder="AAAA-MM-DD" value={dataNascimento} onChangeText={setDataNascimento} />

        <ChipSelect label="Sexo" options={sexOptions} value={sexo} onChange={setSexo} />
      </SectionCard>

      <SectionCard icon="location-outline" title="Endereço">
        <Input label="Endereço" icon="home-outline" placeholder="Rua, número" value={endereco} onChangeText={setEndereco} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Cidade" icon="business-outline" placeholder="Picos" value={cidade} onChangeText={setCidade} />
          </View>
          <View style={{ width: 96 }}>
            <Input label="UF" placeholder="PI" maxLength={2} autoCapitalize="characters" value={estado} onChangeText={setEstado} />
          </View>
        </View>
      </SectionCard>

      <View className="mt-2 mb-2">
        <Button title="Salvar Alterações" onPress={handleSave} loading={updateProfile.isPending} />
      </View>
    </ScreenContainer>
  );
}
