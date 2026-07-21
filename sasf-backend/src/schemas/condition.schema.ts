import { z } from 'zod/v4';

export const createConditionSchema = z.object({
  nomeCondicao: z.string().min(2, 'Nome da condição deve ter no mínimo 2 caracteres.'),
  dataDiagnostico: z
    .string()
    .date('Data de diagnóstico inválida. Use o formato AAAA-MM-DD.')
    .optional(),
  status: z.enum(['ATIVA', 'CONTROLADA', 'RESOLVIDA']).optional(),
  observacoes: z.string().optional(),
});

export const updateConditionSchema = z.object({
  nomeCondicao: z.string().min(2, 'Nome da condição deve ter no mínimo 2 caracteres.').optional(),
  dataDiagnostico: z
    .string()
    .date('Data de diagnóstico inválida. Use o formato AAAA-MM-DD.')
    .optional(),
  status: z.enum(['ATIVA', 'CONTROLADA', 'RESOLVIDA']).optional(),
  observacoes: z.string().optional(),
});
