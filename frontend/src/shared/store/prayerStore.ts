import { create } from 'zustand';
import type { Lesson } from '@mubarak-way/shared';
import { prayerService } from '../lib/services';

interface PrayerState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLessons: (category?: string) => Promise<void>;
  loadLesson: (slug: string) => Promise<void>;
  searchLessons: (query: string) => Promise<Lesson[]>;
  clearCurrentLesson: () => void;
}

export const usePrayerStore = create<PrayerState>((set) => ({
  lessons: [],
  currentLesson: null,
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
      set({ isLoading: false });
      return results;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCurrentLesson: () => set({ currentLesson: null }),
}));
