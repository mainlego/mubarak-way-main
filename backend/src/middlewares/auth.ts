import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Validate Telegram WebApp initData signature
 */
export const validateTelegramAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-initdata'] as string;

    if (!initData) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Telegram authentication required',
        },
      });
    }

    // In development, skip validation if no bot token
    if (config.nodeEnv === 'development' && !config.telegramBotToken) {
      console.warn('⚠️ Skipping Telegram auth validation in development mode');
      return next();
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Sort params
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    // Verify hash
    if (hash !== calculatedHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH',
          message: 'Invalid Telegram authentication',
        },
      });
    }

    // Check auth_date (not older than 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_EXPIRED',
          message: 'Authentication expired',
        },
      });
    }

    // Parse user data
    const userData = JSON.parse(params.get('user') || '{}');
    req.telegramUser = userData;

    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Validate JWT token (for admin authentication)
 */
export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'JWT token required',
        },
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

/**
 * Check if user is admin (for JWT-based auth)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }
  next();
};

/**
 * Check if Telegram user has admin role in database
 * Must be used after validateTelegramAuth
 */
export const requireTelegramAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // Import User model dynamically to avoid circular dependencies
    const { default: UserModel } = await import('../models/User.js');

    const user = await UserModel.findOne({ telegramId: req.telegramUser.id.toString() });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User not found',
        },
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    }

    // Attach user to request for later use
    req.user = {
      id: user._id.toString(),
      telegramId: user.telegramId,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify admin access',
      },
    });
  }
};

/**
 * Check if Telegram user has moderator or admin role
 */
export const requireModerator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { default: UserModel } = await import('../models/User.js');

    const user = await UserModel.findOne({ telegramId: req.telegramUser.id.toString() });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User not found',
        },
      });
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Moderator or admin access required',
        },
      });
    }

    req.user = {
      id: user._id.toString(),
      telegramId: user.telegramId,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Moderator check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify moderator access',
      },
    });
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      telegramUser?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        photo_url?: string;
      };
      user?: {
        id: string;
        telegramId: string;
        role: string;
      };
    }
  }
}
