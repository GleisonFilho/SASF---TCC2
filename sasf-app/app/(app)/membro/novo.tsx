import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Input } from '../../../components/ui/Input';
import { ChipSelect } from '../../../components/ui/ChipSelect';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { useCreateFamilyMember } from '../../../hooks/useFamilyMembers';

const schema = z.object({
  nome: z.string().min(2, 'Mínimo 2 caracteres.'),
  dataNascimento: z.string().date('Use o formato AAAA-MM-DD.'),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro']),
  parentesco: z.string().min(2, 'Obrigatório.'),
});

type FormData = z.infer<typeof schema>;

const sexOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
];

export default function NovoMembroScreen() {
  const router = useRouter();
  const createMutation = useCreateFamilyMember();
  const toast = useToast();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', dataNascimento: '', sexo: 'Masculino', parentesco: '' },
  });

  const selectedSexo = watch('sexo');

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.show('Membro cadastrado com sucesso!', 'success');
        router.back();
      },
      onError: (err: any) => {
        toast.show(err?.response?.data?.error || 'Erro ao cadastrar membro.', 'error');
      },
    });
  };

  return (
    <ScreenContainer>
      <Controller control={control} name="nome" render={({ field: { onChange, onBlur, value } }) => (
        <Input label="Nome completo" icon="person-outline" placeholder="Nome do membro" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.nome?.message} />
      )} />

      <Controller control={control} name="dataNascimento" render={({ field: { onChange, onBlur, value } }) => (
        <Input label="Data de nascimento" icon="calendar-outline" placeholder="AAAA-MM-DD" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.dataNascimento?.message} />
      )} />

      <ChipSelect label="Sexo" options={sexOptions} value={selectedSexo} onChange={(v) => setValue('sexo', v as FormData['sexo'])} />
      {errors.sexo && <Text className="text-danger text-xs -mt-2 mb-2">{errors.sexo.message}</Text>}

      <Controller control={control} name="parentesco" render={({ field: { onChange, onBlur, value } }) => (
        <Input label="Parentesco" icon="people-outline" placeholder="Ex: Filho, Pai, Mãe" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.parentesco?.message} />
      )} />

      <View className="mt-4">
        <Button title="Cadastrar Membro" onPress={handleSubmit(onSubmit)} loading={createMutation.isPending} />
      </View>
    </ScreenContainer>
  );
}
