import { z } from 'zod/v4';

export const upsertProfileSchema = z.object({
  alturaAtualCm: z.number().min(30).max(300).optional(),
  pesoAtualKg: z.number().min(1).max(500).optional(),
  metaPesoKg: z.number().min(1).max(500).optional(),
  percentualGordura: z.number().min(1).max(80).optional(),
  circunferenciaAbdominal: z.number().min(20).max(300).optional(),
  metaAguaMl: z.number().int().min(500).max(10000).optional(),
});

export const createWeightSchema = z.object({
  pesoKg: z.number().min(1, 'Peso obrigatório.').max(500),
  dataHora: z.string().datetime({ message: 'Use formato ISO 8601.' }),
});

export const createWaterSchema = z.object({
  quantidadeMl: z.number().int().min(1, 'Quantidade obrigatória.').max(5000),
  dataHora: z.string().datetime({ message: 'Use formato ISO 8601.' }),
});

export const createMealSchema = z.object({
  tipo: z.enum(['CAFE_DA_MANHA', 'LANCHE_MANHA', 'ALMOCO', 'LANCHE_TARDE', 'JANTAR', 'CEIA', 'OUTRO']),
  descricao: z.string().min(2, 'Descrição obrigatória.'),
  calorias: z.number().int().min(0).optional(),
  dataHora: z.string().datetime({ message: 'Use formato ISO 8601.' }),
  observacoes: z.string().optional(),
});

export const createMealPlanSchema = z.object({
  membroId: z.string().uuid(),
  titulo: z.string().min(2, 'Título obrigatório.'),
  descricao: z.string().optional(),
  metaCaloricaDia: z.number().int().min(500).max(10000).optional(),
  dataInicio: z.string().date('Use formato AAAA-MM-DD.'),
  dataFim: z.string().date('Use formato AAAA-MM-DD.').optional(),
  observacoes: z.string().optional(),
});

export const updateMealPlanSchema = z.object({
  titulo: z.string().min(2).optional(),
  descricao: z.string().optional(),
  metaCaloricaDia: z.number().int().min(500).max(10000).optional(),
  ativo: z.boolean().optional(),
  dataFim: z.string().date().optional(),
  observacoes: z.string().optional(),
});
