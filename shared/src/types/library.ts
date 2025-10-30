/**
 * Library Module Types (Books & Nashids)
 */

export type BookCategory = 'religious' | 'education' | 'spiritual' | 'history' | 'biography';

export type BookGenre =
  | 'quran'
  | 'hadith'
  | 'prophets'
  | 'aqidah'
  | 'tafsir'
  | 'fiqh'
  | 'seerah'
  | 'dua'
  | 'islamic-history'
  | 'general';

export type AccessLevel = 'free' | 'pro' | 'premium';

export interface Book {
  _id: string;
  bookId: number;
  title: string;
  titleArabic?: string;
  author: string;
  authorArabic?: string;
  description: string;
  cover: string;
  content: string;  // HTML content
  extractedText?: string;
  textExtracted: boolean;

  isPro: boolean;
  isExclusive: boolean;
  accessLevel: AccessLevel;

  category: BookCategory;
  genre: BookGenre;
  language: string;

  pageCount?: number;
  publishedDate?: Date;
  isNew: boolean;

  rating?: {
    average: number;
    count: number;
  };

  reactions?: {
    likes: number;
    views: number;
  };

  createdAt: Date;
  updatedAt: Date;

  // Aliases for backwards compatibility
  id?: number; // Same as bookId
  coverUrl?: string; // Same as cover
  pages?: number; // Same as pageCount
  isPremium?: boolean; // isPro || accessLevel === 'premium'
  pdfUrl?: string; // Same as content (for PDF books)
}

export type NashidCategory =
  | 'nasheed'
  | 'anasheed'
  | 'religious'
  | 'quran-recitation'
  | 'dua'
  | 'general'
  | 'spiritual'    // Духовные
  | 'family'       // Семейные
  | 'gratitude'    // Благодарность
  | 'prophetic'    // О Пророке ﷺ
  | 'tawhid';      // Единобожие

export interface Nashid {
  _id: string;
  nashidId: number;
  title: string;
  titleTransliteration?: string;
  titleArabic?: string;

  artist: string;
  artistArabic?: string;

  duration: number;  // in seconds
  cover?: string;
  coverImage?: string;
  audioUrl: string;

  category: NashidCategory;
  language: string;
  releaseYear?: number;

  accessLevel: AccessLevel;
  isExclusive: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Aliases for backwards compatibility
  id?: number; // Same as nashidId
  coverUrl?: string; // Same as cover or coverImage
}

export interface LibrarySearchQuery {
  query?: string;
  category?: BookCategory | NashidCategory;
  genre?: BookGenre;
  language?: string;
  accessLevel?: AccessLevel;
  sortBy?: 'title' | 'author' | 'publishedDate' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LibrarySearchResult<T = Book | Nashid> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
