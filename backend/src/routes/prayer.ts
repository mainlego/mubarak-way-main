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
 * GET /api/v1/prayer/lessons/featured
 * Get featured lessons
 * IMPORTANT: Must be before /:slug route to avoid conflict
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

/**
 * POST /api/v1/prayer/times
 * Calculate prayer times for a location
 * Body: { latitude, longitude, date?, calculationMethod?, madhab?, city?, country? }
 */
router.post('/times', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, date, calculationMethod, madhab, highLatitudeRule, adjustments, city, country } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCATION',
          message: 'Latitude and longitude are required',
        },
      } as ApiResponse);
    }

    const prayerDate = date ? new Date(date) : new Date();
    const params = {
      calculationMethod: calculationMethod || 'MuslimWorldLeague',
      madhab: madhab || 'hanafi',
      highLatitudeRule,
      adjustments,
    };

    const times = PrayerService.calculatePrayerTimes(
      parseFloat(latitude),
      parseFloat(longitude),
      prayerDate,
      params,
      city,
      country
    );

    res.json({
      success: true,
      data: times,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Calculate prayer times error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRAYER_TIMES_ERROR',
        message: error.message || 'Failed to calculate prayer times',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/prayer/times/methods
 * Get all available calculation methods
 */
router.get('/times/methods', async (req: Request, res: Response) => {
  try {
    const methods = PrayerService.getCalculationMethods();

    res.json({
      success: true,
      data: methods,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get calculation methods error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_METHODS_ERROR',
        message: error.message || 'Failed to get calculation methods',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/prayer/qibla
 * Calculate Qibla direction
 * Body: { latitude, longitude }
 */
router.post('/qibla', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCATION',
          message: 'Latitude and longitude are required',
        },
      } as ApiResponse);
    }

    const qibla = PrayerService.calculateQiblaDirection(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    res.json({
      success: true,
      data: qibla,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Calculate Qibla error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QIBLA_ERROR',
        message: error.message || 'Failed to calculate Qibla direction',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/prayer/seed-lessons?secret=YOUR_SECRET
 * Seed database with prayer lessons
 * Temporary endpoint for initial data population
 */
router.post('/seed-lessons', async (req: Request, res: Response) => {
  try {
    // Simple secret key protection
    const secret = req.query.secret as string;
    const expectedSecret = process.env.IMPORT_SECRET || 'mubarak-way-import-2025';

    if (secret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid secret key',
        },
      } as ApiResponse);
    }

    console.log('📥 Starting lessons seeding...');

    const Lesson = (await import('../models/Lesson.js')).default;
    const { prayerLessons } = await import('../data/prayerLessonsData.js');

    // Clear existing lessons
    console.log('🗑️  Clearing existing lessons...');
    await Lesson.deleteMany({});
    console.log('✅ Existing lessons cleared');

    // Insert all lessons
    console.log('📚 Inserting prayer lessons...');
    await Lesson.insertMany(prayerLessons);
    console.log(`✅ Inserted ${prayerLessons.length} lessons`);

    // Get stats by category
    const stats = {
      total: prayerLessons.length,
      byCategory: {
        obligatoryPrayers: prayerLessons.filter(l => l.category === 'obligatory-prayers').length,
        optionalPrayers: prayerLessons.filter(l => l.category === 'optional-prayers').length,
        specialPrayers: prayerLessons.filter(l => l.category === 'special-prayers').length,
        ablution: prayerLessons.filter(l => l.category === 'ablution').length,
      },
      byDifficulty: {
        beginner: prayerLessons.filter(l => l.difficulty === 'beginner').length,
        intermediate: prayerLessons.filter(l => l.difficulty === 'intermediate').length,
        advanced: prayerLessons.filter(l => l.difficulty === 'advanced').length,
      },
    };

    console.log('✅ Lessons seeding completed successfully!');

    res.json({
      success: true,
      message: 'Prayer lessons seeded successfully',
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEED_ERROR',
        message: 'Failed to seed lessons: ' + error.message,
      },
    } as ApiResponse);
  }
});

export default router;
