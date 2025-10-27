import OpenAI from 'openai';
import { config } from '../config/env.js';
import { QuranService } from './QuranService.js';
import type {
  AIAskRequest,
  AIExplainVerseRequest,
  AIRecommendBookRequest,
  AISearchRequest,
  AIResponse,
} from '@mubarak-way/shared';

export class AIService {
  private static client: OpenAI | null = null;

  /**
   * Initialize OpenAI client
   */
  private static getClient(): OpenAI {
    if (!this.client) {
      if (!config.openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }
    return this.client;
  }

  /**
   * Ask general question about Quran/Islam
   */
  static async ask(request: AIAskRequest): Promise<AIResponse> {
    const client = this.getClient();

    let systemPrompt = `Вы - исламский наставник по изучению Корана.
Ваша задача - помогать людям понять Коран, давая ответы СТРОГО на основе текста Корана и достоверных хадисов.
Всегда цитируйте конкретные аяты с указанием суры и номера.
Не давайте общие советы - только то, что подтверждено священными текстами.

ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА:

🤖 **Ответ:**

## [Заголовок темы]

[Основной текст ответа]

**Источник:**
– **Коран, сура [номер], аят [номер]**

Язык ответа: ${request.language || 'Русский'}`;

    let userMessage = request.question;

    // Add context if provided
    if (request.context?.surahNumber && request.context?.ayahNumber) {
      const ayah = await QuranService.getAyah(
        request.context.surahNumber,
        request.context.ayahNumber,
        request.language
      );

      if (ayah) {
        userMessage += `\n\nКонтекст: Сура ${request.context.surahNumber}, Аят ${request.context.ayahNumber}:\n${ayah.textArabic}`;
        if (ayah.translations[0]) {
          userMessage += `\nПеревод: ${ayah.translations[0].text}`;
        }
      }
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content || '';

    return {
      answer,
      sources: [],
      relatedVerses: [],
    };
  }

  /**
   * Explain a specific verse
   */
  static async explainVerse(request: AIExplainVerseRequest): Promise<AIResponse> {
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
      brief: 'Объясните этот аят кратко и ясно.',
      medium: 'Предоставьте умеренное объяснение с ключевым контекстом.',
      detailed: 'Предоставьте подробное объяснение с контекстом и научными выводами.',
    };

    const systemPrompt = `Вы - эксперт по коранической тафсир (толкованию).
${levelInstructions[detailLevel]}

ВАЖНО:
- Используйте точные цитаты из Корана
- Указывайте источники в формате: **Коран, сура X, аят Y**
- Объясняйте контекст и историю откровения (если известно)
- Будьте точны и уважительны к священному тексту

Язык ответа: ${request.language || 'Русский'}`;

    const userMessage = `Объясните этот аят:\n\nСура ${request.surahNumber}, Аят ${request.ayahNumber}:\n${ayah.textArabic}\n\nПеревод: ${ayah.translations[0]?.text || 'Н/Д'}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const explanation = response.choices[0]?.message?.content || '';

    return {
      answer: explanation,
      sources: [
        {
          type: 'quran',
          reference: `Сура ${request.surahNumber}, Аят ${request.ayahNumber}`,
          text: ayah.textArabic,
        },
      ],
      relatedVerses: [
        {
          surahNumber: request.surahNumber,
          ayahNumber: request.ayahNumber,
          text: ayah.translations[0]?.text || '',
        },
      ],
    };
  }

  /**
   * Recommend books based on user interests
   */
  static async recommendBooks(request: AIRecommendBookRequest): Promise<AIResponse> {
    const client = this.getClient();

    const systemPrompt = `Вы - знающий библиотекарь, специализирующийся на исламской литературе.
Рекомендуйте соответствующие исламские книги на основе интересов пользователя.
Будьте лаконичны и объясняйте, почему каждая книга рекомендована.
Язык ответа: ${request.language || 'Русский'}`;

    let userMessage = 'Порекомендуйте исламские книги';
    if (request.interests && request.interests.length > 0) {
      userMessage += ` по темам: ${request.interests.join(', ')}`;
    }
    if (request.readBooks && request.readBooks.length > 0) {
      userMessage += `\n\nЯ уже прочитал книги с ID: ${request.readBooks.join(', ')}`;
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content || '';

    return {
      answer,
      sources: [],
      relatedVerses: [],
    };
  }

  /**
   * Smart search across all content
   */
  static async search(request: AISearchRequest): Promise<AIResponse> {
    const client = this.getClient();

    const systemPrompt = `Вы - умный поисковый ассистент для исламской цифровой платформы.
Помогайте пользователям находить релевантный контент (аяты Корана, книги, уроки) на основе их запроса.
Предоставляйте конкретные ссылки и предложения.
Язык ответа: ${request.language || 'Русский'}`;

    const userMessage = `Поисковый запрос: ${request.query}\nТип контента: ${request.type}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content || '';

    return {
      answer,
      sources: [],
      relatedVerses: [],
    };
  }
}
