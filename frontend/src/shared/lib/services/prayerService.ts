import { apiGet, apiPost } from '../api';
import type { Lesson, PrayerTimes, PrayerCalculationParams, QiblaDirection } from '@mubarak-way/shared';

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

  /**
   * Calculate prayer times
   */
  calculatePrayerTimes: async (
    latitude: number,
    longitude: number,
    params: Partial<PrayerCalculationParams>,
    city?: string,
    country?: string
  ): Promise<PrayerTimes> => {
    return await apiPost<PrayerTimes>('/prayer/times', {
      latitude,
      longitude,
      calculationMethod: params.calculationMethod || 'MuslimWorldLeague',
      madhab: params.madhab || 'hanafi',
      highLatitudeRule: params.highLatitudeRule,
      adjustments: params.adjustments,
      city,
      country,
    });
  },

  /**
   * Get all calculation methods
   */
  getCalculationMethods: async (): Promise<any[]> => {
    return await apiGet('/prayer/times/methods');
  },

  /**
   * Calculate Qibla direction
   */
  calculateQibla: async (latitude: number, longitude: number): Promise<QiblaDirection> => {
    return await apiPost<QiblaDirection>('/prayer/qibla', {
      latitude,
      longitude,
    });
  },
};
