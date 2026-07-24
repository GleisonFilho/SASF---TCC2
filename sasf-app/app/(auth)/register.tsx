import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ChipSelect } from '../../components/ui/ChipSelect';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useToast } from '../../components/ui/Toast';
import { useRegister, useRegisterProfessional } from '../../hooks/useAuth';

const senhaSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres.')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula.')
  .regex(/[0-9]/, 'Deve conter um número.')
  .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial.');

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.email('E-mail inválido.'),
  senha: senhaSchema,
  telefone: z.string().optional(),
});

const UF_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
] as const;

const registerProfessionalSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.email('E-mail inválido.'),
  senha: senhaSchema,
  telefone: z.string().optional(),
  registroProfissional: z.string().min(3, 'Registro profissional obrigatório.'),
  categoriaConselho: z.string().min(1, 'Selecione a categoria.'),
  ufConselho: z
    .string()
    .refine((v) => (UF_VALIDAS as readonly string[]).includes(v.toUpperCase()), { message: 'UF inválida. Ex: PI, SP, RJ.' }),
  especialidade: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;
type RegisterProfessionalForm = z.infer<typeof registerProfessionalSchema>;

const categoriaOptions = [
  { value: 'CRM', label: 'CRM (Medicina)' },
  { value: 'COREN', label: 'COREN (Enfermagem)' },
  { value: 'CRP', label: 'CRP (Psicologia)' },
  { value: 'CRN', label: 'CRN (Nutrição)' },
  { value: 'CREFITO', label: 'CREFITO (Fisioterapia)' },
  { value: 'CRF', label: 'CRF (Farmácia)' },
  { value: 'CRO', label: 'CRO (Odontologia)' },
];

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">{children}</Text>;
}

