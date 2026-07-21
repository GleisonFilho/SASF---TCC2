import { useMutation } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { useAuthStore } from '../store/authStore';
import type { UpdateProfileBody } from '../types';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (body: UpdateProfileBody) => usersService.updateProfile(body),
    onSuccess: (user) => setUser(user),
  });
}
