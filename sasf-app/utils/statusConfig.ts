export const sharingStatusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ATIVO: { bg: 'bg-green-100', text: 'text-green-700', dot: '#16A34A', label: 'Ativo' },
  REVOGADO: { bg: 'bg-red-100', text: 'text-red-700', dot: '#DC2626', label: 'Revogado' },
  EXPIRADO: { bg: 'bg-gray-100', text: 'text-gray-500', dot: '#94A3B8', label: 'Expirado' },
};

export const professionalStatusConfig: Record<string, { bg: string; text: string; dot: string; label: string; icon: 'time' | 'checkmark-circle' | 'close-circle' }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: '#D97706', label: 'Pendente', icon: 'time' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', dot: '#16A34A', label: 'Aprovado', icon: 'checkmark-circle' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', dot: '#DC2626', label: 'Rejeitado', icon: 'close-circle' },
};
