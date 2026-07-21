import { z } from 'zod/v4';

export const createSymptomSchema = z.object({
  descricao: z.string().min(2, 'Descrição deve ter no mínimo 2 caracteres.'),
  intensidade: z.number().int().min(1, 'Mínimo 1.').max(10, 'Máximo 10.'),
  dataHoraOcorrencia: z.string().datetime({ message: 'Use formato ISO 8601.' }),
  observacoes: z.string().optional(),
});
