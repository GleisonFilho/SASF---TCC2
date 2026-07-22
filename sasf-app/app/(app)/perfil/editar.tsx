import { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
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
  const [fotoUrl, setFotoUrl] = useState(user?.fotoUrl || '');
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const handlePhotoPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show('Permissão de acesso às fotos negada.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setProcessingPhoto(true);
    try {
      // Redimensiona pra 400x400 e comprime antes de guardar como data URI —
      // evita mandar/armazenar fotos de câmera em resolução alta (vários MB).
      const rendered = await ImageManipulator.manipulate(result.assets[0].uri)
        .resize({ width: 400, height: 400 })
        .renderAsync();
      const saved = await rendered.saveAsync({ base64: true, compress: 0.6, format: SaveFormat.JPEG });
      if (!saved.base64) throw new Error('Sem dados da imagem.');
      setFotoUrl(`data:image/jpeg;base64,${saved.base64}`);
    } catch {
      toast.show('Erro ao processar a imagem.', 'error');
    } finally {
      setProcessingPhoto(false);
    }
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
        fotoUrl: fotoUrl || undefined,
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
        <TouchableOpacity onPress={handlePhotoPress} activeOpacity={0.7} disabled={processingPhoto}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <LinearGradient
              colors={['#2563EB', '#06B6D4']}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="text-white font-extrabold text-4xl">{nome?.[0] || '?'}</Text>
            </LinearGradient>
          )}
          <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-surface">
            <Icon name={processingPhoto ? 'hourglass' : 'camera'} size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400 mt-2.5">{processingPhoto ? 'Processando...' : 'Toque para alterar a foto'}</Text>
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
