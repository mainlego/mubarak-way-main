/**
 * API Types (Requests & Responses)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Authentication
export interface LoginRequest {
  initData: string;  // Telegram initData
}

export interface LoginResponse {
  user: any;  // User type
  token?: string;  // JWT token (for admin)
}

// AI Requests
export interface AIAskRequest {
  question: string;
  context?: {
    surahNumber?: number;
    ayahNumber?: number;
    lessonId?: string;
  };
  language?: string;
}

// AIExplainVerseRequest moved to ai.ts

export interface AIRecommendBookRequest {
  interests?: string[];
  readBooks?: number[];
  language?: string;
}

export interface AISearchRequest {
  query: string;
  type: 'quran' | 'library' | 'prayer' | 'all';
  language?: string;
}

// Bookmarks & Favorites
export interface BookmarkRequest {
  type: 'ayah' | 'surah' | 'book' | 'nashid' | 'lesson' | 'ai-response';
  itemId: string | number;
  note?: string;
}

export interface ProgressUpdateRequest {
  type: 'reading' | 'learning' | 'practice';
  itemId: string | number;
  progress: {
    currentPage?: number;
    completedSteps?: number;
    mistakes?: number;
  };
}
