import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import type { ApiUser } from '../types/api';

type AuthState = {
  user: ApiUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.accessToken);
    set({ accessToken: data.accessToken, user: data.user, isAuthenticated: true, loading: false });
  },
  register: async (username, email, password) => {
    set({ loading: true });
    await apiClient.post('/auth/register', { username, email, password });
    set({ loading: false });
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
  fetchMe: async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('access_token');
      set({ accessToken: null, user: null, isAuthenticated: false });
    }
  }
}));
