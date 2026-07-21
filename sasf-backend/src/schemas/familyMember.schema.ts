import { z } from 'zod/v4';

export const createFamilyMemberSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  dataNascimento: z.string().date('Data de nascimento inválida. Use o formato AAAA-MM-DD.'),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro']),
  parentesco: z.string().min(2, 'Parentesco obrigatório.'),
});

export const updateFamilyMemberSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').optional(),
  dataNascimento: z.string().date('Data de nascimento inválida. Use o formato AAAA-MM-DD.').optional(),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro']).optional(),
  parentesco: z.string().min(2, 'Parentesco obrigatório.').optional(),
});
