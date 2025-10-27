import { Router, Request, Response } from 'express';
import { AIService } from '../services/AIService.js';
import { createOrResumeConversation, quickResponse } from '../services/InteractiveAssistant.js';
import { elasticsearchService } from '../services/elasticsearchProxy.js';
import * as AdvancedAI from '../services/AdvancedAIService.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';
import type {
  ApiResponse,
  AIAskRequest,
  AIExplainVerseRequest,
  AIRecommendBookRequest,
  AISearchRequest,
} from '@mubarak-way/shared';

const router = Router();

// Apply AI rate limiter to all routes
router.use(aiLimiter);

/**
 * POST /api/v1/ai/ask
 * Ask general question about Quran/Islam
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const request: AIAskRequest = req.body;

    if (!request.question) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUESTION',
          message: 'Question is required',
        },
      } as ApiResponse);
    }

    const answer = await AIService.ask(request);

    res.json({
      success: true,
      data: {
        question: request.question,
        answer,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('AI ask error:', error);

    if (error.message === 'OPENAI_API_KEY not configured') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'AI service is not configured',
        },
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AI_ASK_ERROR',
        message: error.message || 'Failed to get AI response',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/explain-verse
 * Explain a specific Quranic verse
 */
router.post('/explain-verse', async (req: Request, res: Response) => {
  try {
    const request: AIExplainVerseRequest = req.body;

    if (!request.surahNumber || !request.ayahNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_VERSE',
          message: 'Surah and Ayah numbers are required',
        },
      } as ApiResponse);
    }

    const explanation = await AIService.explainVerse(request);

    res.json({
      success: true,
      data: {
        surahNumber: request.surahNumber,
        ayahNumber: request.ayahNumber,
        explanation,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('AI explain verse error:', error);

    if (error.message === 'Verse not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VERSE_NOT_FOUND',
          message: 'Verse not found',
        },
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AI_EXPLAIN_ERROR',
        message: error.message || 'Failed to explain verse',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/recommend-books
 * Get book recommendations
 */
router.post('/recommend-books', async (req: Request, res: Response) => {
  try {
    const request: AIRecommendBookRequest = req.body;

    const recommendations = await AIService.recommendBooks(request);

    res.json({
      success: true,
      data: {
        recommendations,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('AI recommend books error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'AI_RECOMMEND_ERROR',
        message: error.message || 'Failed to get recommendations',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/search
 * Smart search across all content
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const request: AISearchRequest = req.body;

    if (!request.query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required',
        },
      } as ApiResponse);
    }

    const results = await AIService.search(request);

    res.json({
      success: true,
      data: {
        query: request.query,
        results,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('AI search error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SEARCH_ERROR',
        message: error.message || 'Failed to search',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/chat
 * Interactive chat with conversation context
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !userId || !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'message, userId, and sessionId are required',
        },
      } as ApiResponse);
    }

    // Create or resume conversation
    const assistant = await createOrResumeConversation(userId, sessionId);

    // Process message
    const response = await assistant.processMessage(message);

    res.json({
      success: true,
      data: response,
    } as ApiResponse);
  } catch (error: any) {
    console.error('AI chat error:', error);

    if (error.message === 'OPENAI_API_KEY not configured') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'AI service is not configured',
        },
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AI_CHAT_ERROR',
        message: error.message || 'Failed to process chat message',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/ai/chat/history/:userId/:sessionId
 * Get conversation history
 */
router.get('/chat/history/:userId/:sessionId', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = req.params;

    const assistant = await createOrResumeConversation(userId, sessionId);
    const history = await assistant.getHistory();

    res.json({
      success: true,
      data: { history },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get chat history error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HISTORY_ERROR',
        message: error.message || 'Failed to get conversation history',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/quick
 * Quick response without conversation history
 */
router.post('/quick', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru' } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Query is required',
        },
      } as ApiResponse);
    }

    const response = await quickResponse(query, language);

    res.json({
      success: true,
      data: response,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Quick response error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'QUICK_RESPONSE_ERROR',
        message: error.message || 'Failed to get quick response',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/elasticsearch/search
 * Smart search using Elasticsearch
 */
router.post('/elasticsearch/search', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru', limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required',
        },
      } as ApiResponse);
    }

    const results = await elasticsearchService.search(query, language, limit);

    res.json({
      success: true,
      data: { results },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Elasticsearch search error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ELASTICSEARCH_SEARCH_ERROR',
        message: error.message || 'Failed to search',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/ai/elasticsearch/surah/:surahNumber
 * Get all ayahs from a surah
 */
router.get('/elasticsearch/surah/:surahNumber', async (req: Request, res: Response) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber, 10);
    const language = (req.query.language as string) || 'ru';

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SURAH_NUMBER',
          message: 'Surah number must be between 1 and 114',
        },
      } as ApiResponse);
    }

    const ayahs = await elasticsearchService.getSurahAyahs(surahNumber, language);

    res.json({
      success: true,
      data: { ayahs },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get surah ayahs error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SURAH_ERROR',
        message: error.message || 'Failed to get surah ayahs',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/ai/elasticsearch/health
 * Check Elasticsearch service health
 */
router.get('/elasticsearch/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await elasticsearchService.healthCheck();

    res.json({
      success: true,
      data: { healthy: isHealthy },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Elasticsearch health check error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: error.message || 'Failed to check health',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/tafsir
 * Get tafsir (exegesis) for a specific verse
 */
router.post('/tafsir', async (req: Request, res: Response) => {
  try {
    const { surahNumber, ayahNumber, language = 'ru', tafsirId } = req.body;

    if (!surahNumber || !ayahNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_VERSE',
          message: 'surahNumber and ayahNumber are required',
        },
      } as ApiResponse);
    }

    const tafsir = await elasticsearchService.getTafsir(
      surahNumber,
      ayahNumber,
      language,
      tafsirId
    );

    if (!tafsir) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAFSIR_NOT_FOUND',
          message: 'Tafsir not found for this verse',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: tafsir,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get tafsir error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'TAFSIR_ERROR',
        message: error.message || 'Failed to get tafsir',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/hadiths/search
 * Search hadiths by query
 */
router.post('/hadiths/search', async (req: Request, res: Response) => {
  try {
    const { query, book, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required',
        },
      } as ApiResponse);
    }

    const hadiths = await elasticsearchService.searchHadiths(query, book, limit);

    res.json({
      success: true,
      data: { hadiths },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Hadith search error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'HADITH_SEARCH_ERROR',
        message: error.message || 'Failed to search hadiths',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/ai/allah-names
 * Get 99 Names of Allah
 */
router.get('/allah-names', async (req: Request, res: Response) => {
  try {
    const names = await elasticsearchService.getAllahNames();

    res.json({
      success: true,
      data: { names },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get Allah names error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ALLAH_NAMES_ERROR',
        message: error.message || 'Failed to get Allah names',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/smart-search
 * AI-powered smart search with relevant verses
 */
router.post('/smart-search', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru' } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required',
        },
      } as ApiResponse);
    }

    const result = await AdvancedAI.aiSmartSearch(query, language);

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Smart search error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SMART_SEARCH_ERROR',
        message: error.message || 'Failed to perform smart search',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/ask-quran
 * Answer life questions from Quran
 */
router.post('/ask-quran', async (req: Request, res: Response) => {
  try {
    const { question, language = 'ru' } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUESTION',
          message: 'Question is required',
        },
      } as ApiResponse);
    }

    const result = await AdvancedAI.askQuran(question, language);

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Ask Quran error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ASK_QURAN_ERROR',
        message: error.message || 'Failed to answer from Quran',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/analyze-word
 * Statistical analysis of word in Quran
 */
router.post('/analyze-word', async (req: Request, res: Response) => {
  try {
    const { word, language = 'ru' } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_WORD',
          message: 'Word is required',
        },
      } as ApiResponse);
    }

    const result = await AdvancedAI.analyzeWord(word, language);

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Analyze word error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYZE_WORD_ERROR',
        message: error.message || 'Failed to analyze word',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/ai/explain-simple
 * Age-appropriate verse explanation
 */
router.post('/explain-simple', async (req: Request, res: Response) => {
  try {
    const { surahNumber, ayahNumber, ayahText, level = 'adult', language = 'ru' } = req.body;

    if (!surahNumber || !ayahNumber || !ayahText) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'surahNumber, ayahNumber, and ayahText are required',
        },
      } as ApiResponse);
    }

    if (!['child', 'teen', 'adult'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LEVEL',
          message: 'Level must be one of: child, teen, adult',
        },
      } as ApiResponse);
    }

    const result = await AdvancedAI.explainSimple(
      surahNumber,
      ayahNumber,
      ayahText,
      level as 'child' | 'teen' | 'adult',
      language
    );

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Explain simple error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'EXPLAIN_SIMPLE_ERROR',
        message: error.message || 'Failed to explain verse',
      },
    } as ApiResponse);
  }
});

export default router;
