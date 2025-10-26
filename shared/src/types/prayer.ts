/**
 * Prayer Module Types (Learning, Times, Qibla)
 */

import type { AccessLevel } from './library.js';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'witr';

export type PrayerType = 'obligatory' | 'optional' | 'special';

export type LessonCategory =
  | 'obligatory-prayers'
  | 'optional-prayers'
  | 'special-prayers'
  | 'ablution';

export type PrayerCalculationMethod =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'NorthAmerica';

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface PrayerStep {
  id: string;
  title: string;
  titleArabic?: string;
  description: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  audioUrl?: string;
  imageUrl?: string;
  madhab?: {
    hanafi?: string;
    shafi?: string;
    maliki?: string;
    hanbali?: string;
  };
  order: number;
}

export interface Lesson {
  _id: string;
  slug: string;
  title: string;
  titleArabic?: string;
  description: string;
  category: LessonCategory;
  prayerType?: PrayerType;
  prayerName?: PrayerName;

  cover?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;

  sections: LessonSection[];
  steps: PrayerStep[];

  accessLevel: AccessLevel;
  isFeatured: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface PrayerTime {
  name: PrayerName;
  time: Date;
  isPassed: boolean;
}

export interface PrayerTimes {
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  calculationMethod: PrayerCalculationMethod;
  prayers: PrayerTime[];
  nextPrayer?: {
    name: PrayerName;
    time: Date;
    timeRemaining: string;
  };
}

export interface QiblaDirection {
  direction: number;  // degrees from North
  distance: number;   // kilometers to Mecca
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PracticeSession {
  _id: string;
  userId: string;
  lessonId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  mistakes: number;
  rakatCompleted: number;
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: {
    current: number;
    total: number;
  };
}
