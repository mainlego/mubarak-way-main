import OpenAI from 'openai';
import { config } from '../config/env.js';
import { Ayah } from '../models/index.js';
import { elasticsearchService } from './elasticsearchProxy.js';
import { analyzeUserQuery, gatherContext } from './contextGathering.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Smart Search - AI-powered search with relevant verses
 */
export async function aiSmartSearch(
  query: string,
  language: string = 'ru'
): Promise<{
  answer: string;
  verses: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation: string;
  }>;
  hasResults: boolean;
}> {
  try {
    // Analyze query and gather context
    const analysis = await analyzeUserQuery(query);
    const context = await gatherContext(query, analysis, []);

    if (context.relatedAyahs.length === 0) {
      return {
        answer: 'К сожалению, по вашему запросу не найдено релевантных аятов. Попробуйте переформулировать вопрос или использовать другие ключевые слова.',
        verses: [],
        hasResults: false,
      };
    }

    // Format ayahs for AI
    const ayahsText = context.relatedAyahs.slice(0, 5).map((a, idx) =>
      `${idx + 1}. Сура ${a.surahNumber}, аят ${a.ayahNumber}:\n` +
      `**Арабский:** ${a.arabicText}\n` +
      `**Перевод:** ${a.translation}`
    ).join('\n\n');

    // Generate AI answer
    const systemPrompt = `Ты - исламский помощник. На основе предоставленных аятов Корана дай краткий, понятный ответ на вопрос пользователя.

ПРАВИЛА:
1. Отвечай кратко - 2-3 предложения максимум
2. Обязательно ссылайся на конкретные аяты в формате (Сура X, аят Y)
3. НЕ добавляй дополнительные аяты которых нет в списке
4. Если аяты не отвечают на вопрос напрямую - честно скажи об этом
5. Язык ответа: ${language === 'ru' ? 'Русский' : language === 'en' ? 'English' : 'العربية'}

Предоставленные аяты:
${ayahsText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
    });

    return {
      answer: response.choices[0]?.message?.content || 'Не удалось сгенерировать ответ.',
      verses: context.relatedAyahs.slice(0, 5).map(a => ({
        surahNumber: a.surahNumber,
        ayahNumber: a.ayahNumber,
        arabicText: a.arabicText,
        translation: a.translation,
      })),
      hasResults: true,
    };
  } catch (error) {
    console.error('AI Smart Search error:', error);
    throw error;
  }
}

/**
 * Ask Quran - Answer life questions from Quran
 */
export async function askQuran(
  question: string,
  language: string = 'ru'
): Promise<{
  success: boolean;
  answer: string;
  recommendedVerses: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation: string;
    reason: string;
  }>;
}> {
  try {
    // Analyze and gather context
    const analysis = await analyzeUserQuery(question);
    const context = await gatherContext(question, analysis, []);

    if (context.relatedAyahs.length === 0) {
      return {
        success: false,
        answer: 'По вашему вопросу не найдено релевантных аятов в Коране. Попробуйте переформулировать вопрос более конкретно.',
        recommendedVerses: [],
      };
    }

    // Format context for AI
    const ayahsContext = context.relatedAyahs.slice(0, 10).map((a, idx) =>
      `Аят ${idx + 1}: Сура ${a.surahNumber}:${a.ayahNumber}\n` +
      `Арабский текст: ${a.arabicText}\n` +
      `Перевод: ${a.translation}`
    ).join('\n\n');

    const systemPrompt = `Ты - мудрый исламский наставник. Отвечай на жизненные вопросы людей ТОЛЬКО на основе предоставленных аятов Корана.

ФОРМАТ ОТВЕТА:
1. Начни с краткого вступления (1-2 предложения)
2. Процитируй 2-3 самых релевантных аята с указанием (Сура X:Y)
3. Дай практический совет на основе этих аятов
4. Закончи мотивирующим напутствием

ПРАВИЛА:
- Цитируй ТОЛЬКО предоставленные аяты
- Всегда указывай источник: (Сура X, аят Y)
- Давай практические советы, не общие фразы
- Проявляй эмпатию и понимание
- Язык: ${language === 'ru' ? 'Русский' : language === 'en' ? 'English' : 'العربية'}

Предоставленные аяты:
${ayahsContext}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });

    // Extract verse references and create recommended verses
    const recommendedVerses = context.relatedAyahs.slice(0, 3).map(a => ({
      surahNumber: a.surahNumber,
      ayahNumber: a.ayahNumber,
      arabicText: a.arabicText,
      translation: a.translation,
      reason: `Релевантность: ${((a.relevanceScore || 0) * 100).toFixed(0)}%`,
    }));

    return {
      success: true,
      answer: response.choices[0]?.message?.content || 'Не удалось сгенерировать ответ.',
      recommendedVerses,
    };
  } catch (error) {
    console.error('Ask Quran error:', error);
    throw error;
  }
}

