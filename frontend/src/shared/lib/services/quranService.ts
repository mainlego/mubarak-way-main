import { apiGet } from '../api';
import type { Surah, Ayah, QuranSearchQuery } from '@mubarak-way/shared';

export const quranService = {
  /**
   * Get all surahs
   */
  getAllSurahs: async (): Promise<Surah[]> => {
    return await apiGet<Surah[]>('/quran/surahs');
  },

  /**
   * Get surah by number
   */
  getSurah: async (number: number): Promise<Surah> => {
    return await apiGet<Surah>(`/quran/surahs/${number}`);
  },

  /**
   * Get ayahs by surah number
   */
  getAyahs: async (surahNumber: number, language?: string): Promise<Ayah[]> => {
    return await apiGet<Ayah[]>(`/quran/surahs/${surahNumber}/ayahs`, {
      language,
    });
  },

  /**
   * Get single ayah by surah and ayah number
   */
  getAyah: async (
    surahNumber: number,
    ayahNumber: number,
    language?: string
  ): Promise<Ayah> => {
    return await apiGet<Ayah>(`/quran/ayahs/${surahNumber}/${ayahNumber}`, {
      language,
    });
  },

  /**
   * Get ayah by ObjectId
   */
  getAyahById: async (ayahId: string, language?: string): Promise<Ayah> => {
    return await apiGet<Ayah>(`/quran/ayahs/id/${ayahId}`, {
      language,
    });
  },

  /**
   * Get ayahs by Juz number
   */
  getJuz: async (juzNumber: number): Promise<Ayah[]> => {
    return await apiGet<Ayah[]>(`/quran/juz/${juzNumber}`);
  },

  /**
   * Get ayahs by page number
   */
  getPage: async (pageNumber: number): Promise<Ayah[]> => {
    return await apiGet<Ayah[]>(`/quran/page/${pageNumber}`);
  },

  /**
   * Get Sajda ayahs
   */
  getSajdahAyahs: async (): Promise<Ayah[]> => {
    return await apiGet<Ayah[]>('/quran/sajdah');
  },

  /**
   * Search in Quran
   */
  search: async (query: QuranSearchQuery): Promise<Ayah[]> => {
    return await apiGet<Ayah[]>('/quran/search', {
      q: query.query,
      language: query.language,
      surah: query.surahNumber,
      juz: query.juzNumber,
      page: query.pageNumber,
    });
  },

  /**
   * Get random ayah
   */
  getRandomAyah: async (): Promise<Ayah> => {
    return await apiGet<Ayah>('/quran/random');
  },

  /**
   * Get Quran statistics
   */
  getStats: async (): Promise<any> => {
    return await apiGet('/quran/stats');
  },
};
