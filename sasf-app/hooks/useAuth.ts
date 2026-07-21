import { useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { router } from 'expo-router';

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      authService.login(email, senha),
    onSuccess: (data) => {
      setUser(data.user);
      router.replace('/(app)/(tabs)/home');
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (body: { nome: string; email: string; senha: string; telefone?: string }) =>
      authService.register(body),
    onSuccess: (data) => {
      setUser(data.user);
      router.replace('/(app)/(tabs)/home');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      router.replace('/(auth)/login');
    },
  });
}

export function useRestoreSession() {
  const setUser = useAuthStore((s) => s.setUser);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  return useCallback(async () => {
    try {
      const hasToken = await authService.hasStoredToken();
      if (!mounted.current) return;
      if (!hasToken) {
        setUser(null);
        return;
      }
      const user = await authService.me();
      if (!mounted.current) return;
      setUser(user);
    } catch {
      if (mounted.current) setUser(null);
    }
  }, [setUser]);
}
