import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '../services/sharing.service';
import type { EscopoCompartilhamento } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useSharings() {
  return useQuery({
    queryKey: ['sharings'],
    queryFn: sharingService.list,
  });
}

export function useProfessionalLookup(email: string) {
  return useQuery({
    queryKey: ['professionalLookup', email],
    queryFn: () => sharingService.lookupProfessional(email),
    enabled: EMAIL_REGEX.test(email),
    retry: false,
    staleTime: 60_000,
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

export function useProfessionalNotes(token: string) {
  return useQuery({
    queryKey: ['professionalNotes', token],
    queryFn: () => sharingService.listNotes(token),
    enabled: !!token,
  });
}

export function useCreateProfessionalNote(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (texto: string) => sharingService.createNote(token, texto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionalNotes', token] }),
  });
}

export function useDeleteProfessionalNote(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sharingService.deleteNote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionalNotes', token] }),
  });
}
