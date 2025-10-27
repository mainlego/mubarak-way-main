import OpenAI from 'openai';
import { config } from '../config/env.js';
import Conversation, { IConversation, IMessage } from '../models/Conversation.js';
import User from '../models/User.js';
import {
  analyzeUserQuery,
  gatherContext,
  formatContextForAI,
  QueryAnalysis,
} from './contextGathering.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export interface InteractiveResponse {
  message: string;
  suggestedActions: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  context: {
    relatedAyahs: Array<{
      surahNumber: number;
      ayahNumber: number;
      arabicText?: string;
      translation?: string;
    }>;
    relatedSurahs: Array<{
      surahNumber: number;
      name: string;
    }>;
  };
}

/**
 * Interactive Assistant with conversation context
 */
export class InteractiveAssistant {
  private userId: string;
  private sessionId: string;
  private conversation: IConversation | null = null;

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  /**
   * Initialize or load conversation
   */
  async initialize(): Promise<InteractiveAssistant> {
    try {
      this.conversation = await Conversation.findOne({
        userId: this.userId,
        sessionId: this.sessionId,
      });

      if (!this.conversation) {
        this.conversation = new Conversation({
          userId: this.userId,
          sessionId: this.sessionId,
          metadata: {
            language: 'ru',
          },
          status: 'active',
        });

        // Add system message
        await this.conversation.addMessage(
          'system',
          'Вы - исламский наставник по изучению Корана. ' +
            'Ваша задача - помогать людям понять Коран, давая ответы СТРОГО на основе текста Корана и достоверных хадисов. ' +
            'Всегда цитируйте конкретные аяты с указанием суры и номера. Не давайте общие советы - только то, что подтверждено священными текстами.'
        );
      }

      return this;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  }

  /**
   * Process user message
   */
  async processMessage(userMessage: string): Promise<InteractiveResponse> {
    if (!this.conversation) {
      throw new Error('Conversation not initialized. Call initialize() first.');
    }

    try {
      // 1. Save user message
      await this.conversation.addMessage('user', userMessage);

      // 1.5. Save query to user's search history (if Telegram user)
      if (this.userId.startsWith('tg_')) {
        const telegramId = this.userId.replace('tg_', '');
        try {
          const user = await User.findOne({ telegramId });
          if (user) {
            user.searchHistory.push({
              query: userMessage,
              type: 'quran',
              timestamp: new Date(),
            });
            await user.save();
          }
        } catch (error) {
          console.error('Error saving search history:', error);
          // Don't stop execution if history save fails
        }
      }

      // 2. Analyze query
      const analysis = await analyzeUserQuery(userMessage);

      // 3. Gather context
      const previousMessages = this.conversation.getContext(5);
      const context = await gatherContext(userMessage, analysis, previousMessages);

      // 4. Format context for AI
      const formattedContext = formatContextForAI(context);

      // 5. Generate response with OpenAI
      const response = await this.generateInteractiveResponse(
        userMessage,
        formattedContext,
        previousMessages,
        analysis
      );

      // 6. Save assistant response with actions and ayahs
      const message: Partial<IMessage> = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        context: { analysis },
        suggestedActions: response.suggestedActions || [],
        relatedAyahs: context.relatedAyahs.slice(0, 5) || [],
      };

      this.conversation.messages.push(message as IMessage);
      this.conversation.lastActivity = new Date();
      await this.conversation.save();

      // 7. Update conversation metadata
      if (context.relatedAyahs.length > 0) {
        for (const ayah of context.relatedAyahs.slice(0, 5)) {
          await this.conversation.addRelatedAyah(ayah.surahNumber, ayah.ayahNumber);
        }
      }

      return {
        message: response.message,
        suggestedActions: response.suggestedActions,
        context: {
          relatedAyahs: context.relatedAyahs.slice(0, 5),
          relatedSurahs: context.relatedSurahs,
        },
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Generate interactive response with OpenAI
   */
  private async generateInteractiveResponse(
    userMessage: string,
    contextInfo: string,
    conversationHistory: IMessage[],
    analysis: QueryAnalysis
  ): Promise<{ message: string; suggestedActions: any[] }> {
    try {
      const systemPrompt = `Вы - интерактивный исламский ассистент по изучению Корана. Ваша главная задача - давать ответы СТРОГО НА ОСНОВЕ текста Корана и достоверных хадисов.

# КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. **ВСЕГДА базируйте ответы на конкретных аятах Корана** - цитируйте точный текст аята с указанием суры и номера
2. **НЕ давайте общие советы или мнения** - только то, что прямо указано в Коране или хадисах
3. **ОБЯЗАТЕЛЬНО используйте предоставленный контекст** - все релевантные аяты даны ниже, используйте их в ответе
4. **Если в контексте нет подходящих аятов** - честно скажите "В предоставленных аятах нет прямого ответа на этот вопрос" и предложите уточнить запрос
5. **Цитируйте аяты дословно** - не перефразируйте священный текст, используйте точные цитаты
6. **ЗАПРЕЩЕНО давать советы без подтверждения** из Корана или хадисов

# ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА:

🤖 **Ответ:**

## [Заголовок темы]

[Основной текст ответа с объяснениями - 2-3 параграфа]

**Источник:**
– **Коран, сура [номер], аят [номер]**
– **Коран, сура [номер], аят [номер]**
[и т.д. для каждого использованного аята]

### [Подзаголовок если нужно]

[Дополнительные объяснения]

**Источник:**
– **Коран, сура [номер], аят [номер]**

---

**Итоговый совет:**
[Краткое заключение и практический совет на основе аятов]

# КРИТИЧЕСКИ ВАЖНО О ФОРМАТЕ ИСТОЧНИКОВ:
- После КАЖДОГО параграфа с утверждениями ОБЯЗАТЕЛЬНО добавляйте блок **Источник:**
- Формат источника: **Коран, сура [номер], аят [номер]**
- НЕ пишите просто "(2:155)" - используйте полный формат: **Коран, сура 2, аят 155**
- Каждый источник начинается с "– " (тире с пробелом)
- Если упоминаете хадис, формат: **Хадис из [сборник], книга [номер], хадис [номер]**

# ПРИМЕРЫ ПРАВИЛЬНОГО ФОРМАТА:

❌ НЕПРАВИЛЬНО:
"Терпение очень важно в исламе (2:155). Будьте терпеливыми."

✅ ПРАВИЛЬНО:
"🤖 **Ответ:**

## О терпении в испытаниях

При совершении обязательной молитвы мусульманину крайне важно сохранять терпение и стойкость. Аллах испытывает верующих различными трудностями, чтобы проверить их веру и укрепить их дух.

**Источник:**
– **Коран, сура 2, аят 155**

### Награда за терпение

Те, кто проявляет терпение в трудностях, получают особую награду от Аллаха. Верующие должны понимать, что испытания временны, а награда вечна.

**Источник:**
– **Коран, сура 2, аят 156**
– **Коран, сура 3, аят 200**

---

**Итоговый совет:**
Сохраняйте терпение в любых обстоятельствах, помня, что Аллах испытывает только тех, кого любит. Обращайтесь к Нему с дуа и просите помощи."

${contextInfo}

# ВАЖНО:
- Используйте ТОЛЬКО информацию из раздела "Релевантные аяты" выше
- ОБЯЗАТЕЛЬНО добавляйте блок **Источник:** после каждого утверждения
- Если там нет подходящих аятов - попросите пользователя уточнить вопрос`;

      // Format conversation history for OpenAI
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = conversationHistory
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add current message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      });

      const assistantResponse = completion.choices[0]?.message?.content || '';

      // Extract suggested actions from response
      const suggestedActions = this.extractSuggestedActions(assistantResponse, analysis);

      return {
        message: assistantResponse,
        suggestedActions,
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        message: 'Извините, произошла ошибка. Пожалуйста, попробуйте переформулировать ваш вопрос.',
        suggestedActions: [],
      };
    }
  }

  /**
   * Extract suggested actions from analysis
   */
  private extractSuggestedActions(response: string, analysis: QueryAnalysis): any[] {
    const actions: any[] = [];

    // Suggest reading mentioned surahs
    if (analysis.mentioned_surahs && analysis.mentioned_surahs.length > 0) {
      analysis.mentioned_surahs.forEach((surahNum) => {
        actions.push({
          type: 'read_surah',
          label: `Читать суру ${surahNum}`,
          data: { surahNumber: surahNum },
        });
      });
    }

    // Suggest exploring topics
    if (analysis.topics && analysis.topics.length > 0) {
      analysis.topics.slice(0, 2).forEach((topic) => {
        actions.push({
          type: 'explore_topic',
          label: `Узнать больше о: ${topic}`,
          data: { topic },
        });
      });
    }

    // Always suggest asking a follow-up question
    actions.push({
      type: 'ask_question',
      label: 'Задать уточняющий вопрос',
      data: {},
    });

    return actions.slice(0, 4); // Max 4 actions
  }

  /**
   * Get conversation history
   */
  async getHistory(): Promise<IMessage[]> {
    if (!this.conversation) {
      await this.initialize();
    }
    return this.conversation!.messages;
  }

  /**
   * End conversation
   */
  async endConversation(): Promise<void> {
    if (this.conversation) {
      this.conversation.status = 'completed';
      await this.conversation.save();
    }
  }

  /**
   * Get conversation stats
   */
  async getStats() {
    if (!this.conversation) {
      return null;
    }

    return {
      messageCount: this.conversation.messages.length,
      relatedSurahs: [...new Set(this.conversation.metadata.relatedSurahs || [])],
      relatedAyahs: this.conversation.metadata.relatedAyahs || [],
      topic: this.conversation.metadata.topic,
      duration: new Date().getTime() - this.conversation.createdAt.getTime(),
    };
  }
}

/**
 * Create or resume conversation
 */
export async function createOrResumeConversation(
  userId: string,
  sessionId: string
): Promise<InteractiveAssistant> {
  const assistant = new InteractiveAssistant(userId, sessionId);
  await assistant.initialize();
  return assistant;
}

/**
 * Quick response without history (for simple requests)
 */
export async function quickResponse(
  query: string,
  language: string = 'ru'
): Promise<{
  answer: string;
  relatedAyahs: Array<{
    surahNumber: number;
    ayahNumber: number;
    arabicText?: string;
    translation?: string;
  }>;
}> {
  try {
    const analysis = await analyzeUserQuery(query);
    const context = await gatherContext(query, analysis, []);
    const formattedContext = formatContextForAI(context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${formattedContext}\n\nВопрос пользователя: ${query}\n\nДайте краткий, точный ответ (2-3 предложения) со ссылками на аяты.`,
        },
      ],
    });

    return {
      answer: completion.choices[0]?.message?.content || '',
      relatedAyahs: context.relatedAyahs.slice(0, 3),
    };
  } catch (error) {
    console.error('Error in quick response:', error);
    throw error;
  }
}
