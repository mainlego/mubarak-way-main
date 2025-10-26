import { apiPost } from '../api';
import type {
  AIAskRequest,
  AIExplainVerseRequest,
  AIRecommendBookRequest,
  AISearchRequest,
} from '@mubarak-way/shared';

export const aiService = {
  /**
   * Ask general question about Quran/Islam
   */
  ask: async (request: AIAskRequest): Promise<{ question: string; answer: string }> => {
    return await apiPost('/ai/ask', request);
  },

  /**
   * Explain a specific verse
   */
  explainVerse: async (
    request: AIExplainVerseRequest
  ): Promise<{ surahNumber: number; ayahNumber: number; explanation: string }> => {
    return await apiPost('/ai/explain-verse', request);
  },

  /**
   * Get book recommendations
   */
  recommendBooks: async (
    request: AIRecommendBookRequest
  ): Promise<{ recommendations: string }> => {
    return await apiPost('/ai/recommend-books', request);
  },

  /**
   * Smart search across all content
   */
  search: async (request: AISearchRequest): Promise<{ query: string; results: string }> => {
    return await apiPost('/ai/search', request);
  },
};
