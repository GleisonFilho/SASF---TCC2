import { z } from 'zod/v4';

export const createVitalSignSchema = z.object({
  tipoMedicao: z.enum(['PRESSAO', 'GLICEMIA', 'PESO', 'TEMPERATURA', 'FC', 'SPO2']),
  valorPrimario: z.number().positive('Valor deve ser positivo.'),
  valorSecundario: z.number().positive('Valor deve ser positivo.').optional(),
  unidade: z.string().min(1, 'Unidade obrigatória.'),
  dataHoraMedicao: z.string().datetime({ message: 'Use formato ISO 8601 (AAAA-MM-DDTHH:mm:ss.sssZ).' }),
  observacoes: z.string().optional(),
});
