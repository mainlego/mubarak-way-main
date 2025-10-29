/**
 * Elasticsearch API Service
 * All requests go through our backend for security (hide token)
 */

import axios, { AxiosInstance } from 'axios';
import { getApiUrl } from './apiConfig';

/**
 * Create axios instance for requests to our backend
 */
function createApiRequest(): AxiosInstance {
  return axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
  });
}

// Types
export interface ElasticsearchVerse {
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_arabic: string;
  text: string;
  translations: Translation[];
}

export interface Translation {
  id: string;
  text: string;
  name: string;
  language_name: string;
  resource_name: string;
}

export interface SearchResult {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  text: string;
  translation: string;
  surah_name: string;
  highlighted: string;
  snippet: string;
  score: number;
}

export interface SemanticSearchResult {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  text: string;
  score: number;
  metadata: any;
}

export interface TafsirResult {
  text: string;
  resource_name: string;
  resource_id: string;
  language_name: string;
}

export interface HadithResult {
  hadith_number: string;
  text: string;
  arabic_text: string;
  book_name: string;
  chapter: string;
  narrator: string;
  grades: string[];
  highlighted?: string;
  score: number;
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface ElasticsearchStats {
  indices: Array<{
    name: string;
    docs_count: string;
    store_size: string;
    health: string;
  }>;
  cache: {
    keys: number;
    stats: any;
  };
}

/**
 * Get all verses of a specific surah via Elasticsearch
 * @param surahNumber - surah number (1-114)
 * @param language - translation language (ru, en, ar, etc.)
 * @param translationId - translation ID or 'auto'
 * @returns array of verses
 */
export async function getVersesBySurah(
  surahNumber: number,
  language: string = 'ru',
  translationId: string = 'auto'
): Promise<ElasticsearchVerse[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/verses', {
      surahNumber,
      language,
      translationId
    });

    if (response.data.success) {
      return response.data.verses;
    }

    throw new Error(response.data.error || 'Failed to fetch verses');
  } catch (error) {
    console.error('Error fetching verses from Elasticsearch:', error);
    throw error;
  }
}

/**
 * Search in Quran (text search)
 * @param query - search query
 * @param language - search language
 * @param size - number of results
 * @returns search results
 */
export async function searchQuran(
  query: string,
  language: string = 'ru',
  size: number = 20
): Promise<SearchResult[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/search', {
      query,
      language,
      size
    });

    if (response.data.success) {
      return response.data.results;
    }

    throw new Error(response.data.error || 'Search failed');
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

/**
 * Semantic search in Quran (vector search)
 * Searches by meaning, not exact words
 * @param query - natural language search query
 * @param language - query language
 * @param size - number of results
 * @returns search results with relevance score
 */
export async function semanticSearchQuran(
  query: string,
  language: string = 'ru',
  size: number = 10
): Promise<SemanticSearchResult[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/semantic-search', {
      query,
      language,
      size
    });

    if (response.data.success) {
      return response.data.results;
    }

    throw new Error(response.data.error || 'Semantic search failed');
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

/**
 * Get tafsir for specific ayah
 * @param surahNumber - surah number
 * @param ayahNumber - ayah number
 * @param language - tafsir language
 * @param tafsirId - tafsir ID or 'auto'
 * @returns tafsir
 */
export async function getTafsirByAyah(
  surahNumber: number,
  ayahNumber: number,
  language: string = 'ru',
  tafsirId: string = 'auto'
): Promise<TafsirResult> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/tafsir', {
      surahNumber,
      ayahNumber,
      language,
      tafsirId
    });

    if (response.data.success) {
      return response.data.tafsir;
    }

    throw new Error(response.data.error || 'Failed to fetch tafsir');
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    throw error;
  }
}

/**
 * Semantic search in tafsir
 * @param query - search query
 * @param language - language
 * @param size - number of results
 * @returns search results
 */
export async function semanticSearchTafsir(
  query: string,
  language: string = 'ru',
  size: number = 10
): Promise<any[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/tafsir-search', {
      query,
      language,
      size
    });

    if (response.data.success) {
      return response.data.results;
    }

    throw new Error(response.data.error || 'Tafsir search failed');
  } catch (error) {
    console.error('Error searching tafsir:', error);
    throw error;
  }
}

/**
 * Search hadiths (text search)
 * @param query - search query
 * @param book - hadith book name (optional)
 * @param size - number of results
 * @returns found hadiths
 */
export async function searchHadiths(
  query: string,
  book: string | null = null,
  size: number = 20
): Promise<HadithResult[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/hadiths-search', {
      query,
      book,
      size
    });

    if (response.data.success) {
      return response.data.results;
    }

    throw new Error(response.data.error || 'Hadith search failed');
  } catch (error) {
    console.error('Error searching hadiths:', error);
    throw error;
  }
}

/**
 * Semantic search in hadiths
 * @param query - search query
 * @param size - number of results
 * @returns found hadiths with relevance score
 */
export async function semanticSearchHadiths(
  query: string,
  size: number = 10
): Promise<any[]> {
  try {
    const api = createApiRequest();
    const response = await api.post('/api/elasticsearch/hadiths-semantic-search', {
      query,
      size
    });

    if (response.data.success) {
      return response.data.results;
    }

    throw new Error(response.data.error || 'Hadith semantic search failed');
  } catch (error) {
    console.error('Error in hadith semantic search:', error);
    throw error;
  }
}

/**
 * Get 99 names of Allah
 * @returns array of names
 */
export async function getAllahNames(): Promise<AllahName[]> {
  try {
    const api = createApiRequest();
    const response = await api.get('/api/elasticsearch/allah-names');

    if (response.data.success) {
      return response.data.names;
    }

    throw new Error(response.data.error || 'Failed to fetch Allah names');
  } catch (error) {
    console.error('Error fetching Allah names:', error);
    throw error;
  }
}

/**
 * Get Elasticsearch index statistics
 * (for administration)
 * @returns statistics
 */
export async function getElasticsearchStats(): Promise<ElasticsearchStats> {
  try {
    const api = createApiRequest();
    const response = await api.get('/api/elasticsearch/stats');

    if (response.data.success) {
      return response.data.stats;
    }

    throw new Error(response.data.error || 'Failed to fetch stats');
  } catch (error) {
    console.error('Error fetching Elasticsearch stats:', error);
    throw error;
  }
}

export default {
  getVersesBySurah,
  searchQuran,
  semanticSearchQuran,
  getTafsirByAyah,
  semanticSearchTafsir,
  searchHadiths,
  semanticSearchHadiths,
  getAllahNames,
  getElasticsearchStats
};
