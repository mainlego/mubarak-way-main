/**
 * Core type definitions for Mubarak Way Unified App
 */

// ============================================================================
// ENUMS & LITERALS
// ============================================================================

export type Language = 'ru' | 'en' | 'ar';

export type Madhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = 'obligatory' | 'optional' | 'special' | 'significant' | 'intro' | 'wudu';

export type PrayerCategory = 'fard' | 'sunnah' | 'wajib' | 'nafl' | 'other';

export type PrayerName =
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'witr'
  | 'tahajjud'
  | 'qiyam'
  | 'duha_ishraq'
  | 'tauba'
  | 'istighfar'
  | 'wudu'
  | 'juma'
  | 'eid'
  | 'janaza'
  | 'khauf'
  | 'kusuf_husuf'
  | 'none';

export type StepKind =
  | 'intention'
  | 'takbir'
  | 'standing'
  | 'recitation'
  | 'ruku'
  | 'qiyam'
  | 'sajdah'
  | 'sitting'
  | 'second_sajdah'
  | 'tashahhud'
  | 'salam'
  | 'other';

export type SectionKey =
  | 'who_must'
  | 'types'
  | 'conditions'
  | 'adhan'
  | 'iqama'
  | 'adab'
  | 'invalidators'
  | 'special_notes';

export type ThemeMode = 'light' | 'dark';

// ============================================================================
// I18N
// ============================================================================

export interface I18nContent {
  ru: string;
  en: string;
  ar: string;
}

export interface RichI18nContent {
  ru: Record<string, unknown>;
  en: Record<string, unknown>;
  ar: Record<string, unknown>;
}

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: string;
  tg_id: number;
  tz: string;
  language: Language;
  madhab: Madhab;
  level: UserLevel;
  created_at: string;
}

export interface UserSettings {
  language: Language;
  madhab: Madhab;
  level: UserLevel;
  theme: ThemeMode;
  audio_speed: number; // 0.75 | 1.0 | 1.25
  autoplay_enabled: boolean;
}

// ============================================================================
// LESSON
// ============================================================================

export interface Lesson {
  id: string;
  slug: string;
  type: LessonType;
  prayer: PrayerName;
  prayer_category?: PrayerCategory;
  title_i18n: I18nContent;
  summary_i18n: I18nContent;
  rakat_count: number | null;
  order_index: number;
  is_published: boolean;
}

export interface LessonSection {
  id: string;
  lesson_id: string;
  key: SectionKey;
  content_i18n: RichI18nContent;
}

export interface LessonStep {
  id: string;
  lesson_id: string;
  step_no: number;
  kind: StepKind;
  image_light_url: string | null;
  image_dark_url: string | null;
  audio_url: string | null;
  arabic_text: string;
  translit_text: string;
  translation_text: string;
  notes_i18n: I18nContent | null;
}

export interface Dua {
  id: string;
  slug: string;
  title_i18n: I18nContent;
  arabic_text: string;
  translit_text: string;
  translation_text: string;
  audio_url: string | null;
  tags: string[];
}

export interface MadhabVariant {
  id: string;
  lesson_id: string;
  madhab: Madhab;
  diff_json: {
    rakat_count_override?: number;
    step_overrides?: Array<{
      step_no: number;
      arabic_text?: string;
      translit_text?: string;
      translation_text?: string;
      notes?: I18nContent;
    }>;
    section_overrides?: Partial<Record<SectionKey, RichI18nContent>>;
  };
}

// ============================================================================
// PROGRESS
// ============================================================================

export interface UserProgress {
  lesson_id: string;
  user_id: string;
  completed_percent: number;
  completed_steps: number[];
  last_step_id: string | null;
  started_at: string;
  updated_at: string;
}

export interface UserDua {
  user_id: string;
  dua_id: string;
  saved_at: string;
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export type AchievementType =
  | 'first_lesson'
  | 'first_week'
  | 'month_streak'
  | 'all_obligatory'
  | 'all_optional'
  | 'master_wudu'
  | 'speed_learner'
  | 'dedicated'
  | 'collector';

export interface Achievement {
  id: AchievementType;
  title_i18n: I18nContent;
  description_i18n: I18nContent;
  icon: string;
  requirement: number;
  category: 'lessons' | 'streak' | 'duas' | 'practice';
}

export interface UserAchievement {
  achievement_id: AchievementType;
  user_id: string;
  progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface BootstrapResponse {
  user: User;
  featuredLessons: Lesson[];
  lastLesson: Lesson | null;
}

export interface LessonDetailResponse {
  lesson: Lesson;
  sections: LessonSection[];
  steps: LessonStep[];
  dua: Dua[];
  variantsApplied: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
