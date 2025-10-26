import Surah from '../models/Surah.js';
import Ayah from '../models/Ayah.js';
import type { Surah as SurahType, Ayah as AyahType, QuranSearchQuery } from '@mubarak-way/shared';

export class QuranService {
  /**
   * Get all surahs
   */
  static async getAllSurahs(): Promise<SurahType[]> {
    return await Surah.find().sort({ number: 1 });
  }

  /**
   * Get surah by number
   */
  static async getSurahByNumber(number: number): Promise<SurahType | null> {
    return await Surah.findOne({ number });
  }

  /**
   * Get ayahs by surah number
   */
  static async getAyahsBySurah(
    surahNumber: number,
    language?: string
  ): Promise<AyahType[]> {
    const query: any = { surahNumber };

    const ayahs = await Ayah.find(query).sort({ ayahNumber: 1 });

    // Filter translations by language if specified
    if (language) {
      return ayahs.map(ayah => ({
        ...ayah.toObject(),
        translations: ayah.translations.filter(t => t.language === language),
      }));
    }

    return ayahs;
  }

  /**
   * Get single ayah
   */
  static async getAyah(
    surahNumber: number,
    ayahNumber: number,
    language?: string
  ): Promise<AyahType | null> {
    const ayah = await Ayah.findOne({ surahNumber, ayahNumber });

    if (!ayah) return null;

    // Filter translations by language if specified
    if (language) {
      return {
        ...ayah.toObject(),
        translations: ayah.translations.filter(t => t.language === language),
      };
    }

    return ayah;
  }

  /**
   * Get ayahs by Juz number
   */
  static async getAyahsByJuz(juzNumber: number): Promise<AyahType[]> {
    return await Ayah.find({ juzNumber }).sort({ globalNumber: 1 });
  }

  /**
   * Get ayahs by page number
   */
  static async getAyahsByPage(pageNumber: number): Promise<AyahType[]> {
    return await Ayah.find({ pageNumber }).sort({ globalNumber: 1 });
  }

  /**
   * Get Sajda ayahs
   */
  static async getSajdahAyahs(): Promise<AyahType[]> {
    return await Ayah.find({ 'sajdah.required': true }).sort({ globalNumber: 1 });
  }

  /**
   * Search in Quran
   */
  static async searchQuran(query: QuranSearchQuery): Promise<AyahType[]> {
    const searchQuery: any = {};

    // Text search
    if (query.query) {
      searchQuery.$text = { $search: query.query };
    }

    // Filter by surah
    if (query.surahNumber) {
      searchQuery.surahNumber = query.surahNumber;
    }

    // Filter by juz
    if (query.juzNumber) {
      searchQuery.juzNumber = query.juzNumber;
    }

    // Filter by page
    if (query.pageNumber) {
      searchQuery.pageNumber = query.pageNumber;
    }

    const ayahs = await Ayah.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    // Filter translations by language if specified
    if (query.language) {
      return ayahs.map(ayah => ({
        ...ayah.toObject(),
        translations: ayah.translations.filter(t => t.language === query.language),
      }));
    }

    return ayahs;
  }

  /**
   * Get random ayah
   */
  static async getRandomAyah(): Promise<AyahType | null> {
    const count = await Ayah.countDocuments();
    const random = Math.floor(Math.random() * count);
    const ayah = await Ayah.findOne().skip(random);
    return ayah;
  }

  /**
   * Get Quran statistics
   */
  static async getStats() {
    const surahCount = await Surah.countDocuments();
    const ayahCount = await Ayah.countDocuments();

    return {
      totalSurahs: surahCount,
      totalAyahs: ayahCount,
      totalJuz: 30,
      totalPages: 604,
    };
  }
}