export default function RegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<'PACIENTE' | 'PROFISSIONAL'>('PACIENTE');

  const registerMutation = useRegister();
  const registerProfessionalMutation = useRegisterProfessional();

  const patientForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: '', email: '', senha: '', telefone: '' },
  });

  const professionalForm = useForm<RegisterProfessionalForm>({
    resolver: zodResolver(registerProfessionalSchema),
    defaultValues: { nome: '', email: '', senha: '', telefone: '', registroProfissional: '', categoriaConselho: '', ufConselho: '', especialidade: '' },
  });

  const onSubmitPatient = (data: RegisterForm) => {
    registerMutation.mutate(
      { ...data, telefone: data.telefone || undefined },
      {
        onError: (err: any) => {
          toast.show(err?.response?.data?.error || 'Erro ao cadastrar.', 'error');
        },
      },
    );
  };

  const onSubmitProfessional = (data: RegisterProfessionalForm) => {
    registerProfessionalMutation.mutate(
      { ...data, telefone: data.telefone || undefined, especialidade: data.especialidade || undefined, ufConselho: data.ufConselho.toUpperCase() },
      {
        onSuccess: (res) => {
          toast.show(res.message || 'Cadastro realizado. Aguarde a aprovação do administrador.', 'success');
          router.replace('/(auth)/login');
        },
        onError: (err: any) => {
          toast.show(err?.response?.data?.error || 'Erro ao cadastrar.', 'error');
        },
      },
    );
  };

  const isPending = registerMutation.isPending || registerProfessionalMutation.isPending;

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
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 tracking-tight">Criar Conta</Text>
          <Text className="text-sm text-gray-500 mt-1.5">Escolha o tipo de cadastro</Text>
        </View>

        <View className="flex-row gap-2 mb-6">
          {(['PACIENTE', 'PROFISSIONAL'] as const).map((r) => {
            const selected = role === r;
            return (
              <TouchableOpacity
                key={r}
                className="flex-1 py-3 rounded-xl border items-center"
                style={selected ? { backgroundColor: '#EFF6FF', borderColor: '#2563EB' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
                onPress={() => setRole(r)}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold" style={{ color: selected ? '#2563EB' : '#64748B' }}>
                  {r === 'PACIENTE' ? 'Paciente / Familiar' : 'Profissional de Saúde'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {role === 'PACIENTE' ? (
          <>
            <SectionLabel>Dados pessoais</SectionLabel>
            <Controller control={patientForm.control} name="nome" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nome completo" icon="person-outline" placeholder="Seu nome" value={value} onChangeText={onChange} onBlur={onBlur} error={patientForm.formState.errors.nome?.message} />
            )} />

            <Controller control={patientForm.control} name="telefone" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Telefone (opcional)" icon="call-outline" placeholder="(89) 99999-0000" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />

            <View className="mt-1">
              <SectionLabel>Dados de acesso</SectionLabel>
            </View>
            <Controller control={patientForm.control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="E-mail" icon="mail-outline" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={patientForm.formState.errors.email?.message} />
            )} />

            <Controller control={patientForm.control} name="senha" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Senha" icon="lock-closed-outline" placeholder="Mínimo 8 caracteres" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={patientForm.formState.errors.senha?.message} />
            )} />
            <View className="flex-row items-center -mt-2 mb-5">
              <Icon name="information-circle-outline" size={13} color="#94A3B8" />
              <Text className="text-xs text-gray-400 ml-1.5 flex-1">Use letra maiúscula, número e um caractere especial.</Text>
            </View>

            <Button title="Cadastrar" onPress={patientForm.handleSubmit(onSubmitPatient)} loading={isPending} />
          </>
        ) : (
          <>
            <SectionLabel>Dados pessoais</SectionLabel>
            <Controller control={professionalForm.control} name="nome" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nome completo" icon="person-outline" placeholder="Seu nome" value={value} onChangeText={onChange} onBlur={onBlur} error={professionalForm.formState.errors.nome?.message} />
            )} />

            <Controller control={professionalForm.control} name="telefone" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Telefone (opcional)" icon="call-outline" placeholder="(89) 99999-0000" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />

            <View className="mt-1">
              <SectionLabel>Dados de acesso</SectionLabel>
            </View>
            <Controller control={professionalForm.control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="E-mail" icon="mail-outline" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={professionalForm.formState.errors.email?.message} />
            )} />

            <Controller control={professionalForm.control} name="senha" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Senha" icon="lock-closed-outline" placeholder="Mínimo 8 caracteres" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={professionalForm.formState.errors.senha?.message} />
            )} />
            <View className="flex-row items-center -mt-2 mb-5">
              <Icon name="information-circle-outline" size={13} color="#94A3B8" />
              <Text className="text-xs text-gray-400 ml-1.5 flex-1">Use letra maiúscula, número e um caractere especial.</Text>
            </View>

            <View className="mt-1">
              <SectionLabel>Dados profissionais</SectionLabel>
            </View>
            <Controller control={professionalForm.control} name="registroProfissional" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Registro Profissional" icon="card-outline" placeholder="Ex: 12345" value={value} onChangeText={onChange} onBlur={onBlur} error={professionalForm.formState.errors.registroProfissional?.message} />
            )} />

            <Controller control={professionalForm.control} name="categoriaConselho" render={({ field: { onChange, value } }) => (
              <ChipSelect label="Categoria do Conselho" options={categoriaOptions} value={value} onChange={onChange} />
            )} />
            {professionalForm.formState.errors.categoriaConselho && (
              <Text className="text-danger text-xs -mt-2 mb-3">{professionalForm.formState.errors.categoriaConselho.message}</Text>
            )}

            <Controller control={professionalForm.control} name="ufConselho" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="UF do Conselho" icon="location-outline" placeholder="Ex: PI" maxLength={2} autoCapitalize="characters" value={value} onChangeText={onChange} onBlur={onBlur} error={professionalForm.formState.errors.ufConselho?.message} />
            )} />

            <Controller control={professionalForm.control} name="especialidade" render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Especialidade (opcional)" icon="ribbon-outline" placeholder="Ex: Clínico Geral" value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />

            <View className="bg-primary-50 rounded-2xl p-4 mb-6 flex-row items-start">
              <Icon name="time-outline" size={16} color="#2563EB" />
              <Text className="text-xs text-primary flex-1 ml-2.5">
                Seu cadastro ficará com status "Pendente" até ser aprovado por um administrador. Você não terá acesso a dados de pacientes até a aprovação.
              </Text>
            </View>

            <Button title="Cadastrar" onPress={professionalForm.handleSubmit(onSubmitProfessional)} loading={isPending} />
          </>
        )}

        <View className="flex-row justify-center items-center mt-6 mb-4">
          <Text className="text-gray-500 text-sm">Já tem conta? </Text>
          <Link href="/(auth)/login" className="text-primary font-bold text-sm">Fazer login</Link>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
