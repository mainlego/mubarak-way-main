import { create } from 'zustand';
import type { Surah, Ayah } from '@mubarak-way/shared';
import { quranService } from '../lib/services';

interface QuranState {
  surahs: Surah[];
  currentSurah: Surah | null;
  currentAyahs: Ayah[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSurahs: () => Promise<void>;
  loadSurah: (number: number) => Promise<void>;
  loadAyahs: (surahNumber: number, language?: string) => Promise<void>;
  searchQuran: (query: string, language?: string) => Promise<Ayah[]>;
  getRandomAyah: () => Promise<Ayah>;
}

export const useQuranStore = create<QuranState>((set) => ({
  surahs: [],
  currentSurah: null,
  currentAyahs: [],
  isLoading: false,
  error: null,

  loadSurahs: async () => {
    set({ isLoading: true, error: null });
    try {
      const surahs = await quranService.getAllSurahs();
      set({ surahs, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadSurah: async (number) => {
    set({ isLoading: true, error: null });
    try {
      const surah = await quranService.getSurah(number);
      set({ currentSurah: surah, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadAyahs: async (surahNumber, language) => {
    set({ isLoading: true, error: null });
    try {
      const ayahs = await quranService.getAyahs(surahNumber, language);
      set({ currentAyahs: ayahs, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  searchQuran: async (query, language) => {
    set({ isLoading: true, error: null });
    try {
      const results = await quranService.search({ query, language });
      set({ isLoading: false });
      return results;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getRandomAyah: async () => {
    set({ isLoading: true, error: null });
    try {
      const ayah = await quranService.getRandomAyah();
      set({ isLoading: false });
      return ayah;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
