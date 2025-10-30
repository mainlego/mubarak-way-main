/**
 * CLI Script: Sync Quran data from E-Replika API to MongoDB
 *
 * Usage:
 *   npm run sync:quran:ereplika -- --surahs        # Sync only surahs
 *   npm run sync:quran:ereplika -- --ayahs 1       # Sync ayahs for Surah 1
 *   npm run sync:quran:ereplika -- --all           # Sync everything
 *   npm run sync:quran:ereplika -- --check         # Check sync status
 */

import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import SurahModel from '../models/Surah.js';
import AyahModel from '../models/Ayah.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mubarak-way';
// Use public Quran.com API for Arabic text and metadata
const QURAN_API_URL = 'https://api.quran.com/api/v4';
// Use alquran.cloud for Russian translations (Kuliev)
const ALQURAN_API_URL = 'https://api.alquran.cloud/v1';
const RUSSIAN_EDITION = 'ru.kuliev';

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Sync all surahs
 */
async function syncSurahs() {
  try {
    console.log('🔄 Fetching surahs from Quran.com API...');

    const response = await axios.get(`${QURAN_API_URL}/chapters`, {
      params: {
        language: 'en',
      },
    });

    const chapters = response.data.chapters;
    console.log(`📚 Found ${chapters.length} surahs`);

    let synced = 0;
    for (const chapter of chapters) {
      await SurahModel.findOneAndUpdate(
        { number: chapter.id },
        {
          number: chapter.id,
          name: chapter.name_simple,
          nameArabic: chapter.name_arabic,
          nameTransliteration: chapter.name_complex,
          ayahCount: chapter.verses_count,
          revelation: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
          revelationOrder: chapter.revelation_order,
          bismillahPre: chapter.bismillah_pre,
        },
        { upsert: true, new: true }
      );
      synced++;
    }

    console.log(`✅ Synced ${synced} surahs`);
  } catch (error: any) {
    console.error('❌ Surah sync failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Sync ayahs for a specific surah
 */
async function syncAyahs(surahNumber: number) {
  try {
    console.log(`🔄 Fetching ayahs for Surah ${surahNumber}...`);

    // Fetch Arabic text from Quran.com API
    const textResponse = await axios.get(`${QURAN_API_URL}/quran/verses/uthmani`, {
      params: {
        chapter_number: surahNumber,
      },
    });

    // Fetch metadata from Quran.com API (for juz, page, sajdah info)
    const metadataResponse = await axios.get(`${QURAN_API_URL}/verses/by_chapter/${surahNumber}`, {
      params: {
        language: 'ru',
        words: false,
        audio: false,
        per_page: 300,
      },
    });

    // Fetch Russian translations from alquran.cloud API
    const translationResponse = await axios.get(`${ALQURAN_API_URL}/surah/${surahNumber}/${RUSSIAN_EDITION}`);

    const verses = metadataResponse.data.verses;
    const textVerses = textResponse.data.verses;
    const translationAyahs = translationResponse.data.data?.ayahs || [];

    console.log(`📖 Found ${verses.length} ayahs (${translationAyahs.length} translations from alquran.cloud)`);

    let synced = 0;
    for (const verse of verses) {
      // Parse verse key (e.g., "1:1" -> surah 1, ayah 1)
      const [versSurahNum, versAyahNum] = verse.verse_key.split(':').map(Number);

      // Find corresponding Arabic text
      const textVerse = textVerses.find((tv: any) => tv.verse_key === verse.verse_key);

      // Find corresponding Russian translation from alquran.cloud
      // alquran.cloud uses 1-based numberInSurah
      const translationAyah = translationAyahs.find(
        (ta: any) => ta.numberInSurah === versAyahNum
      );

      // Extract translation
      const translations = [];
      if (translationAyah?.text) {
        translations.push({
          language: 'ru',
          text: translationAyah.text,
          translator: 'Кулиев Э.',
          translatorId: 79,
        });
      }

      await AyahModel.findOneAndUpdate(
        {
          surahNumber: versSurahNum,
          ayahNumber: versAyahNum,
        },
        {
          surahNumber: versSurahNum,
          ayahNumber: versAyahNum,
          globalNumber: verse.id,
          textArabic: textVerse?.text_uthmani || '',
          textSimple: textVerse?.text_uthmani || '',
          translations,
          tafsirs: [],
          juzNumber: verse.juz_number,
          hizbNumber: verse.hizb_number,
          pageNumber: verse.page_number,
          sajdah: verse.sajdah ? {
            required: verse.sajdah.obligatory,
            type: verse.sajdah.obligatory ? 'obligatory' : 'recommended'
          } : undefined,
        },
        { upsert: true, new: true }
      );
      synced++;
    }

    console.log(`✅ Synced ${synced} ayahs for Surah ${surahNumber}${translationAyahs.length > 0 ? ' (with translations)' : ' (no translations)'}`);
  } catch (error: any) {
    console.error(`❌ Ayah sync failed for Surah ${surahNumber}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Sync all surahs and all ayahs
 */
async function syncAll() {
  console.log('🚀 Starting complete Quran sync...');
  console.log('⏳ This will take ~10-15 minutes...\n');

  // Sync surahs first
  await syncSurahs();

  // Get total surah count
  const surahCount = await SurahModel.countDocuments();
  console.log(`\n🔄 Syncing ayahs for all ${surahCount} surahs...`);

  // Sync ayahs for all surahs
  for (let i = 1; i <= surahCount; i++) {
    console.log(`\n[${i}/${surahCount}] Surah ${i}`);
    await syncAyahs(i);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ Complete Quran sync finished!');
}

/**
 * Check sync status
 */
async function checkStatus() {
  const surahCount = await SurahModel.countDocuments();
  const ayahCount = await AyahModel.countDocuments();

  console.log('\n📊 Sync Status:');
  console.log(`   Surahs: ${surahCount}/114`);
  console.log(`   Ayahs: ${ayahCount}/6236`);
  console.log('');

  if (surahCount === 114 && ayahCount === 6236) {
    console.log('✅ Complete! All data synced.');
  } else if (surahCount === 0 && ayahCount === 0) {
    console.log('⚠️  No data synced yet. Run: npm run sync:quran:ereplika -- --all');
  } else {
    console.log('⚠️  Partial sync. Consider re-running: npm run sync:quran:ereplika -- --all');
  }
}

async function main() {
  await connectDatabase();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--surahs':
        await syncSurahs();
        break;

      case '--ayahs':
        const surahNumber = parseInt(args[1]);
        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
          console.error('❌ Invalid surah number. Use 1-114');
          process.exit(1);
        }
        await syncAyahs(surahNumber);
        break;

      case '--all':
        await syncAll();
        break;

      case '--check':
        await checkStatus();
        break;

      default:
        console.log('Usage:');
        console.log('  npm run sync:quran:ereplika -- --surahs        # Sync only surahs');
        console.log('  npm run sync:quran:ereplika -- --ayahs 1       # Sync ayahs for Surah 1');
        console.log('  npm run sync:quran:ereplika -- --all           # Sync everything');
        console.log('  npm run sync:quran:ereplika -- --check         # Check sync status');
        process.exit(1);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Run
main();
