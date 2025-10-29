import { apiGet } from '../api';
import type { Book, Nashid, LibrarySearchQuery, LibrarySearchResult } from '@mubarak-way/shared';
import { catalogService } from './catalogService';
import type { CatalogItem } from '@/shared/types/eReplika';

/**
 * Helper to get current language from localStorage or default to 'ru'
 */
const getCurrentLanguage = (): string => {
  try {
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.language || 'ru';
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return 'ru';
};

/**
 * Convert CatalogItem to Nashid format
 */
const catalogItemToNashid = (item: CatalogItem, lang: string = 'ru'): Nashid => {
  return {
    _id: item.id,
    nashidId: parseInt(item.id, 10) || 0,
    id: parseInt(item.id, 10) || 0,
    title: item.title[lang] || item.title.ru || item.title.en || Object.values(item.title)[0] || 'Unknown',
    titleArabic: item.title.ar,
    artist: item.author || 'Unknown Artist',
    duration: item.duration || 0,
    audioUrl: item.audio_url || '',
    cover: item.cover_url,
    coverUrl: item.cover_url,
    coverImage: item.cover_url,
    category: 'nasheed' as const,
    language: lang,
    accessLevel: item.is_premium ? 'premium' as const : 'free' as const,
    isExclusive: item.is_premium || false,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.created_at),
  };
};

export const libraryService = {
  /**
   * Get books with filters
   */
  getBooks: async (query: LibrarySearchQuery = {}): Promise<LibrarySearchResult<Book>> => {
    const response = await apiGet<Book[]>('/library/books', {
      q: query.query,
      category: query.category,
      genre: query.genre,
      language: query.language,
      accessLevel: query.accessLevel,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    // Note: Backend returns data + meta separately, adjust if needed
    return {
      items: response,
      total: 0,
      page: query.page || 1,
      totalPages: 0,
    } as any;
  },

  /**
   * Get book by ID
   */
  getBook: async (bookId: number): Promise<Book> => {
    return await apiGet<Book>(`/library/books/${bookId}`);
  },

  /**
   * Get featured books
   */
  getFeaturedBooks: async (limit = 10): Promise<Book[]> => {
    return await apiGet<Book[]>('/library/books/featured', { limit });
  },

  /**
   * Get nashids with filters - now using E-Replika catalogService
   */
  getNashids: async (query: LibrarySearchQuery = {}): Promise<LibrarySearchResult<Nashid>> => {
    const lang = query.language || getCurrentLanguage();

    const response = await catalogService.getNasheeds({
      q: query.query,
      limit: query.limit || 20,
      offset: ((query.page || 1) - 1) * (query.limit || 20),
    });

    const nashids = response.items.map(item => catalogItemToNashid(item, lang));

    return {
      items: nashids,
      total: response.total,
      page: query.page || 1,
      totalPages: Math.ceil(response.total / (query.limit || 20)),
    };
  },

  /**
   * Get nashid by ID - now using E-Replika catalogService
   */
  getNashid: async (nashidId: number): Promise<Nashid> => {
    const lang = getCurrentLanguage();
    const item = await catalogService.getItem(nashidId.toString(), lang);
    return catalogItemToNashid(item, lang);
  },

  /**
   * Get library statistics
   */
  getStats: async (): Promise<any> => {
    return await apiGet('/library/stats');
  },
};
