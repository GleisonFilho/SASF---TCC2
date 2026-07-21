import { z } from 'zod/v4';

export const rejectProfessionalSchema = z.object({
  motivo: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres.'),
});
