import OpenAI from 'openai';
import { Ayah } from '../models/index.js';
import { elasticsearchService } from './elasticsearchProxy.js';
import { config } from '../config/env.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export interface QueryAnalysis {
  intent: 'question' | 'explanation' | 'search' | 'guidance' | 'general';
  topics: string[];
  mentioned_surahs: number[];
  mentioned_ayahs: Array<{ surah: number; ayah: number }>;
  keywords: string[];
  synonyms: string[];
  arabicKeywords: string[];
  language: string;
}

export interface GatheredContext {
  relatedAyahs: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation: string;
    relevanceScore?: number;
  }>;
  relatedSurahs: Array<{
    surahNumber: number;
    name: string;
  }>;
}

/**
 * Анализ пользовательского запроса с помощью OpenAI
 */
export async function analyzeUserQuery(query: string): Promise<QueryAnalysis> {
  try {
    const systemPrompt = `Ты - эксперт по исламским запросам. Проанализируй запрос пользователя максимально глубоко и верни JSON с:

- intent: тип запроса
  * "question" - если пользователь задает вопрос о религии (Что? Как? Почему? Разрешено ли?)
  * "explanation" - если просит объяснить аят, суру или термин
  * "search" - если ищет конкретный аят по теме (найди, покажи, где говорится)
  * "guidance" - если просит совет, наставление (как мне поступить, помоги разобраться)
  * "general" - общая беседа

- topics: массив главных тем из запроса (на русском)
  Примеры: ["молитва", "намаз"], ["пост", "рамадан"], ["терпение", "испытания"], ["закят", "милостыня"]

- mentioned_surahs: массив номеров сур, если упоминаются (например, [2, 3, 5])

- mentioned_ayahs: массив объектов {surah: число, ayah: число} если упоминаются конкретные аяты

- keywords: ключевые слова из запроса на оригинальном языке (2-5 слов)
  Извлекай ТОЛЬКО важные существительные и глаголы, убирай служебные слова

- synonyms: синонимы и связанные слова для keywords (3-5 синонимов на каждое ключевое слово)
  Примеры:
  * "терпение" → ["сабр", "стойкость", "выдержка", "терпеливость"]
  * "молитва" → ["намаз", "салят", "поклонение", "дуа"]
  * "пост" → ["ураза", "савм", "воздержание"]

- arabicKeywords: арабские транслитерации ключевых слов (для поиска в Коране)
  Используй стандартную транслитерацию:
  * "терпение" → ["sabr", "صبر"]
  * "молитва" → ["salat", "salah", "صلاة"]
  * "пост" → ["sawm", "siyam", "صوم"]
  * "милостыня" → ["zakat", "zakah", "زكاة"]
  * "вера" → ["iman", "إيمان"]

- language: язык запроса ("ru", "en", "ar", "uz", "kk", "tr")

ВАЖНО: Будь максимально точен в извлечении ключевых слов и синонимов - от этого зависит качество поиска аятов!

Отвечай ТОЛЬКО валидным JSON, без дополнительного текста.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      intent: analysis.intent || 'general',
      topics: analysis.topics || [],
      mentioned_surahs: analysis.mentioned_surahs || [],
      mentioned_ayahs: analysis.mentioned_ayahs || [],
      keywords: analysis.keywords || [],
      synonyms: analysis.synonyms || [],
      arabicKeywords: analysis.arabicKeywords || [],
      language: analysis.language || 'ru',
    };
  } catch (error) {
    console.error('Error analyzing query:', error);
    return {
      intent: 'general',
      topics: [],
      mentioned_surahs: [],
      mentioned_ayahs: [],
      keywords: [],
      synonyms: [],
      arabicKeywords: [],
      language: 'ru',
    };
  }
}

/**
 * Сбор контекста для ответа: релевантные аяты и суры
 */
export async function gatherContext(
  query: string,
  analysis: QueryAnalysis,
  previousMessages: any[] = []
): Promise<GatheredContext> {
  const context: GatheredContext = {
    relatedAyahs: [],
    relatedSurahs: [],
  };

  try {
    // 1. Если упомянуты конкретные аяты - загружаем их из БД
    if (analysis.mentioned_ayahs && analysis.mentioned_ayahs.length > 0) {
      for (const ayahRef of analysis.mentioned_ayahs) {
        const ayah = await Ayah.findOne({
          surahNumber: ayahRef.surah,
          ayahNumber: ayahRef.ayah,
        });

        if (ayah) {
          context.relatedAyahs.push({
            surahNumber: ayah.surahNumber,
            ayahNumber: ayah.ayahNumber,
            arabicText: ayah.textArabic,
            translation: ayah.translations[0]?.text || '',
            relevanceScore: 1.0,
          });
        }
      }
    }

    // 2. Семантический поиск через Elasticsearch (если доступен)
    if (analysis.keywords && analysis.keywords.length > 0) {
      try {
        // Объединяем keywords + synonyms + arabicKeywords для более широкого поиска
        const allSearchTerms = [
          ...analysis.keywords,
          ...analysis.synonyms,
          ...analysis.arabicKeywords,
        ].filter(Boolean);

        const searchQuery = allSearchTerms.join(' ');
        console.log(`Searching with extended query: ${searchQuery}`);

        const elasticResults = await elasticsearchService.search(
          searchQuery,
          analysis.language || 'ru',
          20 // Запрашиваем больше результатов для лучшего выбора
        );

        if (elasticResults && elasticResults.length > 0) {
          // Добавляем результаты Elasticsearch
          for (const result of elasticResults.slice(0, 10)) {
            // Проверяем, нет ли уже этого аята
            const exists = context.relatedAyahs.some(
              (a) => a.surahNumber === result.surahNumber && a.ayahNumber === result.ayahNumber
            );

            if (!exists) {
              context.relatedAyahs.push({
                surahNumber: result.surahNumber,
                ayahNumber: result.ayahNumber,
                arabicText: result.arabicText || '',
                translation: result.translation || '',
                relevanceScore: result.score || 0.5,
              });
            }
          }
        }

        // Если недостаточно результатов, попробуем поиск по topics
        if (context.relatedAyahs.length < 5 && analysis.topics && analysis.topics.length > 0) {
          console.log(`Not enough results, searching by topics: ${analysis.topics.join(', ')}`);
          const topicQuery = analysis.topics.join(' ');
          const topicResults = await elasticsearchService.search(
            topicQuery,
            analysis.language || 'ru',
            15
          );

          for (const result of topicResults) {
            const exists = context.relatedAyahs.some(
              (a) => a.surahNumber === result.surahNumber && a.ayahNumber === result.ayahNumber
            );

            if (!exists && context.relatedAyahs.length < 10) {
              context.relatedAyahs.push({
                surahNumber: result.surahNumber,
                ayahNumber: result.ayahNumber,
                arabicText: result.arabicText || '',
                translation: result.translation || '',
                relevanceScore: (result.score || 0.3) * 0.8, // Немного ниже relevance для topic search
              });
            }
          }
        }
      } catch (elasticError) {
        console.warn('Elasticsearch search failed, falling back to MongoDB:', elasticError);
      }
    }

    // 3. Fallback: если ничего не найдено через Elasticsearch, используем MongoDB
    if (context.relatedAyahs.length === 0 && analysis.keywords.length > 0) {
      const keywords = analysis.keywords.map((k) => new RegExp(k, 'i'));
      const mongoAyahs = await Ayah.find({
        $or: [
          { translation: { $in: keywords } },
          { transliteration: { $in: keywords } },
        ],
      })
        .limit(5)
        .exec();

      for (const ayah of mongoAyahs) {
        context.relatedAyahs.push({
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          arabicText: ayah.textArabic,
          translation: ayah.translations[0]?.text || '',
          relevanceScore: 0.3,
        });
      }
    }

    // 4. Собираем информацию о сурах
    const uniqueSurahs = new Set<number>();

    // Из упомянутых сур
    if (analysis.mentioned_surahs) {
      analysis.mentioned_surahs.forEach((s) => uniqueSurahs.add(s));
    }

    // Из найденных аятов
    context.relatedAyahs.forEach((a) => uniqueSurahs.add(a.surahNumber));

    // Загружаем информацию о сурах (используем Ayah для получения названий)
    for (const surahNumber of uniqueSurahs) {
      const firstAyah = await Ayah.findOne({ surahNumber, ayahNumber: 1 });
      if (firstAyah) {
        context.relatedSurahs.push({
          surahNumber,
          name: `Сура ${surahNumber}`,
        });
      }
    }

    // Сортируем аяты по релевантности
    context.relatedAyahs.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return context;
  } catch (error) {
    console.error('Error gathering context:', error);
    return context;
  }
}

/**
 * Форматирование контекста для передачи в AI
 */
export function formatContextForAI(context: GatheredContext): string {
  let formatted = '';

  if (context.relatedAyahs.length > 0) {
    formatted += '# Релевантные аяты из Корана:\n\n';

    context.relatedAyahs.slice(0, 10).forEach((ayah, index) => {
      formatted += `## ${index + 1}. Коран, сура ${ayah.surahNumber}, аят ${ayah.ayahNumber}\n`;
      formatted += `**Арабский текст:** ${ayah.arabicText}\n`;
      formatted += `**Перевод:** ${ayah.translation}\n\n`;
    });
  } else {
    formatted += '# Релевантные аяты не найдены\n\n';
    formatted += 'Для данного запроса не найдено релевантных аятов Корана. ';
    formatted += 'Попросите пользователя уточнить или переформулировать вопрос.\n\n';
  }

  if (context.relatedSurahs.length > 0) {
    formatted += '\n# Упомянутые суры:\n';
    context.relatedSurahs.forEach((surah) => {
      formatted += `- ${surah.name} (${surah.surahNumber})\n`;
    });
    formatted += '\n';
  }

  return formatted;
}
