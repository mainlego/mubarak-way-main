import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import Nashid from '../models/Nashid.js';
import type { ApiResponse } from '@mubarak-way/shared';

const router = Router();

/**
 * POST /api/v1/user/nashids/favorite
 * Toggle nashid in favorites with limit checking
 */
router.post('/nashids/favorite', async (req: Request, res: Response) => {
  try {
    const { telegramId, nashidId } = req.body;

    if (!telegramId || !nashidId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'telegramId and nashidId are required',
        },
      } as ApiResponse);
    }

    // Find user
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    // Get nashid to check category
    const nashid = await Nashid.findOne({ nashidId });
    if (!nashid) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NASHID_NOT_FOUND',
          message: 'Nashid not found',
        },
      } as ApiResponse);
    }

    const favorites = user.favorites?.nashids || [];
    const isCurrentlyFavorite = favorites.includes(nashidId);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      user.favorites.nashids = favorites.filter((id: number) => id !== nashidId);
      user.usage.nashidsFavorites = Math.max(0, (user.usage?.nashidsFavorites || 0) - 1);
      await user.decrementCategoryUsage(nashid.category);
      await user.save();

      return res.json({
        success: true,
        data: {
          action: 'removed',
          favorites: user.favorites.nashids,
          usage: {
            current: user.usage.nashidsFavorites,
            limit: user.getSubscriptionLimits().nashidsFavorites,
          },
        },
      } as ApiResponse);
    } else {
      // Check limits before adding
      const canAddFavorite = user.canAddNashidFavorite();
      const canAddFromCategory = user.canAddNashidFromCategory(nashid.category);

      if (!canAddFavorite.canAdd) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FAVORITES_LIMIT_REACHED',
            message: `You have reached your favorites limit (${canAddFavorite.limit})`,
            details: {
              current: canAddFavorite.current,
              limit: canAddFavorite.limit,
              tier: user.subscription?.tier || 'free',
            },
          },
        } as ApiResponse);
      }

      if (!canAddFromCategory.canAdd) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CATEGORY_LIMIT_REACHED',
            message: `You have reached your limit for ${nashid.category} category (${canAddFromCategory.limit} per category)`,
            details: {
              category: nashid.category,
              current: canAddFromCategory.current,
              limit: canAddFromCategory.limit,
              tier: user.subscription?.tier || 'free',
            },
          },
        } as ApiResponse);
      }

      // Add to favorites
      user.favorites.nashids.push(nashidId);
      user.usage.nashidsFavorites = (user.usage?.nashidsFavorites || 0) + 1;
      await user.incrementCategoryUsage(nashid.category);
      await user.save();

      return res.json({
        success: true,
        data: {
          action: 'added',
          favorites: user.favorites.nashids,
          usage: {
            current: user.usage.nashidsFavorites,
            limit: user.getSubscriptionLimits().nashidsFavorites,
            remaining: canAddFavorite.remaining - 1,
          },
          categoryUsage: {
            category: nashid.category,
            current: canAddFromCategory.current + 1,
            limit: canAddFromCategory.limit,
            remaining: canAddFromCategory.remaining - 1,
          },
        },
      } as ApiResponse);
    }
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FAVORITE_ERROR',
        message: error.message || 'Failed to toggle favorite',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/user/nashids/offline
 * Toggle nashid for offline with limit checking
 */
