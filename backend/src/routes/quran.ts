import { Router, Request, Response } from 'express';
import { QuranService } from '../services/QuranService.js';
import type { ApiResponse } from '@mubarak-way/shared';
import { mockSurahs, mockAyahs } from '../data/mockQuran.js';

const router = Router();
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * GET /api/v1/quran/surahs
 * Get all surahs
 */
router.get('/surahs', async (req: Request, res: Response) => {
  try {
    const surahs = USE_MOCK_DATA ? mockSurahs : await QuranService.getAllSurahs();

    res.json({
      success: true,
      data: surahs,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get surahs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SURAHS_ERROR',
        message: error.message || 'Failed to get surahs',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/surahs/:number
 * Get surah by number
 */
router.get('/surahs/:number', async (req: Request, res: Response) => {
  try {
    const number = parseInt(req.params.number);
    const surah = await QuranService.getSurahByNumber(number);

    if (!surah) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SURAH_NOT_FOUND',
          message: 'Surah not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: surah,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get surah error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SURAH_ERROR',
        message: error.message || 'Failed to get surah',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/surahs/:number/ayahs
 * Get ayahs by surah number
 */
router.get('/surahs/:number/ayahs', async (req: Request, res: Response) => {
  try {
    const number = parseInt(req.params.number);
    const language = req.query.language as string;

    const ayahs = USE_MOCK_DATA
      ? (mockAyahs[number] || [])
      : await QuranService.getAyahsBySurah(number, language);

    res.json({
      success: true,
      data: ayahs,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get ayahs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_AYAHS_ERROR',
        message: error.message || 'Failed to get ayahs',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/ayahs/id/:id
 * Get ayah by ObjectId
 */
router.get('/ayahs/id/:id', async (req: Request, res: Response) => {
  try {
    const ayahId = req.params.id;
    const language = req.query.language as string;

    const ayah = await QuranService.getAyahById(ayahId, language);

    if (!ayah) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AYAH_NOT_FOUND',
          message: 'Ayah not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: ayah,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get ayah by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_AYAH_ERROR',
        message: error.message || 'Failed to get ayah',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/ayahs/:surahNumber/:ayahNumber
 * Get single ayah
 */
router.get('/ayahs/:surahNumber/:ayahNumber', async (req: Request, res: Response) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber);
    const ayahNumber = parseInt(req.params.ayahNumber);
    const language = req.query.language as string;

    const ayah = await QuranService.getAyah(surahNumber, ayahNumber, language);

    if (!ayah) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AYAH_NOT_FOUND',
          message: 'Ayah not found',
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: ayah,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get ayah error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_AYAH_ERROR',
        message: error.message || 'Failed to get ayah',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/juz/:number
 * Get ayahs by Juz number
 */
router.get('/juz/:number', async (req: Request, res: Response) => {
  try {
    const number = parseInt(req.params.number);
    const ayahs = await QuranService.getAyahsByJuz(number);

    res.json({
      success: true,
      data: ayahs,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get juz error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_JUZ_ERROR',
        message: error.message || 'Failed to get juz',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/page/:number
 * Get ayahs by page number
 */
router.get('/page/:number', async (req: Request, res: Response) => {
  try {
    const number = parseInt(req.params.number);
    const ayahs = await QuranService.getAyahsByPage(number);

    res.json({
      success: true,
      data: ayahs,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get page error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PAGE_ERROR',
        message: error.message || 'Failed to get page',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/sajdah
 * Get Sajda ayahs
 */
router.get('/sajdah', async (req: Request, res: Response) => {
  try {
    const ayahs = await QuranService.getSajdahAyahs();

    res.json({
      success: true,
      data: ayahs,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Get sajdah error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SAJDAH_ERROR',
        message: error.message || 'Failed to get sajdah ayahs',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/search
 * Search in Quran
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = {
      query: req.query.q as string,
      language: req.query.language as string,
      surahNumber: req.query.surah ? parseInt(req.query.surah as string) : undefined,
      juzNumber: req.query.juz ? parseInt(req.query.juz as string) : undefined,
      pageNumber: req.query.page ? parseInt(req.query.page as string) : undefined,
    };

    const ayahs = await QuranService.searchQuran(query);

    res.json({
      success: true,
      data: ayahs,
      meta: {
        total: ayahs.length,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error.message || 'Failed to search',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/random
 * Get random ayah
 */
router.get('/random', async (req: Request, res: Response) => {
  try {
    const ayah = await QuranService.getRandomAyah();

    res.json({
      success: true,
      data: ayah,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Random ayah error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RANDOM_AYAH_ERROR',
        message: error.message || 'Failed to get random ayah',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/v1/quran/stats
 * Get Quran statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await QuranService.getStats();

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: error.message || 'Failed to get stats',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/v1/quran/import-all?secret=YOUR_SECRET
 * Import all 114 surahs from Al-Quran Cloud API
 * Temporary endpoint for initial data population
 */
router.post('/import-all', async (req: Request, res: Response) => {
  try {
    // Simple secret key protection
    const secret = req.query.secret as string;
    const expectedSecret = process.env.IMPORT_SECRET || 'mubarak-way-import-2025';

    if (secret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid secret key',
        },
      } as ApiResponse);
    }

    console.log('📥 Starting Quran import via API...');

    const axios = (await import('axios')).default;
    const Surah = (await import('../models/Surah.js')).default;
    const Ayah = (await import('../models/Ayah.js')).default;

    // Clear existing data
    console.log('🗑️  Clearing existing Quran data...');
    await Surah.deleteMany({});
    await Ayah.deleteMany({});
    console.log('✅ Existing data cleared');

    let totalAyahs = 0;
    const importedSurahs: any[] = [];

    // Import all 114 surahs
    for (let i = 1; i <= 114; i++) {
      console.log(`📖 Importing Surah ${i}/114...`);

      try {
        // Fetch surah data from Al-Quran Cloud API
        const response = await axios.get<{ data: any }>(
          `https://api.alquran.cloud/v1/surah/${i}`
        );
        const surahData = response.data.data;

        // Create surah document
        const surah = await Surah.create({
          number: surahData.number,
          name: surahData.englishName,
          nameArabic: surahData.name,
          nameTransliteration: surahData.englishNameTranslation,
          ayahCount: surahData.numberOfAyahs,
          revelation: surahData.revelationType.toLowerCase(),
          revelationOrder: surahData.number, // Use surah number as approximation
          bismillahPre: surahData.number !== 1 && surahData.number !== 9, // All except Al-Fatihah and At-Tawbah
        });

        console.log(`  ✅ Created Surah: ${surahData.englishName}`);

        // Create ayah documents for this surah
        const ayahsToCreate = surahData.ayahs.map((ayah: any) => ({
          surahId: surah._id,
          surahNumber: surahData.number,
          ayahNumber: ayah.numberInSurah,
          text: ayah.text,
          textArabic: ayah.text,
          translation: '', // Will be filled later with Russian translation
          transliteration: '',
          juzNumber: Math.ceil(ayah.number / 20), // Approximate juz calculation
        }));

        await Ayah.insertMany(ayahsToCreate);
        totalAyahs += ayahsToCreate.length;

        importedSurahs.push({
          number: surahData.number,
          name: surahData.englishName,
          nameArabic: surahData.name,
          ayahs: ayahsToCreate.length,
        });

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`  ❌ Error importing Surah ${i}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Quran import completed successfully!');

    res.json({
      success: true,
      message: 'All 114 surahs imported successfully',
      data: {
        totalSurahs: importedSurahs.length,
        totalAyahs,
        surahs: importedSurahs,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'IMPORT_ERROR',
        message: 'Failed to import Quran: ' + error.message,
      },
    } as ApiResponse);
  }
});

export default router;
