import { z } from 'zod/v4';

export const createMedicationSchema = z.object({
  nomeMedicamento: z.string().min(2, 'Nome do medicamento deve ter no mínimo 2 caracteres.'),
  dosagem: z.string().optional(),
  frequencia: z.string().optional(),
  dataInicio: z.string().date('Data de início inválida. Use o formato AAAA-MM-DD.').optional(),
  dataFim: z.string().date('Data de fim inválida. Use o formato AAAA-MM-DD.').optional(),
  usoContinuo: z.boolean().optional(),
});

export const updateMedicationSchema = z.object({
  nomeMedicamento: z.string().min(2, 'Nome do medicamento deve ter no mínimo 2 caracteres.').optional(),
  dosagem: z.string().optional(),
  frequencia: z.string().optional(),
  dataInicio: z.string().date('Data de início inválida. Use o formato AAAA-MM-DD.').optional(),
  dataFim: z.string().date('Data de fim inválida. Use o formato AAAA-MM-DD.').optional(),
  usoContinuo: z.boolean().optional(),
});