router.post('/nashids/offline', async (req: Request, res: Response) => {
  try {
    const { telegramId, nashidId } = req.body;

    if (!telegramId || !nashidId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'telegramId and nashidId are required',
        },
      } as ApiResponse);
    }

    // Find user
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    // Get nashid to check category
    const nashid = await Nashid.findOne({ nashidId });
    if (!nashid) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NASHID_NOT_FOUND',
          message: 'Nashid not found',
        },
      } as ApiResponse);
    }

    const offline = user.offline?.nashids || [];
    const isCurrentlyOffline = offline.includes(nashidId);

    if (isCurrentlyOffline) {
      // Remove from offline
      user.offline.nashids = offline.filter((id: number) => id !== nashidId);
      user.usage.nashidsOffline = Math.max(0, (user.usage?.nashidsOffline || 0) - 1);
      await user.save();

      return res.json({
        success: true,
        data: {
          action: 'removed',
          offline: user.offline.nashids,
          usage: {
            current: user.usage.nashidsOffline,
            limit: user.getSubscriptionLimits().nashidsOffline,
          },
        },
      } as ApiResponse);
    } else {
      // Check limits before adding
      const canAddOffline = user.canAddNashidOffline();
      const canAddFromCategory = user.canAddNashidFromCategory(nashid.category);

      if (!canAddOffline.canAdd) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'OFFLINE_LIMIT_REACHED',
            message: `You have reached your offline download limit (${canAddOffline.limit})`,
            details: {
              current: canAddOffline.current,
              limit: canAddOffline.limit,
              tier: user.subscription?.tier || 'free',
            },
          },
        } as ApiResponse);
      }

      if (!canAddFromCategory.canAdd) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CATEGORY_LIMIT_REACHED',
            message: `You have reached your limit for ${nashid.category} category (${canAddFromCategory.limit} per category)`,
            details: {
              category: nashid.category,
              current: canAddFromCategory.current,
              limit: canAddFromCategory.limit,
              tier: user.subscription?.tier || 'free',
            },
          },
        } as ApiResponse);
      }

      // Add to offline
      user.offline.nashids.push(nashidId);
      user.usage.nashidsOffline = (user.usage?.nashidsOffline || 0) + 1;
      await user.save();

      return res.json({
        success: true,
        data: {
          action: 'added',
          offline: user.offline.nashids,
          usage: {
            current: user.usage.nashidsOffline,
            limit: user.getSubscriptionLimits().nashidsOffline,
            remaining: canAddOffline.remaining - 1,
          },
          categoryUsage: {
            category: nashid.category,
            current: canAddFromCategory.current + 1,
            limit: canAddFromCategory.limit,
            remaining: canAddFromCategory.remaining - 1,
          },
        },
      } as ApiResponse);
    }
  } catch (error: any) {
    console.error('Toggle offline error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OFFLINE_ERROR',
        message: error.message || 'Failed to toggle offline',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/user/:telegramId/nashids/favorites
 * Get user's favorite nashids
 */
router.get('/:telegramId/nashids/favorites', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;

    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    const favoriteIds = user.favorites?.nashids || [];
    const nashids = await Nashid.find({ nashidId: { $in: favoriteIds } });

    res.json({
      success: true,
      data: {
        nashids,
        usage: {
          current: user.usage?.nashidsFavorites || 0,
          limit: user.getSubscriptionLimits().nashidsFavorites,
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FAVORITES_ERROR',
        message: error.message || 'Failed to get favorites',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/user/:telegramId/nashids/offline
 * Get user's offline nashids
 */
router.get('/:telegramId/nashids/offline', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;

    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    const offlineIds = user.offline?.nashids || [];
    const nashids = await Nashid.find({ nashidId: { $in: offlineIds } });

    res.json({
      success: true,
      data: {
        nashids,
        usage: {
          current: user.usage?.nashidsOffline || 0,
          limit: user.getSubscriptionLimits().nashidsOffline,
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get offline error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_OFFLINE_ERROR',
        message: error.message || 'Failed to get offline nashids',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/user/:telegramId/usage
 * Get user's usage statistics
 */
router.get('/:telegramId/usage', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;

    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    const limits = user.getSubscriptionLimits();
    const usage = user.usage || {};

    res.json({
      success: true,
      data: {
        tier: user.subscription?.tier || 'free',
        usage: {
          booksOffline: usage.booksOffline || 0,
          booksFavorites: usage.booksFavorites || 0,
          nashidsOffline: usage.nashidsOffline || 0,
          nashidsFavorites: usage.nashidsFavorites || 0,
          nashidsByCategory: Object.fromEntries(usage.nashidsByCategory || new Map()),
          aiRequestsPerDay: usage.aiRequestsPerDay || 0,
        },
        limits,
        remaining: {
          booksOffline: limits.booksOffline === -1 ? -1 : Math.max(0, limits.booksOffline - (usage.booksOffline || 0)),
          booksFavorites: limits.booksFavorites === -1 ? -1 : Math.max(0, limits.booksFavorites - (usage.booksFavorites || 0)),
          nashidsOffline: limits.nashidsOffline === -1 ? -1 : Math.max(0, limits.nashidsOffline - (usage.nashidsOffline || 0)),
          nashidsFavorites: limits.nashidsFavorites === -1 ? -1 : Math.max(0, limits.nashidsFavorites - (usage.nashidsFavorites || 0)),
          aiRequestsPerDay: limits.aiRequestsPerDay === -1 ? -1 : Math.max(0, limits.aiRequestsPerDay - (usage.aiRequestsPerDay || 0)),
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USAGE_ERROR',
        message: error.message || 'Failed to get usage statistics',
      },
    } as ApiResponse);
  }
});

export default router;
