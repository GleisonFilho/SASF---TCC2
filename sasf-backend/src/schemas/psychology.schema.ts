import { z } from 'zod/v4';

const scale1to10 = z.number().int().min(1, 'Mínimo 1.').max(10, 'Máximo 10.');

export const createPsychologySchema = z.object({
  humor: scale1to10,
  ansiedade: scale1to10,
  estresse: scale1to10,
  qualidadeSono: scale1to10,
  energia: scale1to10,
  observacoes: z.string().optional(),
  dataHora: z.string().datetime({ message: 'Use formato ISO 8601.' }),
});
