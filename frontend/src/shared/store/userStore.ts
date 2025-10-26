import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@mubarak-way/shared';
import { authService } from '../lib/services';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
  toggleFavorite: (
    type: 'books' | 'nashids' | 'ayahs' | 'lessons',
    itemId: string | number
  ) => Promise<void>;
  toggleOffline: (type: 'books' | 'nashids', itemId: number) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login();
          set({ user: response.user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateUser: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authService.updateUser(user.telegramId, updates);
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null });
      },

      toggleFavorite: async (type, itemId) => {
        const { user } = get();
        if (!user) return;

        const isFavorite = user.favorites[type].includes(itemId as any);
        const action = isFavorite ? 'remove' : 'add';

        try {
          const response = await authService.toggleFavorite(
            user.telegramId,
            type,
            itemId,
            action
          );

          // Update local state
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  favorites: response.favorites,
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      toggleOffline: async (type, itemId) => {
        const { user } = get();
        if (!user) return;

        const isOffline = user.offline[type].includes(itemId);
        const action = isOffline ? 'remove' : 'add';

        try {
          const response = await authService.toggleOffline(
            user.telegramId,
            type,
            itemId,
            action
          );

          // Update local state
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  offline: response.offline,
                  usage: response.usage,
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
