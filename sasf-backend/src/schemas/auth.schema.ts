import { z } from 'zod/v4';

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.email('E-mail inválido.'),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula.')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número.')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial.'),
  telefone: z.string().optional(),
});

const UF_VALIDAS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
] as const;

export const registerProfessionalSchema = registerSchema.extend({
  registroProfissional: z.string().min(3, 'Registro profissional obrigatório.'),
  categoriaConselho: z.enum(['CRM', 'COREN', 'CRP', 'CRN', 'CREFITO', 'CRF', 'CRO']),
  ufConselho: z.enum(UF_VALIDAS),
  especialidade: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email('E-mail inválido.'),
  senha: z.string().min(1, 'Senha obrigatória.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório.'),
});
