import { apiGet, apiPost, apiPut } from '../api';
import type { User, UserUpdateDto, LoginResponse } from '@mubarak-way/shared';

export const authService = {
  /**
   * Login or register user
   */
  login: async (): Promise<LoginResponse> => {
    return await apiPost<LoginResponse>('/auth/login');
  },

  /**
   * Get user by Telegram ID
   */
  getUser: async (telegramId: string): Promise<User> => {
    return await apiGet<User>(`/auth/user/${telegramId}`);
  },

  /**
   * Update user preferences
   */
  updateUser: async (telegramId: string, updates: UserUpdateDto): Promise<User> => {
    return await apiPut<User>(`/auth/user/${telegramId}`, updates);
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async (telegramId: string, data: UserUpdateDto): Promise<User> => {
    return await apiPost<User>(`/auth/onboarding/${telegramId}`, data);
  },

  /**
   * Add/remove favorite
   */
  toggleFavorite: async (
    telegramId: string,
    type: 'books' | 'nashids' | 'ayahs' | 'lessons',
    itemId: string | number,
    action: 'add' | 'remove'
  ): Promise<any> => {
    return await apiPost(`/auth/favorites/${telegramId}`, {
      type,
      itemId,
      action,
    });
  },

  /**
   * Add/remove offline content
   */
  toggleOffline: async (
    telegramId: string,
    type: 'books' | 'nashids',
    itemId: number,
    action: 'add' | 'remove'
  ): Promise<any> => {
    return await apiPost(`/auth/offline/${telegramId}`, {
      type,
      itemId,
      action,
    });
  },
};
