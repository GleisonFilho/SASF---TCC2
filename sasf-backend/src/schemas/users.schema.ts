import { z } from 'zod/v4';

const UF_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
] as const;

export const updateProfileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').optional(),
  telefone: z.string().optional(),
  fotoUrl: z.string().optional(),
  dataNascimento: z.string().date('Use o formato AAAA-MM-DD.').optional(),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro']).optional(),
  endereco: z.string().max(255).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.enum(UF_VALIDAS).optional(),
});
