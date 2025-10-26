import { Router, Request, Response } from 'express';
import { AIService } from '../services/AIService.js';
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

    if (error.message === 'ANTHROPIC_API_KEY not configured') {
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

export default router;
