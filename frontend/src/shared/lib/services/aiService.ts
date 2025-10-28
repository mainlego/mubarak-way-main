import { apiPost } from '../api';
import type {
  AIAskRequest,
  AIExplainVerseRequest,
  AIRecommendBookRequest,
  AISearchRequest,
  AIResponse,
} from '@mubarak-way/shared';

export const aiService = {
  /**
   * Ask general question about Quran/Islam
   */
  ask: async (request: AIAskRequest): Promise<{ question: string; answer: AIResponse }> => {
    console.log('🤖 AI Service: Sending request to /ai/ask', request);

    try {
      const response = await apiPost<{ question: string; answer: AIResponse }>('/ai/ask', request);
      console.log('✅ AI Service: Response received from /ai/ask', response);
      return response;
    } catch (error: any) {
      console.error('❌ AI Service: Error from /ai/ask', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Explain a specific verse
   */
  explainVerse: async (
    request: AIExplainVerseRequest
  ): Promise<{ surahNumber: number; ayahNumber: number; explanation: AIResponse }> => {
    console.log('🤖 AI Service: Sending request to /ai/explain-verse', request);

    try {
      const response = await apiPost<{
        surahNumber: number;
        ayahNumber: number;
        explanation: AIResponse
      }>('/ai/explain-verse', request);
      console.log('✅ AI Service: Response received from /ai/explain-verse', response);
      return response;
    } catch (error: any) {
      console.error('❌ AI Service: Error from /ai/explain-verse', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Get book recommendations
   */
  recommendBooks: async (
    request: AIRecommendBookRequest
  ): Promise<{ recommendations: AIResponse }> => {
    console.log('🤖 AI Service: Sending request to /ai/recommend-books', request);

    try {
      const response = await apiPost<{ recommendations: AIResponse }>('/ai/recommend-books', request);
      console.log('✅ AI Service: Response received from /ai/recommend-books', response);
      return response;
    } catch (error: any) {
      console.error('❌ AI Service: Error from /ai/recommend-books', error);
      throw error;
    }
  },

  /**
   * Smart search across all content
   */
  search: async (request: AISearchRequest): Promise<{ query: string; results: AIResponse }> => {
    console.log('🤖 AI Service: Sending request to /ai/search', request);

    try {
      const response = await apiPost<{ query: string; results: AIResponse }>('/ai/search', request);
      console.log('✅ AI Service: Response received from /ai/search', response);
      return response;
    } catch (error: any) {
      console.error('❌ AI Service: Error from /ai/search', error);
      throw error;
    }
  },
};
