import { apiGet } from '../api';
import type { Lesson } from '@mubarak-way/shared';

export const prayerService = {
  /**
   * Get all lessons
   */
  getAllLessons: async (category?: string): Promise<Lesson[]> => {
    return await apiGet<Lesson[]>('/prayer/lessons', { category });
  },

  /**
   * Get lesson by slug
   */
  getLesson: async (slug: string): Promise<Lesson> => {
    return await apiGet<Lesson>(`/prayer/lessons/${slug}`);
  },

  /**
   * Get featured lessons
   */
  getFeaturedLessons: async (limit = 5): Promise<Lesson[]> => {
    return await apiGet<Lesson[]>('/prayer/lessons/featured', { limit });
  },

  /**
   * Get lessons by category
   */
  getLessonsByCategory: async (category: string): Promise<Lesson[]> => {
    return await apiGet<Lesson[]>(`/prayer/lessons/category/${category}`);
  },

  /**
   * Get lessons by difficulty
   */
  getLessonsByDifficulty: async (
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<Lesson[]> => {
    return await apiGet<Lesson[]>(`/prayer/lessons/difficulty/${difficulty}`);
  },

  /**
   * Search lessons
   */
  searchLessons: async (query: string): Promise<Lesson[]> => {
    return await apiGet<Lesson[]>('/prayer/search', { q: query });
  },

  /**
   * Get prayer statistics
   */
  getStats: async (): Promise<any> => {
    return await apiGet('/prayer/stats');
  },
};
