/**
 * Search History Types
 */

export type SearchType = 'quran' | 'library' | 'prayer' | 'general';
export type SearchSource = 'quran_reader' | 'surah_list' | 'library_page' | 'ai_chat' | 'global_search';

export interface SearchContext {
  surahNumber?: number;
  pageNumber?: number;
  category?: string;
  language?: string;
}

export interface SearchHistory {
  _id: string;
  userId: string;
  query: string;
  type: SearchType;
  source?: SearchSource;

  // Search context
  context?: SearchContext;

  // Results metadata
  resultsCount?: number;
  clicked?: boolean;
  clickedResultId?: string;

  // Organization
  favorite: boolean;
  tags?: string[];

  // Timestamps
  timestamp: Date;
  lastAccessed?: Date;
  accessCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSearchHistoryInput {
  query: string;
  type: SearchType;
  source?: SearchSource;
  context?: SearchContext;
  resultsCount?: number;
}

export interface UpdateSearchHistoryInput {
  favorite?: boolean;
  tags?: string[];
  clicked?: boolean;
  clickedResultId?: string;
}

export interface SearchHistoryStats {
  total: number;
  byType: Record<SearchType, number>;
  bySource: Record<SearchSource, number>;
  favoriteCount: number;
  recentSearches: SearchHistory[];
  topSearches: Array<{
    query: string;
    count: number;
    type: SearchType;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

export interface SearchSuggestion {
  query: string;
  type: SearchType;
  source?: SearchSource;
  count: number;
  lastUsed: Date;
}
