import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSummary } from '../types';

interface AuthState {
  token: string | null;
  user: UserSummary | null;
  setAuth: (token: string, user: UserSummary) => void;
  updateUser: (user: Partial<UserSummary>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'chat-auth-storage', // unique name
      // Only persist token and user
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    }
  )
);
