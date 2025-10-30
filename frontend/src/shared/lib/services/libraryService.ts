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
   * Get nashids with filters - using our backend API
   */
  getNashids: async (query: LibrarySearchQuery = {}): Promise<LibrarySearchResult<Nashid>> => {
    try {
      // Try to use our backend API first
      const response = await apiGet<Nashid[]>('/library/nashids', {
        q: query.query,
        category: query.category,
        language: query.language,
        accessLevel: query.accessLevel,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page,
        limit: query.limit,
      });

      return {
        items: response,
        total: response.length,
        page: query.page || 1,
        totalPages: Math.ceil(response.length / (query.limit || 20)),
      };
    } catch (error) {
      // Fallback to e-replika if backend fails
      console.warn('Backend nashids API failed, trying e-replika...', error);
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
    }
  },

  /**
   * Get nashid by ID - using our backend API with fallback to E-Replika
   */
  getNashid: async (nashidId: number): Promise<Nashid> => {
    try {
      // Try backend API first
      return await apiGet<Nashid>(`/library/nashids/${nashidId}`);
    } catch (error) {
      // Fallback to e-replika
      console.warn('Backend nashid API failed, trying e-replika...', error);
      const lang = getCurrentLanguage();
      const item = await catalogService.getItem(nashidId.toString(), lang);
      return catalogItemToNashid(item, lang);
    }
  },

  /**
   * Get library statistics
   */
  getStats: async (): Promise<any> => {
    return await apiGet('/library/stats');
  },

  /**
   * Toggle nashid favorite with limit checking
   */
  toggleNashidFavorite: async (telegramId: string, nashidId: number): Promise<any> => {
    return await apiGet('/user/nashids/favorite', {
      method: 'POST',
      body: JSON.stringify({ telegramId, nashidId }),
    });
  },

  /**
   * Toggle nashid offline with limit checking
   */
  toggleNashidOffline: async (telegramId: string, nashidId: number): Promise<any> => {
    return await apiGet('/user/nashids/offline', {
      method: 'POST',
      body: JSON.stringify({ telegramId, nashidId }),
    });
  },

  /**
   * Get user's favorite nashids
   */
  getUserFavoriteNashids: async (telegramId: string): Promise<any> => {
    return await apiGet(`/user/${telegramId}/nashids/favorites`);
  },

  /**
   * Get user's offline nashids
   */
  getUserOfflineNashids: async (telegramId: string): Promise<any> => {
    return await apiGet(`/user/${telegramId}/nashids/offline`);
  },

  /**
   * Get user's usage statistics
   */
  getUserUsage: async (telegramId: string): Promise<any> => {
    return await apiGet(`/user/${telegramId}/usage`);
  },
};
