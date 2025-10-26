/**
 * Subscription & Payment Types
 */

import { SubscriptionTier } from './user';

export interface SubscriptionPlan {
  _id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;

  price: {
    amount: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };

  limits: {
    booksOffline: number;        // -1 for unlimited
    booksFavorites: number;
    nashidsOffline: number;
    nashidsFavorites: number;
    aiRequestsPerDay: number;
  };

  access: {
    freeContent: boolean;
    proContent: boolean;
    premiumContent: boolean;
    exclusiveContent: boolean;
  };

  features: {
    notes: boolean;
    sync: boolean;
    backgroundAudio: boolean;
    advancedSearch: boolean;
    offlineMode: boolean;
    familyAccess: boolean;
    prioritySupport: boolean;
    earlyAccess: boolean;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeatures {
  // Quran Module
  quran: {
    fullAccess: boolean;
    allTranslations: boolean;
    audioRecitations: boolean;
    aiFeatures: boolean;
    searchHistory: boolean;
  };

  // Library Module
  library: {
    catalogAccess: number;  // percentage (40, 100)
    offlineDownloads: number;  // -1 for unlimited
    nashidAccess: number;
  };

  // Prayer Module
  prayer: {
    allLessons: boolean;
    advancedLessons: boolean;
    prayerTimes: boolean;
    qiblaDirection: boolean;
  };

  // AI Features
  ai: {
    requestsPerDay: number;  // -1 for unlimited
    smartSearch: boolean;
    explanations: boolean;
    recommendations: boolean;
  };

  // General Features
  general: {
    offlineMode: boolean;
    backgroundAudio: boolean;
    notes: boolean;
    sync: boolean;
    familyAccess: boolean;
  };
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'telegram-stars' | 'stripe' | 'manual';
  transactionId: string;
  subscriptionTier: SubscriptionTier;
  subscriptionPeriod: 'monthly' | 'yearly';
  createdAt: Date;
  completedAt?: Date;
}
