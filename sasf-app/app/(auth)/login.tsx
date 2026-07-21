import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useToast } from '../../components/ui/Toast';
import { useLogin } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.email('E-mail inválido.'),
  senha: z.string().min(1, 'Senha obrigatória.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const loginMutation = useLogin();
  const toast = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onError: (err: any) => {
        toast.show(err?.response?.data?.error || 'Erro ao fazer login.', 'error');
      },
    });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center">
        <View className="items-center mb-10">
          <Logo size={76} />
          <Text className="text-3xl font-bold text-gray-900 mt-5 tracking-tight">SASF</Text>
          <Text className="text-sm text-gray-500 mt-1.5 text-center px-10 leading-5">
            Sistema de Acompanhamento{'\n'}de Saúde Familiar
          </Text>
        </View>

        <View className="mb-1">
          <Text className="text-xl font-bold text-gray-900">Bem-vindo de volta</Text>
          <Text className="text-sm text-gray-500 mt-1">Entre com sua conta para continuar</Text>
        </View>

        <View className="mt-5">
          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="E-mail" icon="mail-outline" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )} />

          <Controller control={control} name="senha" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Senha" icon="lock-closed-outline" placeholder="Sua senha" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.senha?.message} />
          )} />
        </View>

        <View className="mt-2">
          <Button title="Entrar" onPress={handleSubmit(onSubmit)} loading={loginMutation.isPending} />
        </View>

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-500 text-sm">Não tem conta? </Text>
          <Link href="/(auth)/register" className="text-primary font-bold text-sm">Cadastre-se</Link>
        </View>

        <View className="items-center mt-10">
          <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
            <Text className="text-xs text-gray-400">SASF v1.0 · IFPI Campus Picos</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
