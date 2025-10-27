import axios from 'axios';
import { config } from '../config/env.js';

// Полные версии Корана для всех языков (номера изданий)
const COMPLETE_EDITIONS: Record<string, number> = {
  ar: 4, // Arabic original
  ru: 79, // Russian - Kuliev
  en: 131, // English - Pickthall
  tr: 77, // Turkish - Diyanet
  uz: 138, // Uzbek
  kk: 113, // Kazakh
  fa: 35, // Persian (Farsi)
};

export interface ElasticsearchResult {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  score?: number;
}

/**
 * Кэш для поисковых запросов
 */
class SearchCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const searchCache = new SearchCache(5 * 60 * 1000); // 5 минут

/**
 * Elasticsearch Proxy Service
 * Проксирует запросы к внешнему API Elasticsearch
 */
class ElasticsearchProxyService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.elasticsearchApiUrl || 'https://bot.e-replika.ru/api/v1/elasticsearch';
    this.apiToken = config.elasticsearchApiToken || 'test_token_123';
  }

  /**
   * Поиск аятов по тексту
   */
  async search(
    query: string,
    language: string = 'ru',
    limit: number = 10
  ): Promise<ElasticsearchResult[]> {
    try {
      // Проверяем кэш
      const cacheKey = `${query}:${language}:${limit}`;
      const cached = searchCache.get(cacheKey);
      if (cached) {
        console.log('Returning cached search results');
        return cached;
      }

      const editionNumber = COMPLETE_EDITIONS[language] || COMPLETE_EDITIONS.ru;

      console.log(`Searching Elasticsearch: query="${query}", language="${language}", edition=${editionNumber}`);

      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query,
          edition: editionNumber,
          size: limit,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      if (!response.data || !response.data.hits) {
        console.warn('Invalid Elasticsearch response format');
        return [];
      }

      const results: ElasticsearchResult[] = response.data.hits.map((hit: any) => ({
        surahNumber: hit.surah_number || hit.surahNumber,
        ayahNumber: hit.ayah_number || hit.ayahNumber,
        arabicText: hit.arabic_text || hit.text || '',
        translation: hit.translation || hit.text || '',
        score: hit.score || 0,
      }));

      // Кэшируем результаты
      searchCache.set(cacheKey, results);

      console.log(`Found ${results.length} results from Elasticsearch`);
      return results;
    } catch (error: any) {
      console.error('Elasticsearch search error:', error.message);

      // Если Elasticsearch недоступен, возвращаем пустой массив
      // Основной код будет использовать fallback на MongoDB
      return [];
    }
  }

  /**
   * Получить все аяты суры (до 286 аятов)
   */
  async getSurahAyahs(
    surahNumber: number,
    language: string = 'ru'
  ): Promise<ElasticsearchResult[]> {
    try {
      const cacheKey = `surah:${surahNumber}:${language}`;
      const cached = searchCache.get(cacheKey);
      if (cached) {
        console.log('Returning cached surah ayahs');
        return cached;
      }

      const editionNumber = COMPLETE_EDITIONS[language] || COMPLETE_EDITIONS.ru;

      console.log(`Fetching surah ${surahNumber} in language ${language}, edition ${editionNumber}`);

      const response = await axios.post(
        `${this.baseUrl}/surah`,
        {
          surahNumber,
          edition: editionNumber,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 15000, // 15 seconds for larger requests
        }
      );

      if (!response.data || !response.data.ayahs) {
        console.warn('Invalid Elasticsearch surah response format');
        return [];
      }

      const results: ElasticsearchResult[] = response.data.ayahs.map((ayah: any) => ({
        surahNumber: ayah.surah_number || ayah.surahNumber || surahNumber,
        ayahNumber: ayah.ayah_number || ayah.ayahNumber,
        arabicText: ayah.arabic_text || ayah.text || '',
        translation: ayah.translation || ayah.text || '',
        score: 1.0,
      }));

      searchCache.set(cacheKey, results);

      console.log(`Fetched ${results.length} ayahs for surah ${surahNumber}`);
      return results;
    } catch (error: any) {
      console.error('Elasticsearch surah fetch error:', error.message);
      return [];
    }
  }

  /**
   * Очистить кэш
   */
  clearCache(): void {
    searchCache.clear();
    console.log('Elasticsearch cache cleared');
  }

  /**
   * Проверить доступность Elasticsearch API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Elasticsearch health check failed:', error);
      return false;
    }
  }
}

export const elasticsearchService = new ElasticsearchProxyService();
