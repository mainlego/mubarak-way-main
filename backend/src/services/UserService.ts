import User from '../models/User.js';
import type { User as UserType, UserCreateDto, UserUpdateDto } from '@mubarak-way/shared';

// Helper function to calculate subscription limits based on tier
function getSubscriptionLimits(tier: 'free' | 'pro' | 'premium') {
  switch (tier) {
    case 'free':
      return { aiRequests: 5, offlineBooks: 3, offlineNashids: 5 };
    case 'pro':
      return { aiRequests: 50, offlineBooks: 20, offlineNashids: 30 };
    case 'premium':
      return { aiRequests: -1, offlineBooks: -1, offlineNashids: -1 }; // Unlimited
    default:
      return { aiRequests: 5, offlineBooks: 3, offlineNashids: 5 };
  }
}

// Helper function to add backwards compatibility fields
function addUserAliases(user: any): UserType {
  const limits = getSubscriptionLimits(user.subscription?.tier || 'free');

  // Convert readingProgress array to legacy nested structure
  const readingHistory = {
    books: user.readingProgress?.filter((p: any) => p.bookId) || [],
    quran: user.readingProgress?.filter((p: any) => p.surahNumber) || [],
  };

  // Convert learningProgress array to legacy nested structure
  const completedLessons = user.learningProgress?.filter((p: any) => p.completed).map((p: any) => p.lessonId) || [];
  const lessonProgress: any = {};
  user.learningProgress?.forEach((p: any) => {
    lessonProgress[p.lessonId] = {
      completedSteps: p.completedSteps,
      totalSteps: p.totalSteps,
      lastPracticed: p.lastPracticed,
    };
  });

  const progress = {
    completedLessons,
    lessonProgress,
    currentStreak: user.streaks?.currentDays || 0,
    longestStreak: user.streaks?.longestDays || 0,
  };

  return {
    ...user,
    id: user._id?.toString() || user._id,
    readingHistory,
    progress,
    subscription: {
      ...user.subscription,
      limits,
    },
    usage: {
      ...user.usage,
      aiRequests: user.usage?.aiRequestsPerDay || 0,
    },
  };
}

export class UserService {
  /**
   * Find user by Telegram ID
   */
  static async findByTelegramId(telegramId: string): Promise<UserType | null> {
    const user = await User.findOne({ telegramId }).lean();
    return user ? addUserAliases(user) : null;
  }

  /**
   * Create new user from Telegram data
   */
  static async createUser(data: UserCreateDto): Promise<UserType> {
    const user = new User({
      telegramId: data.telegramId,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      photoUrl: data.photoUrl,
      languageCode: data.languageCode,
      onboardingCompleted: false,
    });

    await user.save();
    const saved = await User.findById(user._id).lean();
    return addUserAliases(saved);
  }

