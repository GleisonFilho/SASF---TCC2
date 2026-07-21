import { z } from 'zod/v4';

export const createEmergencyContactSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  parentesco: z.string().min(2, 'Parentesco deve ter no mínimo 2 caracteres.'),
  telefone: z.string().min(8, 'Telefone deve ter no mínimo 8 caracteres.'),
});

export const updateEmergencyContactSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').optional(),
  parentesco: z.string().min(2, 'Parentesco deve ter no mínimo 2 caracteres.').optional(),
  telefone: z.string().min(8, 'Telefone deve ter no mínimo 8 caracteres.').optional(),
});
