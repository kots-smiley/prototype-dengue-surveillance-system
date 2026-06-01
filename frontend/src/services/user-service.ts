import { apiClient, buildQuery } from '../utils/api-client';
import { User } from '../types';

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  barangayId?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  barangayId?: string;
  isActive?: boolean;
}

export const userService = {
  list(params: { role?: string; barangayId?: string; isActive?: string } = {}) {
    return apiClient<{ users: User[] }>(`/users${buildQuery(params)}`);
  },

  getById(id: string) {
    return apiClient<{ user: User }>(`/users/${id}`);
  },

  create(payload: CreateUserPayload) {
    return apiClient<{ user: User }>('/users', { method: 'POST', body: payload });
  },

  update(id: string, payload: UpdateUserPayload) {
    return apiClient<{ user: User }>(`/users/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/users/${id}`, { method: 'DELETE' });
  },
};
