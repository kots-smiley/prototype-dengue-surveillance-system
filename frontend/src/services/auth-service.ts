import { apiClient } from '../utils/api-client';
import { User } from '../types';

interface LoginResult {
  token: string;
  user: User;
}

export const authService = {
  login(email: string, password: string) {
    return apiClient<LoginResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
  },

  me() {
    return apiClient<{ user: User }>('/auth/me');
  },

  changePassword(currentPassword: string, newPassword: string) {
    return apiClient<null>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  },
};
