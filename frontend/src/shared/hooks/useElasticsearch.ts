/**
 * useElasticsearch Hook
 *
 * React hook for searching Quran, Tafsir, and Hadiths using Elasticsearch
 */

import { useState, useCallback } from 'react';
import {
  searchQuran,
  semanticSearchQuran,
  getTafsirByAyah,
  semanticSearchTafsir,
  searchHadiths,
  semanticSearchHadiths,
  getAllahNames,
  getVersesBySurah,
  type SearchResult,
  type SemanticSearchResult,
  type TafsirResult,
  type HadithResult,
  type AllahName,
  type ElasticsearchVerse,
} from '../lib/elasticsearchApi';

interface UseElasticsearchReturn {
  // Quran search
  searchResults: SearchResult[];
  semanticResults: SemanticSearchResult[];
  verses: ElasticsearchVerse[];

  // Tafsir
  tafsir: TafsirResult | null;
  tafsirResults: any[];

  // Hadiths
  hadithResults: HadithResult[];

  // Allah names
  allahNames: AllahName[];

  // Loading states
  isSearching: boolean;
  isFetchingTafsir: boolean;
  isFetchingHadiths: boolean;
  isFetchingNames: boolean;
  isFetchingVerses: boolean;

  // Error states
  searchError: string | null;
  tafsirError: string | null;
  hadithError: string | null;
  namesError: string | null;
  versesError: string | null;

  // Actions
  performSearch: (query: string, language?: string, size?: number) => Promise<void>;
  performSemanticSearch: (query: string, language?: string, size?: number) => Promise<void>;
  fetchVerses: (surahNumber: number, language?: string) => Promise<void>;
  fetchTafsir: (surahNumber: number, ayahNumber: number, language?: string, tafsirId?: string) => Promise<void>;
  performTafsirSearch: (query: string, language?: string, size?: number) => Promise<void>;
  performHadithSearch: (query: string, book?: string | null, size?: number) => Promise<void>;
  performSemanticHadithSearch: (query: string, size?: number) => Promise<void>;
  fetchAllahNames: () => Promise<void>;

  // Clear functions
  clearSearch: () => void;
  clearTafsir: () => void;
  clearHadiths: () => void;
  clearNames: () => void;
  clearVerses: () => void;
  clearAll: () => void;
}

