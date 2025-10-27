/**
 * Prayer Module Types (Learning, Times, Qibla)
 */

import type { AccessLevel } from './library.js';
import type { Madhab } from './user.js';

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

export type HighLatitudeRule = 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle';

export interface PrayerAdjustments {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerCalculationParams {
  calculationMethod: PrayerCalculationMethod;
  madhab: Madhab;
  highLatitudeRule?: HighLatitudeRule;
  adjustments?: Partial<PrayerAdjustments>;
}

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
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  calculationMethod: PrayerCalculationMethod;
  madhab: Madhab;
  qibla?: number;  // Qibla direction in degrees
  nextPrayer?: {
    name: PrayerName | 'sunrise';
    time: Date;
    timeRemaining: {
      hours: number;
      minutes: number;
      seconds: number;
      formatted: string;
    };
  };
  currentPrayer?: {
    name: PrayerName | 'sunrise';
    time: Date;
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
