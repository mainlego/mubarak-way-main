import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { QuranService } from './QuranService.js';
import type {
  AIAskRequest,
  AIExplainVerseRequest,
  AIRecommendBookRequest,
  AISearchRequest,
} from '@mubarak-way/shared';

export class AIService {
  private static client: Anthropic | null = null;

  /**
   * Initialize Anthropic client
   */
  private static getClient(): Anthropic {
    if (!this.client) {
      if (!config.anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      this.client = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }
    return this.client;
  }

  /**
   * Ask general question about Quran/Islam
   */
  static async ask(request: AIAskRequest): Promise<string> {
    const client = this.getClient();

    let systemPrompt = `You are a knowledgeable Islamic scholar and assistant.
You provide accurate, respectful, and helpful information about the Quran, Islam, and Islamic practices.
Always cite relevant Quranic verses when applicable.
Be concise but thorough in your explanations.
Language: ${request.language || 'Russian'}`;

    let userMessage = request.question;

    // Add context if provided
    if (request.context?.surahNumber && request.context?.ayahNumber) {
      const ayah = await QuranService.getAyah(
        request.context.surahNumber,
        request.context.ayahNumber,
        request.language
      );

      if (ayah) {
        userMessage += `\n\nContext: Surah ${request.context.surahNumber}, Ayah ${request.context.ayahNumber}:\n${ayah.textArabic}`;
        if (ayah.translations[0]) {
          userMessage += `\nTranslation: ${ayah.translations[0].text}`;
        }
      }
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Explain a specific verse
   */
  static async explainVerse(request: AIExplainVerseRequest): Promise<string> {
    const client = this.getClient();

    const ayah = await QuranService.getAyah(
      request.surahNumber,
      request.ayahNumber,
      request.language
    );

    if (!ayah) {
      throw new Error('Verse not found');
    }

    const detailLevel = request.detailLevel || 'detailed';
    const levelInstructions = {
      brief: 'Explain this verse briefly and concisely.',
      medium: 'Provide a moderate explanation with key context.',
      detailed: 'Provide a detailed explanation with context and scholarly insights.',
    };

    const systemPrompt = `You are an expert in Quranic tafsir (exegesis).
${levelInstructions[detailLevel]}
Language: ${request.language || 'Russian'}`;

    const userMessage = `Explain this verse:\n\nSurah ${request.surahNumber}, Ayah ${request.ayahNumber}:\n${ayah.textArabic}\n\nTranslation: ${ayah.translations[0]?.text || 'N/A'}`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Recommend books based on user interests
   */
  static async recommendBooks(request: AIRecommendBookRequest): Promise<string> {
    const client = this.getClient();

    const systemPrompt = `You are a knowledgeable librarian specializing in Islamic literature.
Recommend relevant Islamic books based on user interests.
Be concise and explain why each book is recommended.
Language: ${request.language || 'Russian'}`;

    let userMessage = 'Recommend Islamic books';
    if (request.interests && request.interests.length > 0) {
      userMessage += ` related to: ${request.interests.join(', ')}`;
    }
    if (request.readBooks && request.readBooks.length > 0) {
      userMessage += `\n\nI have already read books with IDs: ${request.readBooks.join(', ')}`;
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  /**
   * Smart search across all content
   */
  static async search(request: AISearchRequest): Promise<string> {
    const client = this.getClient();

    const systemPrompt = `You are a smart search assistant for an Islamic digital platform.
Help users find relevant content (Quran verses, books, lessons) based on their query.
Provide specific references and suggestions.
Language: ${request.language || 'Russian'}`;

    const userMessage = `Search query: ${request.query}\nContent type: ${request.type}`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }
}
