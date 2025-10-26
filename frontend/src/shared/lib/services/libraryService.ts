import { apiGet } from '../api';
import type { Book, Nashid, LibrarySearchQuery, LibrarySearchResult } from '@mubarak-way/shared';

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
   * Get nashids with filters
   */
  getNashids: async (query: LibrarySearchQuery = {}): Promise<LibrarySearchResult<Nashid>> => {
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
      total: 0,
      page: query.page || 1,
      totalPages: 0,
    } as any;
  },

  /**
   * Get nashid by ID
   */
  getNashid: async (nashidId: number): Promise<Nashid> => {
    return await apiGet<Nashid>(`/library/nashids/${nashidId}`);
  },

  /**
   * Get library statistics
   */
  getStats: async (): Promise<any> => {
    return await apiGet('/library/stats');
  },
};
