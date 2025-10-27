import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import type {
  SearchHistory,
  CreateSearchHistoryInput,
  UpdateSearchHistoryInput,
  SearchHistoryStats,
  SearchSuggestion,
  SearchType,
  SearchSource,
} from '@mubarak-way/shared';

export const searchHistoryService = {
  /**
   * Create or update search history entry
   */
  createSearch: async (input: CreateSearchHistoryInput): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>('/search-history', input);
  },

  /**
   * Get user's search history with optional filters
   */
  getSearchHistory: async (filters?: {
    type?: SearchType;
    source?: SearchSource;
    favorite?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<SearchHistory[]> => {
    const params: Record<string, string> = {};

    if (filters?.type) params.type = filters.type;
    if (filters?.source) params.source = filters.source;
    if (filters?.favorite !== undefined) params.favorite = String(filters.favorite);
    if (filters?.limit) params.limit = String(filters.limit);
    if (filters?.skip) params.skip = String(filters.skip);

    return await apiGet<SearchHistory[]>('/search-history', params);
  },

  /**
   * Get search suggestions based on query
   */
  getSuggestions: async (
    query: string,
    type?: SearchType,
    limit?: number
  ): Promise<SearchSuggestion[]> => {
    const params: Record<string, string> = { query };

    if (type) params.type = type;
    if (limit) params.limit = String(limit);

    return await apiGet<SearchSuggestion[]>('/search-history/suggestions', params);
  },

  /**
   * Get search history statistics
   */
  getStats: async (): Promise<SearchHistoryStats> => {
    return await apiGet<SearchHistoryStats>('/search-history/stats');
  },

  /**
   * Get single search history entry
   */
  getSearch: async (id: string): Promise<SearchHistory> => {
    return await apiGet<SearchHistory>(`/search-history/${id}`);
  },

  /**
   * Update search history entry
   */
  updateSearch: async (
    id: string,
    update: UpdateSearchHistoryInput
  ): Promise<SearchHistory> => {
    return await apiPut<SearchHistory>(`/search-history/${id}`, update);
  },

  /**
   * Delete search history entry
   */
  deleteSearch: async (id: string): Promise<{ deleted: boolean }> => {
    return await apiDelete<{ deleted: boolean }>(`/search-history/${id}`);
  },

  /**
   * Clear all search history (except favorites by default)
   */
  clearHistory: async (options?: {
    type?: SearchType;
    keepFavorites?: boolean;
  }): Promise<{ deletedCount: number }> => {
    const params: Record<string, string> = {};

    if (options?.type) params.type = options.type;
    if (options?.keepFavorites !== undefined) {
      params.keepFavorites = String(options.keepFavorites);
    }

    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/search-history?${queryString}` : '/search-history';

    return await apiDelete<{ deletedCount: number }>(url);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id: string): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>(`/search-history/${id}/favorite`);
  },

  /**
   * Add tag to search history
   */
  addTag: async (id: string, tag: string): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>(`/search-history/${id}/tags`, { tag });
  },

  /**
   * Remove tag from search history
   */
  removeTag: async (id: string, tag: string): Promise<SearchHistory> => {
    return await apiDelete<SearchHistory>(
      `/search-history/${id}/tags/${encodeURIComponent(tag)}`
    );
  },

  /**
   * Record search result click
   */
  recordClick: async (id: string, resultId: string): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>(`/search-history/${id}/click`, { resultId });
  },

  /**
   * Quick search tracking for Quran
   */
  trackQuranSearch: async (
    query: string,
    source: SearchSource = 'quran_reader',
    context?: {
      surahNumber?: number;
      pageNumber?: number;
    },
    resultsCount?: number
  ): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>('/search-history', {
      query,
      type: 'quran' as SearchType,
      source,
      context,
      resultsCount,
    });
  },

  /**
   * Quick search tracking for Library
   */
  trackLibrarySearch: async (
    query: string,
    source: SearchSource = 'library_page',
    context?: {
      category?: string;
    },
    resultsCount?: number
  ): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>('/search-history', {
      query,
      type: 'library' as SearchType,
      source,
      context,
      resultsCount,
    });
  },

  /**
   * Quick search tracking for Prayer
   */
  trackPrayerSearch: async (
    query: string,
    resultsCount?: number
  ): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>('/search-history', {
      query,
      type: 'prayer' as SearchType,
      resultsCount,
    });
  },

  /**
   * Quick search tracking for general search
   */
  trackGeneralSearch: async (
    query: string,
    source: SearchSource = 'global_search',
    resultsCount?: number
  ): Promise<SearchHistory> => {
    return await apiPost<SearchHistory>('/search-history', {
      query,
      type: 'general' as SearchType,
      source,
      resultsCount,
    });
  },
};
