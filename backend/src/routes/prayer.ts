import { Router, Request, Response } from 'express';
import { PrayerService } from '../services/PrayerService.js';
import type { ApiResponse } from '@mubarak-way/shared';

const router = Router();

/**
 * GET /api/v1/prayer/lessons
 * Get all lessons
 */
router.get('/lessons', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const lessons = await PrayerService.getAllLessons(category);

    res.json({
      success: true,
      data: lessons,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LESSONS_ERROR',
        message: error.message || 'Failed to get lessons',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/lessons/:slug
 * Get lesson by slug
 */
router.get('/lessons/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const lesson = await PrayerService.getLessonBySlug(slug);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LESSON_NOT_FOUND',
          message: 'Lesson not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: lesson,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LESSON_ERROR',
        message: error.message || 'Failed to get lesson',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/lessons/featured
 * Get featured lessons
 */
router.get('/lessons/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const lessons = await PrayerService.getFeaturedLessons(limit);

    res.json({
      success: true,
      data: lessons,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get featured lessons error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FEATURED_LESSONS_ERROR',
        message: error.message || 'Failed to get featured lessons',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/lessons/category/:category
 * Get lessons by category
 */
router.get('/lessons/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const lessons = await PrayerService.getLessonsByCategory(category);

    res.json({
      success: true,
      data: lessons,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get lessons by category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LESSONS_BY_CATEGORY_ERROR',
        message: error.message || 'Failed to get lessons by category',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/lessons/difficulty/:difficulty
 * Get lessons by difficulty
 */
router.get('/lessons/difficulty/:difficulty', async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.params as any;
    const lessons = await PrayerService.getLessonsByDifficulty(difficulty);

    res.json({
      success: true,
      data: lessons,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get lessons by difficulty error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LESSONS_BY_DIFFICULTY_ERROR',
        message: error.message || 'Failed to get lessons by difficulty',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/search
 * Search lessons
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const lessons = await PrayerService.searchLessons(query);

    res.json({
      success: true,
      data: lessons,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Search lessons error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_LESSONS_ERROR',
        message: error.message || 'Failed to search lessons',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/stats
 * Get prayer statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await PrayerService.getStats();

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Prayer stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRAYER_STATS_ERROR',
        message: error.message || 'Failed to get prayer stats',
      },
    } as ApiResponse);
  }
});

export default router;
