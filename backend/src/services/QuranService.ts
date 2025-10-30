import Surah from '../models/Surah.js';
import Ayah from '../models/Ayah.js';
import type { Surah as SurahType, Ayah as AyahType, QuranSearchQuery } from '@mubarak-way/shared';

// Helper functions to add backwards compatibility fields
function addSurahAliases(surah: any): SurahType {
  return {
    ...surah,
    nameTranslation: surah.nameTransliteration,
    numberOfAyahs: surah.ayahCount,
    revelationType: surah.revelation,
  };
}

function addAyahAliases(ayah: any): AyahType {
  return {
    ...ayah,
    numberInSurah: ayah.ayahNumber,
    translation: ayah.translations?.[0]?.text || '',
  };
}

export class QuranService {
  /**
   * Get all surahs
   */
  static async getAllSurahs(): Promise<SurahType[]> {
    const surahs = await Surah.find().sort({ number: 1 }).lean();
    return surahs.map(addSurahAliases);
  }

  /**
   * Get surah by number
   */
  static async getSurahByNumber(number: number): Promise<SurahType | null> {
    const surah = await Surah.findOne({ number }).lean();
    return surah ? addSurahAliases(surah) : null;
  }

  /**
   * Get ayahs by surah number
   */
  static async getAyahsBySurah(
    surahNumber: number,
    language?: string
  ): Promise<AyahType[]> {
    const query: any = { surahNumber };

    const ayahs = await Ayah.find(query).sort({ ayahNumber: 1 }).lean();

    // Filter translations by language if specified
    if (language) {
      return ayahs.map(ayah => addAyahAliases({
        ...ayah,
        translations: ayah.translations.filter((t: any) => t.language === language),
      }));
    }

    return ayahs.map(addAyahAliases);
  }

  /**
   * Get single ayah
   */
  static async getAyah(
    surahNumber: number,
    ayahNumber: number,
    language?: string
  ): Promise<AyahType | null> {
    const ayah = await Ayah.findOne({ surahNumber, ayahNumber }).lean();

    if (!ayah) return null;

    // Filter translations by language if specified
    if (language) {
      return addAyahAliases({
        ...ayah,
        translations: ayah.translations.filter((t: any) => t.language === language),
      });
    }

    return addAyahAliases(ayah);
  }

  /**
   * Get ayah by ObjectId
   */
  static async getAyahById(
    ayahId: string,
    language?: string
  ): Promise<AyahType | null> {
    const ayah = await Ayah.findById(ayahId).lean();

    if (!ayah) return null;

    // Filter translations by language if specified
    if (language) {
      return addAyahAliases({
        ...ayah,
        translations: ayah.translations.filter((t: any) => t.language === language),
      });
    }

    return addAyahAliases(ayah);
  }

  /**
   * Get ayahs by Juz number
   */
  static async getAyahsByJuz(juzNumber: number): Promise<AyahType[]> {
    const ayahs = await Ayah.find({ juzNumber }).sort({ globalNumber: 1 }).lean();
    return ayahs.map(addAyahAliases);
  }

  /**
   * Get ayahs by page number
   */
  static async getAyahsByPage(pageNumber: number): Promise<AyahType[]> {
    const ayahs = await Ayah.find({ pageNumber }).sort({ globalNumber: 1 }).lean();
    return ayahs.map(addAyahAliases);
  }

  /**
   * Get Sajda ayahs
   */
  static async getSajdahAyahs(): Promise<AyahType[]> {
    const ayahs = await Ayah.find({ 'sajdah.required': true }).sort({ globalNumber: 1 }).lean();
    return ayahs.map(addAyahAliases);
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
      .limit(50)
      .lean();

    // Filter translations by language if specified
    if (query.language) {
      return ayahs.map(ayah => addAyahAliases({
        ...ayah,
        translations: ayah.translations.filter((t: any) => t.language === query.language),
      }));
    }

    return ayahs.map(addAyahAliases);
  }

  /**
   * Get random ayah
   */
  static async getRandomAyah(): Promise<AyahType | null> {
    const count = await Ayah.countDocuments();
    const random = Math.floor(Math.random() * count);
    const ayah = await Ayah.findOne().skip(random).lean();
    return ayah ? addAyahAliases(ayah) : null;
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
