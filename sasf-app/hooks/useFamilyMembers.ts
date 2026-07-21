import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyMembersService } from '../services/familyMembers.service';

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['familyMembers'],
    queryFn: familyMembersService.list,
  });
}

export function useFamilyMember(id: string) {
  return useQuery({
    queryKey: ['familyMember', id],
    queryFn: () => familyMembersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyMembersService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyMembers'] }),
  });
}

export function useDeleteFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyMembersService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyMembers'] }),
  });
}
