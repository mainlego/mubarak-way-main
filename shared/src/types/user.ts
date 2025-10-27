/**
 * User and Authentication Types
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type UserRole = 'user' | 'admin' | 'moderator';

export type Language = 'ru' | 'en' | 'ar';

export type Madhab = 'hanafi' | 'shafi' | 'maliki' | 'hanbali';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface Subscription {
  tier: SubscriptionTier;
  isActive: boolean;
  startedAt: Date;
  expiresAt?: Date;
  autoRenew?: boolean;

  // Backwards compatibility
  limits?: {
    aiRequests: number;
    offlineBooks: number;
    offlineNashids: number;
  };
}

export interface UsageLimits {
  booksOffline: number;
  booksFavorites: number;
  nashidsOffline: number;
  nashidsFavorites: number;
  aiRequestsPerDay: number;
  resetDate: Date;

  // Backwards compatibility
  aiRequests?: number; // Same as aiRequestsPerDay
}

export interface PrayerSettings {
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  calculationMethod: string;
  madhab: Madhab;
  notifications: {
    enabled: boolean;
    beforeMinutes: number;
  };
}

export interface UserPreferences {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  showSimplifiedArabic: boolean;
}

export interface ReadingProgress {
  bookId: number;
  currentPage: number;
  totalPages: number;
  lastRead: Date;
  percentage: number;
}

export interface LearningProgress {
  lessonId: string;
  completedSteps: number;
  totalSteps: number;
  lastPracticed: Date;
  completed: boolean;
  mistakes: number;
}

export interface User {
  _id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  role: UserRole;

  // Subscription
  subscription: Subscription;
  usage: UsageLimits;

  // Preferences
  preferences: UserPreferences;
  prayerSettings: PrayerSettings;

  // Progress
  readingProgress: ReadingProgress[];
  learningProgress: LearningProgress[];

  // Favorites & Bookmarks
  favorites: {
    books: number[];
    nashids: number[];
    ayahs: string[];  // Format: "surah:ayah"
    lessons: string[];
  };

  offline: {
    books: number[];
    nashids: number[];
  };

  // Streaks & Achievements
  streaks: {
    currentDays: number;
    longestDays: number;
    lastActivityDate: Date;
  };

  achievements: string[];
  savedDuas: Array<{
    id: string;
    text: string;
    translation?: string;
    source: string;
    savedAt: Date;
  }>;

  // Search History
  searchHistory: Array<{
    query: string;
    type: 'quran' | 'library' | 'prayer';
    timestamp: Date;
    favorite?: boolean;
  }>;

  // Onboarding
  onboardingCompleted: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;

  // Aliases for backwards compatibility
  id?: string; // Same as _id
  readingHistory?: any; // Legacy nested structure {books: [], quran: []}
  progress?: any; // Legacy nested structure {completedLessons: [], lessonProgress: {}, currentStreak: 0}
}

export interface UserCreateDto {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

export interface UserUpdateDto {
  preferences?: Partial<UserPreferences>;
  prayerSettings?: Partial<PrayerSettings>;
  onboardingCompleted?: boolean;
}
