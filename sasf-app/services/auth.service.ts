import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import type { AuthResponse, User, RegisterProfessionalBody, RegisterProfessionalResponse } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, senha });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    return data;
  },

  async register(body: { nome: string; email: string; senha: string; telefone?: string }): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', body);
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    return data;
  },

  async registerProfessional(body: RegisterProfessionalBody): Promise<RegisterProfessionalResponse> {
    const { data } = await api.post('/auth/register/professional', body);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  async hasStoredToken(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },
};
