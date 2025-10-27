/**
 * AI Assistant Types
 */

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
  timestamp: Date;
}

export interface AIExplainVerseRequest {
  surahNumber: number;
  ayahNumber: number;
  language?: string;
  detailLevel?: 'brief' | 'medium' | 'detailed';
}

export interface AIQuestionRequest {
  question: string;
  language?: string;
  context?: {
    surahNumber?: number;
    ayahNumber?: number;
  };
}

export interface AIResponse {
  answer: string;
  sources?: Array<{
    type: 'quran' | 'hadith' | 'tafsir';
    reference: string;
    text: string;
  }>;
  relatedVerses?: Array<{
    surahNumber: number;
    ayahNumber: number;
    text: string;
  }>;
}

export interface AIConversation {
  _id: string;
  userId: string;
  messages: AIMessage[];
  topic?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}