  /**
   * Find or create user (used in login)
   */
  static async findOrCreate(telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }): Promise<UserType> {
    const telegramId = telegramData.id.toString();

    // Check if user exists (without .lean() so we can use .save())
    let userDoc = await User.findOne({ telegramId });

    if (!userDoc) {
      // Create new user
      return await this.createUser({
        telegramId,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        username: telegramData.username,
        photoUrl: telegramData.photo_url,
        languageCode: telegramData.language_code,
      });
    } else {
      // Update existing user data
      userDoc.firstName = telegramData.first_name;
      userDoc.lastName = telegramData.last_name;
      userDoc.username = telegramData.username;
      userDoc.photoUrl = telegramData.photo_url;
      userDoc.languageCode = telegramData.language_code;
      userDoc.lastActive = new Date();
      await userDoc.save();

      // Return with aliases
      const saved = await User.findById(userDoc._id).lean();
      return addUserAliases(saved);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUser(telegramId: string, updates: UserUpdateDto): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences };
    }

    if (updates.prayerSettings) {
      user.prayerSettings = { ...user.prayerSettings, ...updates.prayerSettings };
    }

    if (updates.onboardingCompleted !== undefined) {
      user.onboardingCompleted = updates.onboardingCompleted;
    }

    user.lastActive = new Date();
    await user.save();

    const updated = await User.findById(user._id).lean();
    return updated ? addUserAliases(updated) : null;
  }

  /**
   * Update user activity
   */
  static async updateActivity(telegramId: string): Promise<void> {
    await User.updateOne({ telegramId }, { lastActive: new Date() });
  }

  /**
   * Add item to favorites
   */
  static async addFavorite(
    telegramId: string,
    type: 'books' | 'nashids' | 'ayahs' | 'lessons',
    itemId: string | number
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    const favorites = user.favorites[type] as any[];
    if (!favorites.includes(itemId)) {
      favorites.push(itemId);
      await user.save();
    }

    return user;
  }

  /**
   * Remove item from favorites
   */
  static async removeFavorite(
    telegramId: string,
    type: 'books' | 'nashids' | 'ayahs' | 'lessons',
    itemId: string | number
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    const favorites = user.favorites[type] as any[];
    const index = favorites.indexOf(itemId);
    if (index > -1) {
      favorites.splice(index, 1);
      await user.save();
    }

    return user;
  }

  /**
   * Add item to offline
   */
  static async addOffline(
    telegramId: string,
    type: 'books' | 'nashids',
    itemId: number
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    // Check subscription limits
    const limit = this.getOfflineLimit(user.subscription.tier, type);
    const currentCount = user.offline[type].length;

    if (limit !== -1 && currentCount >= limit) {
      throw new Error('OFFLINE_LIMIT_REACHED');
    }

    if (!user.offline[type].includes(itemId)) {
      user.offline[type].push(itemId);
      user.usage[type === 'books' ? 'booksOffline' : 'nashidsOffline']++;
      await user.save();
    }

    return user;
  }

  /**
   * Remove item from offline
   */
  static async removeOffline(
    telegramId: string,
    type: 'books' | 'nashids',
    itemId: number
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    const index = user.offline[type].indexOf(itemId);
    if (index > -1) {
      user.offline[type].splice(index, 1);
      user.usage[type === 'books' ? 'booksOffline' : 'nashidsOffline']--;
      await user.save();
    }

    return user;
  }

  /**
   * Get offline limit based on subscription tier
   */
  private static getOfflineLimit(tier: string, type: 'books' | 'nashids'): number {
    const limits: Record<string, Record<string, number>> = {
      free: { books: 2, nashids: 5 },
      pro: { books: -1, nashids: -1 },
      premium: { books: -1, nashids: -1 },
    };

    return limits[tier]?.[type] ?? 0;
  }

  /**
   * Update reading progress
   */
  static async updateReadingProgress(
    telegramId: string,
    bookId: number,
    currentPage: number,
    totalPages: number
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    const progressIndex = user.readingProgress.findIndex((p) => p.bookId === bookId);
    const percentage = Math.round((currentPage / totalPages) * 100);

    if (progressIndex > -1) {
      user.readingProgress[progressIndex] = {
        bookId,
        currentPage,
        totalPages,
        lastRead: new Date(),
        percentage,
      };
    } else {
      user.readingProgress.push({
        bookId,
        currentPage,
        totalPages,
        lastRead: new Date(),
        percentage,
      });
    }

    await user.save();
    return user;
  }

  /**
   * Update learning progress
   */
  static async updateLearningProgress(
    telegramId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number,
    mistakes: number = 0
  ): Promise<UserType | null> {
    const user = await User.findOne({ telegramId });
    if (!user) return null;

    const progressIndex = user.learningProgress.findIndex((p) => p.lessonId === lessonId);
    const completed = completedSteps >= totalSteps;

    if (progressIndex > -1) {
      user.learningProgress[progressIndex] = {
        lessonId,
        completedSteps,
        totalSteps,
        lastPracticed: new Date(),
        completed,
        mistakes,
      };
    } else {
      user.learningProgress.push({
        lessonId,
        completedSteps,
        totalSteps,
        lastPracticed: new Date(),
        completed,
        mistakes,
      });
    }

    await user.save();
    return user;
  }

  /**
   * Reset daily usage limits
   */
  static async resetDailyLimits(telegramId: string): Promise<void> {
    const user = await User.findOne({ telegramId });
    if (!user) return;

    const now = new Date();
    if (user.usage.resetDate <= now) {
      user.usage.aiRequestsPerDay = 0;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      user.usage.resetDate = tomorrow;
      await user.save();
    }
  }
}
