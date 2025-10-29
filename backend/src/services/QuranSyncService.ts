/**
 * Quran Sync Service
 * Синхронизация данных из Quran.com API в MongoDB
 */

import axios, { AxiosInstance } from 'axios';
import SurahModel from '../models/Surah';
import AyahModel from '../models/Ayah';
import type { Surah, Ayah } from '@mubarak-way/shared';

const QURAN_COM_CLIENT_ID = process.env.QURAN_COM_CLIENT_ID || '';
const QURAN_COM_CLIENT_SECRET = process.env.QURAN_COM_CLIENT_SECRET || '';
const QURAN_COM_ENDPOINT = process.env.QURAN_COM_ENDPOINT || 'https://oauth2.quran.foundation';

// Translation IDs для разных языков
const TRANSLATION_IDS = {
  ru: 131, // Russian - Kuliev
  en: 85,  // English - Sahih International
  ar: 54,  // Arabic - Tafseer
  tr: 77,  // Turkish
  uz: 84,  // Uzbek
  kk: 109, // Kazakh
};

class QuranSyncService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.quran.com/api/v4',
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${QURAN_COM_ENDPOINT}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: QURAN_COM_CLIENT_ID,
          client_secret: QURAN_COM_CLIENT_SECRET,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.accessToken = response.data.access_token;
      console.log('✅ Quran.com OAuth2 token obtained');
      return this.accessToken;
    } catch (error: any) {
      console.error('❌ Failed to get Quran.com access token:', error.message);
      throw new Error('OAuth2 authentication failed');
    }
  }

  /**
   * Sync all surahs from Quran.com to database
   */
  async syncSurahs(): Promise<void> {
    console.log('🔄 Starting surah sync...');

    try {
      const token = await this.getAccessToken();
      const response = await this.api.get('/chapters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          language: 'en',
        },
      });

      const chapters = response.data.chapters;
      console.log(`📚 Found ${chapters.length} surahs to sync`);

      for (const chapter of chapters) {
        const surahData: Partial<Surah> = {
          number: chapter.id,
          name: chapter.name_simple,
          nameArabic: chapter.name_arabic,
          nameTransliteration: chapter.name_complex,
          ayahCount: chapter.verses_count,
          revelation: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
          revelationOrder: chapter.revelation_order,
          bismillahPre: chapter.bismillah_pre,
        };

        await SurahModel.findOneAndUpdate(
          { number: chapter.id },
          surahData,
          { upsert: true, new: true }
        );

        console.log(`✅ Synced Surah ${chapter.id}: ${chapter.name_simple}`);
      }

      console.log('✅ Surah sync completed');
    } catch (error: any) {
      console.error('❌ Surah sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync ayahs for a specific surah
   */
  async syncAyahsBySurah(surahNumber: number, languages: string[] = ['ru', 'en']): Promise<void> {
    console.log(`🔄 Syncing ayahs for Surah ${surahNumber}...`);

    try {
      const token = await this.getAccessToken();

      // Get ayahs with translations
      const translationIds = languages.map(lang => TRANSLATION_IDS[lang as keyof typeof TRANSLATION_IDS]).filter(Boolean);

      const response = await this.api.get(`/verses/by_chapter/${surahNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          words: true,
          translations: translationIds.join(','),
          fields: 'text_uthmani,text_imlaei',
          translation_fields: 'resource_name,language_name',
        },
      });

      const verses = response.data.verses;
      console.log(`📖 Found ${verses.length} ayahs for Surah ${surahNumber}`);

      for (const verse of verses) {
        // Map translations
        const translations = verse.translations?.map((t: any) => ({
          language: this.mapLanguageCode(t.language_name),
          text: t.text,
          translator: t.resource_name,
          translatorId: t.resource_id,
        })) || [];

        const ayahData: Partial<Ayah> = {
          surahNumber: verse.verse_key.split(':')[0],
          ayahNumber: verse.verse_number,
          globalNumber: verse.id,
          textArabic: verse.text_uthmani || verse.text_imlaei,
          textSimple: verse.text_imlaei || verse.text_uthmani,
          translations,
          tafsirs: [], // Tafsir загружается отдельно
          juzNumber: verse.juz_number,
          hizbNumber: verse.hizb_number,
          pageNumber: verse.page_number,
          sajdah: verse.sajdah ? {
            required: true,
            type: verse.sajdah_type || 'recommended',
          } : undefined,
        };

        await AyahModel.findOneAndUpdate(
          { globalNumber: verse.id },
          ayahData,
          { upsert: true, new: true }
        );
      }

      console.log(`✅ Synced ${verses.length} ayahs for Surah ${surahNumber}`);
    } catch (error: any) {
      console.error(`❌ Ayah sync failed for Surah ${surahNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync ALL ayahs (all 114 surahs)
   */
  async syncAllAyahs(languages: string[] = ['ru', 'en']): Promise<void> {
    console.log('🔄 Starting full Quran sync...');

    for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
      try {
        await this.syncAyahsBySurah(surahNumber, languages);

        // Rate limiting - небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`❌ Failed to sync Surah ${surahNumber}:`, error.message);
        // Продолжаем синхронизацию остальных сур
      }
    }

    console.log('✅ Full Quran sync completed');
  }

  /**
   * Get verse count for progress tracking
   */
  async getVerseCounts(): Promise<{ total: number; synced: number }> {
    const total = 6236; // Total verses in Quran
    const synced = await AyahModel.countDocuments();

    return { total, synced };
  }

  /**
   * Map Quran.com language names to our codes
   */
  private mapLanguageCode(languageName: string): string {
    const mapping: Record<string, string> = {
      'russian': 'ru',
      'english': 'en',
      'arabic': 'ar',
      'turkish': 'tr',
      'uzbek': 'uz',
      'kazakh': 'kk',
    };

    return mapping[languageName.toLowerCase()] || 'en';
  }

  /**
   * Check if data needs refresh (last sync older than 30 days)
   */
  async needsSync(): Promise<boolean> {
    const surahCount = await SurahModel.countDocuments();
    const ayahCount = await AyahModel.countDocuments();

    // If no data or incomplete, needs sync
    if (surahCount < 114 || ayahCount < 6000) {
      return true;
    }

    // Check last update time
    const latestSurah = await SurahModel.findOne().sort({ updatedAt: -1 });
    if (!latestSurah) return true;

    const daysSinceUpdate = (Date.now() - new Date(latestSurah.updatedAt || 0).getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceUpdate > 30; // Refresh every 30 days
  }
}

export default new QuranSyncService();
