import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useProfessionals(status?: string) {
  return useQuery({
    queryKey: ['professionals', status],
    queryFn: () => adminService.listProfessionals(status),
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: ['professional', id],
    queryFn: () => adminService.getProfessional(id),
    enabled: !!id,
  });
}

export function useApproveProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
}

export function useRejectProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => adminService.reject(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
}