/**
 * Analyze Word - Statistical analysis of word in Quran
 */
export async function analyzeWord(
  word: string,
  language: string = 'ru'
): Promise<{
  count: number;
  answer: string;
  verses: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation: string;
  }>;
}> {
  try {
    // Search for the word
    const results = await elasticsearchService.search(word, language, 50);

    if (results.length === 0) {
      return {
        count: 0,
        answer: `Слово "${word}" не найдено в Коране. Попробуйте другое слово или его синонимы.`,
        verses: [],
      };
    }

    // Get unique verses count
    const uniqueVerses = new Map();
    results.forEach(r => {
      const key = `${r.surahNumber}:${r.ayahNumber}`;
      if (!uniqueVerses.has(key)) {
        uniqueVerses.set(key, r);
      }
    });

    const count = uniqueVerses.size;

    // Select top 10 verses for analysis
    const topVerses = Array.from(uniqueVerses.values()).slice(0, 10);

    // Generate AI analysis
    const versesText = topVerses.map((v, idx) =>
      `${idx + 1}. Сура ${v.surahNumber}:${v.ayahNumber} - ${v.translation}`
    ).join('\n');

    const systemPrompt = `Ты - аналитик Корана. Проанализируй употребление слова "${word}" в Коране и дай краткий анализ.

ФОРМАТ:
1. Укажи общее количество упоминаний
2. Опиши в каких контекстах используется слово (2-3 предложения)
3. Выдели основные темы, связанные с этим словом

ПРАВИЛА:
- Будь кратким - 4-5 предложений максимум
- Используй примеры из предоставленных аятов
- Язык: ${language === 'ru' ? 'Русский' : 'English'}

Найденные аяты:
${versesText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Проанализируй слово "${word}"` },
      ],
    });

    return {
      count,
      answer: response.choices[0]?.message?.content || `Слово "${word}" встречается ${count} раз(а) в Коране.`,
      verses: topVerses.map(v => ({
        surahNumber: v.surahNumber,
        ayahNumber: v.ayahNumber,
        arabicText: v.arabicText,
        translation: v.translation,
      })),
    };
  } catch (error) {
    console.error('Analyze word error:', error);
    throw error;
  }
}

/**
 * Explain Simple - Age-appropriate verse explanation
 */
export async function explainSimple(
  surahNumber: number,
  ayahNumber: number,
  ayahText: string,
  level: 'child' | 'teen' | 'adult',
  language: string = 'ru'
): Promise<{
  explanation: string;
  keyPoints: string[];
  practicalAdvice: string;
}> {
  try {
    const levelDescriptions = {
      child: 'ребенку 7-10 лет, простыми словами с примерами из жизни',
      teen: 'подростку 13-16 лет, понятно но не упрощая смысл',
      adult: 'взрослому человеку, с глубоким анализом и контекстом',
    };

    const systemPrompt = `Ты - учитель Корана. Объясни смысл аята ${levelDescriptions[level]}.

ФОРМАТ ОТВЕТА (верни JSON):
{
  "explanation": "Понятное объяснение (3-4 предложения)",
  "keyPoints": ["Ключевой момент 1", "Ключевой момент 2", "Ключевой момент 3"],
  "practicalAdvice": "Как применить это в жизни (2-3 предложения)"
}

ПРАВИЛА:
- Объясняй просто но точно
- Используй примеры подходящие для возраста ${level}
- Избегай сложных терминов для детей и подростков
- Для взрослых можешь использовать исламскую терминологию
- Язык: ${language === 'ru' ? 'Русский' : 'English'}

Аят для объяснения:
Сура ${surahNumber}, аят ${ayahNumber}
Текст: ${ayahText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Объясни этот аят для уровня: ${level}` },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      explanation: result.explanation || 'Не удалось создать объяснение.',
      keyPoints: result.keyPoints || [],
      practicalAdvice: result.practicalAdvice || '',
    };
  } catch (error) {
    console.error('Explain simple error:', error);
    throw error;
  }
}
