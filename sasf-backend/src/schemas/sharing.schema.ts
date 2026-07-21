import { z } from 'zod/v4';

export const createSharingSchema = z.object({
  membroId: z.string().uuid('ID do membro inválido.'),
  profissionalEmail: z.email('E-mail do profissional inválido.'),
  dataExpiracao: z.string().datetime({ message: 'Use formato ISO 8601.' }),
  observacoes: z.string().optional(),
  escopos: z
    .array(z.enum(['PERFIL', 'MEMBROS', 'CONDICOES', 'ALERGIAS', 'MEDICAMENTOS', 'CONTATOS', 'VITAIS', 'SINTOMAS']))
    .min(1, 'Selecione ao menos um escopo.'),
});