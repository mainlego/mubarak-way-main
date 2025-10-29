/**
 * Type definitions for E-Replika API
 * Based on https://bot.e-replika.ru/docs OpenAPI schema
 */

// ========== AUTH ==========

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface TelegramLoginRequest {
  initData: string;
}

// ========== USER ==========

export interface User {
  id: string;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

// ========== CATALOG ==========

export interface CatalogCategory {
  id: string;
  name: Record<string, string>; // Multilingual
  description?: Record<string, string>;
  icon?: string;
  sort_order?: number;
}

export interface CatalogItem {
  id: string;
  category_id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  content_type: 'nasheed' | 'book' | 'lesson' | 'article';
  audio_url?: string;
  file_url?: string;
  cover_url?: string;
  duration?: number; // seconds
  size?: number; // bytes
  author?: string;
  tags?: string[];
  is_premium?: boolean;
  sort_order?: number;
  created_at: string;
}

export interface CatalogItemsResponse {
  items: CatalogItem[];
  total: number;
  limit: number;
  offset: number;
}

// ========== LIBRARY ==========

export interface Book {
  id: string;
  title: Record<string, string>;
  author?: string;
  description?: Record<string, string>;
  cover_url?: string;
  file_url?: string;
  file_type?: 'pdf' | 'epub' | 'txt';
  page_count?: number;
  file_size?: number;
  is_premium?: boolean;
  tags?: string[];
  created_at: string;
}

export interface ReadingProgress {
  book_id: string;
  user_id: string;
  current_page: number;
  total_pages: number;
  progress_percent: number;
  last_read_at: string;
  bookmarks?: number[]; // page numbers
}

export interface ReadingProgressUpdate {
  current_page: number;
  bookmarks?: number[];
}

// ========== QURAN (Ayah Structure) ==========

export interface Ayah {
  surah_number: number;
  ayah_number: number;
  text_arabic: string;
  text_transliteration?: string;
  translation_ru?: string;
  translation_en?: string;
  juz_number?: number;
  page_number?: number;
  is_sajdah?: boolean;
}

// From user's provided chapters.json
export interface Chapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number]; // [start, end]
  translated_name: {
    language_name: string;
    name: string;
  };
}

// ========== GOALS ==========

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: 'reading' | 'listening' | 'learning' | 'practice';
  target_value?: number;
  current_value?: number;
  unit?: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface GoalCreate {
  title: string;
  description?: string;
  goal_type: string;
  target_value?: number;
  unit?: string;
  end_date?: string;
}

// ========== SUBSCRIPTION ==========

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

// ========== TASBIH ==========

export interface TasbihSession {
  id: string;
  user_id: string;
  dhikr_text: string;
  target_count: number;
  current_count: number;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
}

export interface TasbihSessionCreate {
  dhikr_text: string;
  target_count: number;
}

export interface TasbihEvent {
  id: string;
  session_id: string;
  count: number;
  timestamp: string;
}

export interface TasbihEventCreate {
  session_id: string;
  count: number;
}

// ========== AZKAR ==========

export interface AzkarSegment {
  id: string;
  time_of_day: 'morning' | 'evening' | 'night' | 'any';
  arabic_text: string;
  transliteration?: string;
  translation_ru?: string;
  translation_en?: string;
  repeat_count: number;
  benefits?: string;
  source?: string;
}

export interface AzkarSession {
  id: string;
  user_id: string;
  segment_id: string;
  completed_count: number;
  total_count: number;
  started_at: string;
  completed_at?: string;
}

export interface AzkarToday {
  morning: AzkarSegment[];
  evening: AzkarSegment[];
  completed_ids: string[];
}

// ========== NOTIFICATIONS ==========

export interface NotificationSchedule {
  id?: string;
  user_id?: string;
  type: 'prayer' | 'azkar' | 'goal' | 'custom';
  title: string;
  message: string;
  schedule_time: string;
  is_enabled: boolean;
}

// ========== REPORTS ==========

export interface DailyReport {
  user_id?: string;
  date: string;
  reading_minutes?: number;
  listening_minutes?: number;
  goals_completed?: number;
  tasbih_count?: number;
  azkar_completed?: number;
}

export interface MonthlyReport {
  user_id?: string;
  month: string;
  total_reading_minutes: number;
  total_listening_minutes: number;
  total_goals_completed: number;
  total_tasbih_count: number;
  daily_data: DailyReport[];
}
