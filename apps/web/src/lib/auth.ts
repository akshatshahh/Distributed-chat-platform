import { api } from './api-client';
import { useAuthStore } from '../stores/auth.store';
import type { ApiResponse, AuthResponse } from '@chat/shared-types';

export async function login(email: string, password: string) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  if (res.data) {
    useAuthStore.getState().setAuth(res.data.user, res.data.accessToken);
  }
  return res;
}

export async function register(username: string, email: string, displayName: string, password: string) {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    username,
    email,
    displayName,
    password,
  });
  if (res.data) {
    useAuthStore.getState().setAuth(res.data.user, res.data.accessToken);
  }
  return res;
}

export async function refreshToken() {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
  if (res.data) {
    useAuthStore.getState().setToken(res.data.accessToken);
  }
  return res;
}

export async function logout() {
  await api.post('/auth/logout');
  useAuthStore.getState().logout();
}
