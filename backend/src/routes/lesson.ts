import { Router } from 'express';
import { LessonService } from '../services/LessonService.js';
import { validateTelegramAuth } from '../middlewares/auth.js';
import type { LessonCategory, DifficultyLevel } from '@mubarak-way/shared';

const router = Router();

/**
 * GET /api/v1/lessons
 * Get lessons with filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      madhab,
      difficulty,
      accessLevel,
      isFeatured,
      isPublished,
      search,
      limit,
      skip,
    } = req.query;

    const filters = {
      category: category as LessonCategory,
      madhab: madhab as any,
      difficulty: difficulty as DifficultyLevel,
      accessLevel: accessLevel as any,
      isFeatured: isFeatured === 'true',
      isPublished: isPublished !== 'false', // Default to true
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    };

    const lessons = await LessonService.getLessons(filters);

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/stats
 * Get lesson statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await LessonService.getLessonStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lesson statistics',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/featured
 * Get featured lessons
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit } = req.query;
    const lessons = await LessonService.getFeaturedLessons(
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching featured lessons:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch featured lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/madhab/:madhab
 * Get lessons by madhab
 */
router.get('/madhab/:madhab', async (req, res) => {
  try {
    const { madhab } = req.params;
    const { category, difficulty, limit, skip } = req.query;

    if (!['hanafi', 'shafi', 'maliki', 'hanbali', 'general'].includes(madhab)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid madhab',
        },
      });
    }

    const lessons = await LessonService.getLessonsByMadhab(madhab as any, {
      category: category as LessonCategory,
      difficulty: difficulty as DifficultyLevel,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching lessons by madhab:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/category/:category
 * Get lessons by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { madhab, difficulty, limit, skip } = req.query;

    const lessons = await LessonService.getLessonsByCategory(category as LessonCategory, {
      madhab: madhab as any,
      difficulty: difficulty as DifficultyLevel,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching lessons by category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/recommended
 * Get recommended lessons for user
 */
router.get('/recommended', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { limit } = req.query;

    // Get user from database
    const { default: UserModel } = await import('../models/User.js');
    const user = await UserModel.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const lessons = await LessonService.getRecommendedLessons(
      user._id.toString(),
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching recommended lessons:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch recommended lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/search
 * Search lessons
 */
router.get('/search', async (req, res) => {
  try {
    const { q, madhab, category, difficulty, limit, skip } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required',
        },
      });
    }

    const lessons = await LessonService.searchLessons(q as string, {
      madhab: madhab as any,
      category: category as LessonCategory,
      difficulty: difficulty as DifficultyLevel,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search lessons',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/:slug
 * Get single lesson by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const lesson = await LessonService.getLessonBySlug(slug);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        },
      });
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lesson',
      },
    });
  }
});

/**
 * GET /api/v1/lessons/:id/progress
 * Get user's progress for a lesson
 */
router.get('/:id/progress', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;

    // Get user from database
    const { default: UserModel } = await import('../models/User.js');
    const user = await UserModel.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const progress = await LessonService.getUserProgress(user._id.toString(), id);

    res.json({
      success: true,
      data: progress || { lessonId: id, completedSteps: 0, totalSteps: 0, completed: false },
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch lesson progress',
      },
    });
  }
});

/**
 * PUT /api/v1/lessons/:id/progress
 * Update user's progress for a lesson
 */
router.put('/:id/progress', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { completedSteps, totalSteps } = req.body;

    if (
      completedSteps === undefined ||
      totalSteps === undefined ||
      completedSteps < 0 ||
      totalSteps < 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid completedSteps and totalSteps are required',
        },
      });
    }

    // Get user from database
    const { default: UserModel } = await import('../models/User.js');
    const user = await UserModel.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const progress = await LessonService.updateUserProgress(
      user._id.toString(),
      id,
      completedSteps,
      totalSteps
    );

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update lesson progress',
      },
    });
  }
});

/**
 * POST /api/v1/lessons/:id/rate
 * Rate a lesson
 */
router.post('/:id/rate', validateTelegramAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 0 and 5',
        },
      });
    }

    const lesson = await LessonService.rateLesson(id, rating);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        },
      });
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Error rating lesson:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to rate lesson',
      },
    });
  }
});

export default router;
