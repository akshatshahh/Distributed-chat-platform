import { create } from 'zustand';
import type { UserSummary } from '@chat/shared-types';

interface AuthState {
  user: UserSummary | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserSummary, accessToken: string) => void;
  setToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  setToken: (accessToken) => set({ accessToken }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
