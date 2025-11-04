/**
 * Types for EnhancedBookReader component
 */

export interface Book {
  _id?: string;
  id: string | number;
  title: string;
  author?: string;
  content: string;
  extractedText?: string;
  description?: string;
  cover?: string;
  category?: string;
  isPro?: boolean;
}

export interface ReaderSettings {
  isDarkTheme: boolean;
  fontSize: number;
  lineHeight: number;
  isPageMode: boolean;
  speechRate: number;
}

export interface Bookmarks {
  [bookId: string]: BookmarkData;
}

export interface BookmarkData {
  page: number;
  progress: number;
  scrollPosition: number;
  timestamp: number;
}

export interface TouchPosition {
  start: number | null;
  end: number | null;
}

export interface PageTransitionState {
  type: '' | 'flip-left' | 'flip-right';
  nextPageContent: string;
  flippingPageContent: string;
  isFlipping: boolean;
}

export interface ReaderState {
  book: Book | null;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  pages: string[];
  readingProgress: number;
  isBookmarked: boolean;
  isGuideMode: boolean;
  showSettings: boolean;
  isPlaying: boolean;
  isOfflineAvailable: boolean;
}
