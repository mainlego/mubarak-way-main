import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserService } from './UserService.js';
import type { User } from '@mubarak-way/shared';

export class AuthService {
  /**
   * Authenticate user via Telegram data
   */
  static async authenticateWithTelegram(telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }): Promise<{ user: User }> {
    const user = await UserService.findOrCreate(telegramData);
    await UserService.resetDailyLimits(user.telegramId);

    return { user };
  }

  /**
   * Generate JWT token (for admin authentication)
   */
  static generateToken(payload: {
    id: string;
    telegramId: string;
    role: string;
  }): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  }
}
