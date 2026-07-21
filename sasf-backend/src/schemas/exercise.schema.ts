import { z } from 'zod/v4';

export const createExerciseSchema = z.object({
  tipo: z.enum(['CAMINHADA', 'CORRIDA', 'ACADEMIA', 'CICLISMO', 'NATACAO', 'FUTEBOL', 'OUTRO']),
  duracaoMin: z.number().int().min(1, 'Duração obrigatória.').max(720),
  distanciaKm: z.number().min(0).optional(),
  caloriasEst: z.number().int().min(0).optional(),
  intensidade: z.enum(['LEVE', 'MODERADA', 'INTENSA']),
  observacoes: z.string().optional(),
  dataHora: z.string().datetime({ message: 'Use formato ISO 8601.' }),
});
