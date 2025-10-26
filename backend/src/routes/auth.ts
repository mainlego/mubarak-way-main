import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';
import { validateTelegramAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import type { ApiResponse, LoginResponse, UserUpdateDto } from '@mubarak-way/shared';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Login or register user via Telegram
 */
router.post('/login', authLimiter, validateTelegramAuth, async (req: Request, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Telegram authentication required',
        },
      } as ApiResponse);
    }

    const { user } = await AuthService.authenticateWithTelegram(req.telegramUser);

    res.json({
      success: true,
      data: { user },
    } as ApiResponse<LoginResponse>);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: error.message || 'Failed to login',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/auth/user/:telegramId
 * Get user by Telegram ID
 */
router.get('/user/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    const user = await UserService.findByTelegramId(telegramId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: error.message || 'Failed to get user',
      },
    } as ApiResponse);
  }
});

/**
 * PUT /api/v1/auth/user/:telegramId
 * Update user preferences
 */
router.put('/user/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    const updates: UserUpdateDto = req.body;

    const user = await UserService.updateUser(telegramId, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_USER_ERROR',
        message: error.message || 'Failed to update user',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/auth/onboarding/:telegramId
 * Complete onboarding
 */
router.post('/onboarding/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;

    const user = await UserService.updateUser(telegramId, {
      onboardingCompleted: true,
      preferences: req.body.preferences,
      prayerSettings: req.body.prayerSettings,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ONBOARDING_ERROR',
        message: error.message || 'Failed to complete onboarding',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/auth/favorites/:telegramId
 * Add/remove favorite
 */
router.post('/favorites/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    const { type, itemId, action } = req.body;

    let user;
    if (action === 'add') {
      user = await UserService.addFavorite(telegramId, type, itemId);
    } else if (action === 'remove') {
      user = await UserService.removeFavorite(telegramId, type, itemId);
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Action must be "add" or "remove"',
        },
      } as ApiResponse);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { favorites: user.favorites },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FAVORITES_ERROR',
        message: error.message || 'Failed to update favorites',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/auth/offline/:telegramId
 * Add/remove offline content
 */
router.post('/offline/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    const { type, itemId, action } = req.body;

    let user;
    if (action === 'add') {
      user = await UserService.addOffline(telegramId, type, itemId);
    } else if (action === 'remove') {
      user = await UserService.removeOffline(telegramId, type, itemId);
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Action must be "add" or "remove"',
        },
      } as ApiResponse);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: { offline: user.offline, usage: user.usage },
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'OFFLINE_LIMIT_REACHED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'OFFLINE_LIMIT_REACHED',
          message: 'Offline download limit reached. Please upgrade your subscription.',
        },
      } as ApiResponse);
    }

    console.error('Offline error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OFFLINE_ERROR',
        message: error.message || 'Failed to update offline content',
      },
    } as ApiResponse);
  }
});

export default router;
