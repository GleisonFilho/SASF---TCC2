import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useToast } from '../../components/ui/Toast';
import { useRegister } from '../../hooks/useAuth';

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.email('E-mail inválido.'),
  senha: z
    .string()
    .min(8, 'Mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula.')
    .regex(/[0-9]/, 'Deve conter um número.')
    .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial.'),
  telefone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">{children}</Text>;
}

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegister();
  const toast = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: '', email: '', senha: '', telefone: '' },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(
      { ...data, telefone: data.telefone || undefined },
      {
        onError: (err: any) => {
          toast.show(err?.response?.data?.error || 'Erro ao cadastrar.', 'error');
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mt-2 mb-4"
      >
        <Icon name="chevron-back" size={20} color="#334155" />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 tracking-tight">Criar Conta</Text>
          <Text className="text-sm text-gray-500 mt-1.5">Cadastre-se como Paciente / Responsável</Text>
        </View>

        <SectionLabel>Dados pessoais</SectionLabel>
        <Controller control={control} name="nome" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Nome completo" icon="person-outline" placeholder="Seu nome" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.nome?.message} />
        )} />

        <Controller control={control} name="telefone" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Telefone (opcional)" icon="call-outline" placeholder="(89) 99999-0000" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
        )} />

        <View className="mt-1">
          <SectionLabel>Dados de acesso</SectionLabel>
        </View>
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="E-mail" icon="mail-outline" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
        )} />

        <Controller control={control} name="senha" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Senha" icon="lock-closed-outline" placeholder="Mínimo 8 caracteres" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.senha?.message} />
        )} />
        <View className="flex-row items-center -mt-2 mb-5">
          <Icon name="information-circle-outline" size={13} color="#94A3B8" />
          <Text className="text-xs text-gray-400 ml-1.5 flex-1">Use letra maiúscula, número e um caractere especial.</Text>
        </View>

        <Button title="Cadastrar" onPress={handleSubmit(onSubmit)} loading={registerMutation.isPending} />

        <View className="flex-row justify-center items-center mt-6 mb-4">
          <Text className="text-gray-500 text-sm">Já tem conta? </Text>
          <Link href="/(auth)/login" className="text-primary font-bold text-sm">Fazer login</Link>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
