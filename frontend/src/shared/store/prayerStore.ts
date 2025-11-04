import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lesson, PrayerTimes, PrayerCalculationParams, QiblaDirection } from '@mubarak-way/shared';
import { prayerService } from '../lib/services';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface PrayerState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  prayerTimes: PrayerTimes | null;
  location: Location | null;
  qibla: QiblaDirection | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLessons: (category?: string) => Promise<void>;
  loadLesson: (slug: string) => Promise<void>;
  searchLessons: (query: string) => Promise<Lesson[]>;
  clearCurrentLesson: () => void;
  calculatePrayerTimes: (location: Location, params?: Partial<PrayerCalculationParams>) => Promise<void>;
  calculateQibla: (location: Location) => Promise<void>;
  setLocation: (location: Location) => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      lessons: [],
      currentLesson: null,
      prayerTimes: null,
      location: null,
      qibla: null,
      isLoading: false,
      error: null,

      loadLessons: async (category) => {
        set({ isLoading: true, error: null });
        try {
          const lessons = await prayerService.getAllLessons(category);
          set({ lessons, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadLesson: async (slug) => {
        set({ isLoading: true, error: null });
        try {
          const lesson = await prayerService.getLesson(slug);
          set({ currentLesson: lesson, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      searchLessons: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const results = await prayerService.searchLessons(query);
          set({ lessons: results, isLoading: false });
          return results;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearCurrentLesson: () => set({ currentLesson: null }),

      calculatePrayerTimes: async (location, params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const prayerTimes = await prayerService.calculatePrayerTimes(
            location.latitude,
            location.longitude,
            params,
            location.city,
            location.country
          );
          set({ prayerTimes, location, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      calculateQibla: async (location) => {
        try {
          const qibla = await prayerService.calculateQibla(location.latitude, location.longitude);
          set({ qibla });
        } catch (error: any) {
          console.error('Failed to calculate Qibla:', error);
        }
      },

      setLocation: (location) => set({ location }),
    }),
    {
      name: 'prayer-storage',
      partialize: (state) => ({
        location: state.location,
        prayerTimes: state.prayerTimes,
        qibla: state.qibla,
      }),
    }
  )
);