export const useElasticsearch = (): UseElasticsearchReturn => {
  // Quran search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [verses, setVerses] = useState<ElasticsearchVerse[]>([]);

  // Tafsir state
  const [tafsir, setTafsir] = useState<TafsirResult | null>(null);
  const [tafsirResults, setTafsirResults] = useState<any[]>([]);

  // Hadith state
  const [hadithResults, setHadithResults] = useState<HadithResult[]>([]);

  // Allah names state
  const [allahNames, setAllahNames] = useState<AllahName[]>([]);

  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingTafsir, setIsFetchingTafsir] = useState(false);
  const [isFetchingHadiths, setIsFetchingHadiths] = useState(false);
  const [isFetchingNames, setIsFetchingNames] = useState(false);
  const [isFetchingVerses, setIsFetchingVerses] = useState(false);

  // Error states
  const [searchError, setSearchError] = useState<string | null>(null);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const [hadithError, setHadithError] = useState<string | null>(null);
  const [namesError, setNamesError] = useState<string | null>(null);
  const [versesError, setVersesError] = useState<string | null>(null);

  /**
   * Perform text search in Quran
   */
  const performSearch = useCallback(async (
    query: string,
    language: string = 'ru',
    size: number = 20
  ) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchQuran(query, language, size);
      setSearchResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Perform semantic (vector) search in Quran
   */
  const performSemanticSearch = useCallback(async (
    query: string,
    language: string = 'ru',
    size: number = 10
  ) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await semanticSearchQuran(query, language, size);
      setSemanticResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Semantic search failed';
      setSearchError(message);
      console.error('Semantic search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Fetch all verses of a surah
   */
  const fetchVerses = useCallback(async (
    surahNumber: number,
    language: string = 'ru'
  ) => {
    setIsFetchingVerses(true);
    setVersesError(null);

    try {
      const results = await getVersesBySurah(surahNumber, language);
      setVerses(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch verses';
      setVersesError(message);
      console.error('Fetch verses error:', error);
    } finally {
      setIsFetchingVerses(false);
    }
  }, []);

  /**
   * Fetch tafsir for specific ayah
   */
  const fetchTafsir = useCallback(async (
    surahNumber: number,
    ayahNumber: number,
    language: string = 'ru',
    tafsirId: string = 'auto'
  ) => {
    setIsFetchingTafsir(true);
    setTafsirError(null);

    try {
      const result = await getTafsirByAyah(surahNumber, ayahNumber, language, tafsirId);
      setTafsir(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tafsir';
      setTafsirError(message);
      console.error('Fetch tafsir error:', error);
    } finally {
      setIsFetchingTafsir(false);
    }
  }, []);

  /**
   * Search in tafsir
   */
  const performTafsirSearch = useCallback(async (
    query: string,
    language: string = 'ru',
    size: number = 10
  ) => {
    setIsFetchingTafsir(true);
    setTafsirError(null);

    try {
      const results = await semanticSearchTafsir(query, language, size);
      setTafsirResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tafsir search failed';
      setTafsirError(message);
      console.error('Tafsir search error:', error);
    } finally {
      setIsFetchingTafsir(false);
    }
  }, []);

  /**
   * Search hadiths
   */
  const performHadithSearch = useCallback(async (
    query: string,
    book: string | null = null,
    size: number = 20
  ) => {
    setIsFetchingHadiths(true);
    setHadithError(null);

    try {
      const results = await searchHadiths(query, book, size);
      setHadithResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hadith search failed';
      setHadithError(message);
      console.error('Hadith search error:', error);
    } finally {
      setIsFetchingHadiths(false);
    }
  }, []);

  /**
   * Semantic search in hadiths
   */
  const performSemanticHadithSearch = useCallback(async (
    query: string,
    size: number = 10
  ) => {
    setIsFetchingHadiths(true);
    setHadithError(null);

    try {
      const results = await semanticSearchHadiths(query, size);
      setHadithResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Semantic hadith search failed';
      setHadithError(message);
      console.error('Semantic hadith search error:', error);
    } finally {
      setIsFetchingHadiths(false);
    }
  }, []);

  /**
   * Fetch 99 names of Allah
   */
  const fetchAllahNames = useCallback(async () => {
    setIsFetchingNames(true);
    setNamesError(null);

    try {
      const results = await getAllahNames();
      setAllahNames(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch Allah names';
      setNamesError(message);
      console.error('Fetch Allah names error:', error);
    } finally {
      setIsFetchingNames(false);
    }
  }, []);

  // Clear functions
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSemanticResults([]);
    setSearchError(null);
  }, []);

  const clearTafsir = useCallback(() => {
    setTafsir(null);
    setTafsirResults([]);
    setTafsirError(null);
  }, []);

  const clearHadiths = useCallback(() => {
    setHadithResults([]);
    setHadithError(null);
  }, []);

  const clearNames = useCallback(() => {
    setAllahNames([]);
    setNamesError(null);
  }, []);

  const clearVerses = useCallback(() => {
    setVerses([]);
    setVersesError(null);
  }, []);

  const clearAll = useCallback(() => {
    clearSearch();
    clearTafsir();
    clearHadiths();
    clearNames();
    clearVerses();
  }, [clearSearch, clearTafsir, clearHadiths, clearNames, clearVerses]);

  return {
    // Data
    searchResults,
    semanticResults,
    verses,
    tafsir,
    tafsirResults,
    hadithResults,
    allahNames,

    // Loading states
    isSearching,
    isFetchingTafsir,
    isFetchingHadiths,
    isFetchingNames,
    isFetchingVerses,

    // Error states
    searchError,
    tafsirError,
    hadithError,
    namesError,
    versesError,

    // Actions
    performSearch,
    performSemanticSearch,
    fetchVerses,
    fetchTafsir,
    performTafsirSearch,
    performHadithSearch,
    performSemanticHadithSearch,
    fetchAllahNames,

    // Clear functions
    clearSearch,
    clearTafsir,
    clearHadiths,
    clearNames,
    clearVerses,
    clearAll,
  };
};

export default useElasticsearch;
