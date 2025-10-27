import mongoose, { Schema, type Model } from 'mongoose';
import type { User, SubscriptionTier, UserRole, Language, Madhab } from '@mubarak-way/shared';

const userSchema = new Schema<User>(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: String,
    firstName: {
      type: String,
      required: true,
    },
    lastName: String,
    photoUrl: String,
    languageCode: String,
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },

    // Subscription
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'pro', 'premium'],
        default: 'free',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      startedAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },

    // Usage limits
    usage: {
      booksOffline: {
        type: Number,
        default: 0,
      },
      booksFavorites: {
        type: Number,
        default: 0,
      },
      nashidsOffline: {
        type: Number,
        default: 0,
      },
      nashidsFavorites: {
        type: Number,
        default: 0,
      },
      aiRequestsPerDay: {
        type: Number,
        default: 0,
      },
      resetDate: {
        type: Date,
        default: () => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          return tomorrow;
        },
      },
    },

    // Preferences
    preferences: {
      language: {
        type: String,
        enum: ['ru', 'en', 'ar'],
        default: 'ru',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      showSimplifiedArabic: {
        type: Boolean,
        default: false,
      },
    },

    // Prayer settings
    prayerSettings: {
      location: {
        latitude: Number,
        longitude: Number,
        city: String,
        country: String,
      },
      calculationMethod: {
        type: String,
        default: 'MuslimWorldLeague',
      },
      madhab: {
        type: String,
        enum: ['hanafi', 'shafi', 'maliki', 'hanbali'],
        default: 'hanafi',
      },
      notifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        beforeMinutes: {
          type: Number,
          default: 10,
        },
      },
    },

    // Progress tracking
    readingProgress: [{
      bookId: Number,
      currentPage: Number,
      totalPages: Number,
      lastRead: Date,
      percentage: Number,
    }],

    learningProgress: [{
      lessonId: String,
      completedSteps: Number,
      totalSteps: Number,
      lastPracticed: Date,
      completed: Boolean,
      mistakes: Number,
    }],

    // Favorites & Bookmarks
    favorites: {
      books: {
        type: [Number],
        default: [],
      },
      nashids: {
        type: [Number],
        default: [],
      },
      ayahs: {
        type: [String],
        default: [],
      },
      lessons: {
        type: [String],
        default: [],
      },
    },

    offline: {
      books: {
        type: [Number],
        default: [],
      },
      nashids: {
        type: [Number],
        default: [],
      },
    },

    // Streaks & Achievements
    streaks: {
      currentDays: {
        type: Number,
        default: 0,
      },
      longestDays: {
        type: Number,
        default: 0,
      },
      lastActivityDate: Date,
    },

    achievements: {
      type: [String],
      default: [],
    },

    savedDuas: [{
      id: String,
      text: String,
      translation: String,
      source: String,
      savedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Search history
    searchHistory: [{
      query: String,
      type: {
        type: String,
        enum: ['quran', 'library', 'prayer'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      favorite: Boolean,
    }],

    // Onboarding
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ telegramId: 1 });
userSchema.index({ 'subscription.tier': 1 });
userSchema.index({ lastActive: -1 });

// Methods
userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.resetUsageLimits = function() {
  const now = new Date();
  if (this.usage.resetDate <= now) {
    this.usage.aiRequestsPerDay = 0;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    this.usage.resetDate = tomorrow;
    return this.save();
  }
  return this;
};

// Clean expired search history based on subscription tier
// Free users: 1 day TTL
// Pro/Premium users: 30 days TTL
// Favorite items: never expire
userSchema.methods.cleanSearchHistory = function() {
  const now = new Date();
  const tier = this.subscription?.tier || 'free';

  // TTL based on subscription
  const ttlDays = tier === 'free' ? 1 : 30;
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(now.getTime() - ttlMs);

  // Keep only:
  // 1. Favorites (never expire)
  // 2. Recent items within TTL
  this.searchHistory = this.searchHistory.filter((item: any) => {
    return item.favorite || item.timestamp >= cutoffDate;
  });

  return this.save();
};

// Toggle search history item as favorite (makes it permanent)
userSchema.methods.toggleSearchFavorite = function(searchId: string) {
  const item = this.searchHistory.id(searchId);
  if (item) {
    item.favorite = !item.favorite;
    return this.save();
  }
  return this;
};

// Clear non-favorite search history
userSchema.methods.clearSearchHistory = function() {
  this.searchHistory = this.searchHistory.filter((item: any) => item.favorite);
  return this.save();
};

// Static methods
userSchema.statics.findByTelegramId = function(telegramId: string) {
  return this.findOne({ telegramId });
};

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
