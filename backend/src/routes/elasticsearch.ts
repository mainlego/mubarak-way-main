/**
 * Elasticsearch Routes
 * Provides secure access to Elasticsearch API
 */

import express, { Request, Response } from 'express';
import { elasticsearchService } from '../services/elasticsearchProxy.js';

const router = express.Router();

/**
 * POST /api/elasticsearch/verses
 * Get all verses of a specific surah
 */
router.post('/verses', async (req: Request, res: Response) => {
  try {
    const { surahNumber, language = 'ru', translationId = 'auto' } = req.body;

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        error: 'Invalid surah number. Must be between 1 and 114'
      });
    }

    const verses = await elasticsearchService.getSurahAyahs(surahNumber, language);

    res.json({
      success: true,
      verses,
      count: verses.length
    });
  } catch (error: any) {
    console.error('Error in /verses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch verses'
    });
  }
});

/**
 * POST /api/elasticsearch/search
 * Text search in Quran
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru', size = 20 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await elasticsearchService.search(query.trim(), language, size);

    res.json({
      success: true,
      results,
      count: results.length,
      query: query.trim()
    });
  } catch (error: any) {
    console.error('Error in /search:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
});

/**
 * POST /api/elasticsearch/semantic-search
 * Semantic (vector) search in Quran
 */
router.post('/semantic-search', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru', size = 10 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // For now, use text search as fallback
    // TODO: Implement true semantic search with embeddings
    const results = await elasticsearchService.search(query.trim(), language, size);

    res.json({
      success: true,
      results,
      count: results.length,
      query: query.trim(),
      type: 'semantic'
    });
  } catch (error: any) {
    console.error('Error in /semantic-search:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Semantic search failed'
    });
  }
});

/**
 * POST /api/elasticsearch/tafsir
 * Get tafsir (interpretation) for specific ayah
 */
router.post('/tafsir', async (req: Request, res: Response) => {
  try {
    const { surahNumber, ayahNumber, language = 'ru', tafsirId = 'auto' } = req.body;

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        error: 'Invalid surah number'
      });
    }

    if (!ayahNumber || ayahNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ayah number'
      });
    }

    const tafsir = await elasticsearchService.getTafsir(
      surahNumber,
      ayahNumber,
      language,
      tafsirId === 'auto' ? undefined : tafsirId
    );

    if (!tafsir) {
      return res.status(404).json({
        success: false,
        error: 'Tafsir not found'
      });
    }

    res.json({
      success: true,
      tafsir
    });
  } catch (error: any) {
    console.error('Error in /tafsir:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tafsir'
    });
  }
});

/**
 * POST /api/elasticsearch/tafsir-search
 * Search in tafsir
 */
router.post('/tafsir-search', async (req: Request, res: Response) => {
  try {
    const { query, language = 'ru', size = 10 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // For now, return empty results
    // TODO: Implement tafsir search when available in elasticsearchService
    res.json({
      success: true,
      results: [],
      count: 0,
      message: 'Tafsir search not yet implemented'
    });
  } catch (error: any) {
    console.error('Error in /tafsir-search:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Tafsir search failed'
    });
  }
});

/**
 * POST /api/elasticsearch/hadiths-search
 * Search hadiths
 */
router.post('/hadiths-search', async (req: Request, res: Response) => {
  try {
    const { query, book = null, size = 20 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await elasticsearchService.searchHadiths(
      query.trim(),
      book,
      size
    );

    res.json({
      success: true,
      results,
      count: results.length,
      query: query.trim()
    });
  } catch (error: any) {
    console.error('Error in /hadiths-search:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Hadith search failed'
    });
  }
});

/**
 * POST /api/elasticsearch/hadiths-semantic-search
 * Semantic search in hadiths
 */
router.post('/hadiths-semantic-search', async (req: Request, res: Response) => {
  try {
    const { query, size = 10 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // For now, use regular hadith search
    const results = await elasticsearchService.searchHadiths(query.trim(), null, size);

    res.json({
      success: true,
      results,
      count: results.length,
      query: query.trim(),
      type: 'semantic'
    });
  } catch (error: any) {
    console.error('Error in /hadiths-semantic-search:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Hadith semantic search failed'
    });
  }
});

/**
 * GET /api/elasticsearch/allah-names
 * Get 99 names of Allah
 */
router.get('/allah-names', async (req: Request, res: Response) => {
  try {
    const names = await elasticsearchService.getAllahNames();

    res.json({
      success: true,
      names,
      count: names.length
    });
  } catch (error: any) {
    console.error('Error in /allah-names:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Allah names'
    });
  }
});

/**
 * GET /api/elasticsearch/stats
 * Get Elasticsearch statistics (for admin)
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const isHealthy = await elasticsearchService.healthCheck();

    res.json({
      success: true,
      stats: {
        healthy: isHealthy,
        message: isHealthy ? 'Elasticsearch is accessible' : 'Elasticsearch is not accessible'
      }
    });
  } catch (error: any) {
    console.error('Error in /stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stats'
    });
  }
});

/**
 * GET /api/elasticsearch/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await elasticsearchService.healthCheck();

    res.json({
      success: true,
      healthy: isHealthy
    });
  } catch (error: any) {
    console.error('Error in /health:', error);
    res.status(500).json({
      success: false,
      healthy: false
    });
  }
});

export default router;
