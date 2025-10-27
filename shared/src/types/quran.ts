/**
 * Quran Module Types
 */

export type RevelationType = 'meccan' | 'medinan';

export interface Surah {
  _id: string;
  number: number;
  name: string;
  nameArabic: string;
  nameTransliteration: string;
  ayahCount: number;
  revelation: RevelationType;
  revelationOrder: number;
  bismillahPre?: boolean;

  // Aliases for backwards compatibility
  nameTranslation?: string; // Same as nameTransliteration
  numberOfAyahs?: number; // Same as ayahCount
  revelationType?: RevelationType; // Same as revelation
}

export interface Translation {
  language: string;
  text: string;
  translator?: string;
  translatorId?: number;
}

export interface Tafsir {
  language: string;
  text: string;
  author?: string;
  authorId?: number;
}

export interface Ayah {
  _id: string;
  surahNumber: number;
  ayahNumber: number;
  globalNumber: number;
  textArabic: string;
  textSimple: string;  // Simplified Arabic (no diacritics)
  translations: Translation[];
  tafsirs?: Tafsir[];
  juzNumber: number;
  hizbNumber: number;
  pageNumber: number;
  sajdah?: {
    required: boolean;
    type: 'recommended' | 'obligatory';
  };

  // Aliases for backwards compatibility
  numberInSurah?: number; // Same as ayahNumber
  translation?: string; // translations[0]?.text
  transliteration?: string; // For future use
  audio?: string; // For future use
}

export interface QuranSearchQuery {
  query: string;
  language?: string;
  surahNumber?: number;
  juzNumber?: number;
  pageNumber?: number;
}

export interface QuranSearchResult {
  ayah: Ayah;
  surah: Surah;
  matchedText: string;
  relevanceScore: number;
}

export interface SavedAIResponse {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  context?: {
    surahNumber?: number;
    ayahNumber?: number;
  };
  relatedAyahs?: Array<{
    surahNumber: number;
    ayahNumber: number;
    text: string;
  }>;
  bookmarked: boolean;
  createdAt: Date;
}

export interface Conversation {
  _id: string;
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  metadata?: {
    topic?: string;
    language?: string;
  };
  status: 'active' | 'closed';
  lastActivity: Date;
  createdAt: Date;
}
