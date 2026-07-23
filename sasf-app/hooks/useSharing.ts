import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '../services/sharing.service';
import type { EscopoCompartilhamento } from '../types';

export function useSharings() {
  return useQuery({
    queryKey: ['sharings'],
    queryFn: sharingService.list,
  });
}

export function useSharing(id: string) {
  return useQuery({
    queryKey: ['sharing', id],
    queryFn: () => sharingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      membroId: string;
      profissionalEmail: string;
      dataExpiracao: string;
      observacoes?: string;
      escopos: EscopoCompartilhamento[];
    }) => sharingService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sharings'] }),
  });
}

export function useRevokeSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sharingService.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sharings'] });
    },
  });
}

export function useProfessionalAccess(enabled = true) {
  return useQuery({
    queryKey: ['professionalAccess'],
    queryFn: sharingService.listProfessionalAccess,
    enabled,
  });
}

export function usePatientData(token: string) {
  return useQuery({
    queryKey: ['patientData', token],
    queryFn: () => sharingService.getPatientData(token),
    enabled: !!token,
  });
}
