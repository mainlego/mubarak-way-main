import { Router } from 'express';
import { SearchHistoryService } from '../services/SearchHistoryService.js';
import { validateTelegramAuth } from '../middlewares/auth.js';

const router = Router();

/**
 * POST /api/v1/search-history
 * Create or update search history entry
 */
router.post('/', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { query, type, source, context, resultsCount } = req.body;

    if (!query || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query and type are required',
        },
      });
    }

    const search = await SearchHistoryService.createOrUpdateSearch(userId, {
      query,
      type,
      source,
      context,
      resultsCount,
    });

    res.status(201).json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error creating search history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create search history',
      },
    });
  }
});

/**
 * GET /api/v1/search-history
 * Get user's search history with optional filters
 */
router.get('/', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { type, source, favorite, limit, skip } = req.query;

    const searches = await SearchHistoryService.getUserSearchHistory(userId, {
      type: type as any,
      source: source as any,
      favorite: favorite === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    res.json({
      success: true,
      data: searches,
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch search history',
      },
    });
  }
});

/**
 * GET /api/v1/search-history/suggestions
 * Get search suggestions based on query
 */
router.get('/suggestions', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { query, type, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query is required',
        },
      });
    }

    const suggestions = await SearchHistoryService.getSearchSuggestions(
      userId,
      query as string,
      type as any,
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch search suggestions',
      },
    });
  }
});

/**
 * GET /api/v1/search-history/stats
 * Get search history statistics
 */
router.get('/stats', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const stats = await SearchHistoryService.getSearchStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching search stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch search statistics',
      },
    });
  }
});

/**
 * GET /api/v1/search-history/:id
 * Get single search history entry
 */
router.get('/:id', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;

    const search = await SearchHistoryService.getSearchById(id, userId);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error fetching search history entry:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch search history entry',
      },
    });
  }
});

/**
 * PUT /api/v1/search-history/:id
 * Update search history entry
 */
router.put('/:id', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { favorite, tags, clicked, clickedResultId } = req.body;

    const search = await SearchHistoryService.updateSearch(id, userId, {
      favorite,
      tags,
      clicked,
      clickedResultId,
    });

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error updating search history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update search history',
      },
    });
  }
});

/**
 * DELETE /api/v1/search-history/:id
 * Delete search history entry
 */
router.delete('/:id', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;

    const deleted = await SearchHistoryService.deleteSearch(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting search history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete search history',
      },
    });
  }
});

/**
 * DELETE /api/v1/search-history
 * Clear all search history (except favorites by default)
 */
router.delete('/', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { type, keepFavorites = 'true' } = req.query;

    const deletedCount = await SearchHistoryService.clearHistory(userId, {
      type: type as any,
      keepFavorites: keepFavorites === 'true',
    });

    res.json({
      success: true,
      data: { deletedCount },
    });
  } catch (error) {
    console.error('Error clearing search history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear search history',
      },
    });
  }
});

/**
 * POST /api/v1/search-history/:id/favorite
 * Toggle favorite status
 */
router.post('/:id/favorite', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;

    const search = await SearchHistoryService.toggleFavorite(id, userId);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to toggle favorite',
      },
    });
  }
});

/**
 * POST /api/v1/search-history/:id/tags
 * Add tag to search history
 */
router.post('/:id/tags', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { tag } = req.body;

    if (!tag) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tag is required',
        },
      });
    }

    const search = await SearchHistoryService.addTag(id, userId, tag);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add tag',
      },
    });
  }
});

/**
 * DELETE /api/v1/search-history/:id/tags/:tag
 * Remove tag from search history
 */
router.delete('/:id/tags/:tag', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id, tag } = req.params;

    const search = await SearchHistoryService.removeTag(id, userId, decodeURIComponent(tag));

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to remove tag',
      },
    });
  }
});

/**
 * POST /api/v1/search-history/:id/click
 * Record search result click
 */
router.post('/:id/click', validateTelegramAuth, async (req, res) => {
  try {
    const userId = req.telegramUser!.id.toString();
    const { id } = req.params;
    const { resultId } = req.body;

    if (!resultId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Result ID is required',
        },
      });
    }

    const search = await SearchHistoryService.recordClick(id, userId, resultId);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Search history entry not found',
        },
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to record click',
      },
    });
  }
});

export default router;
