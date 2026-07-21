import { z } from 'zod/v4';

export const createAllergySchema = z.object({
  substancia: z.string().min(2, 'Substância deve ter no mínimo 2 caracteres.'),
  gravidade: z.enum(['LEVE', 'MODERADA', 'GRAVE']).optional(),
  reacao: z.string().optional(),
});

export const updateAllergySchema = z.object({
  substancia: z.string().min(2, 'Substância deve ter no mínimo 2 caracteres.').optional(),
  gravidade: z.enum(['LEVE', 'MODERADA', 'GRAVE']).optional(),
  reacao: z.string().optional(),
});
