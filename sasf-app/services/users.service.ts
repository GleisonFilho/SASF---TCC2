import { api } from './api';
import type { User, UpdateProfileBody } from '../types';

export const usersService = {
  async updateProfile(body: UpdateProfileBody): Promise<User> {
    const { data } = await api.put('/users/me', body);
    return data;
  },
};
