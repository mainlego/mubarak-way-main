/**
 * CLI Script: Sync Quran data from Quran.com to MongoDB
 *
 * Usage:
 *   npm run sync:quran -- --surahs        # Sync only surahs
 *   npm run sync:quran -- --ayahs 1       # Sync ayahs for Surah 1
 *   npm run sync:quran -- --all           # Sync everything
 *   npm run sync:quran -- --check         # Check sync status
 */

import mongoose from 'mongoose';
import QuranSyncService from '../services/QuranSyncService';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mubarak-way';

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  await connectDatabase();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--surahs':
        console.log('🚀 Syncing surahs...');
        await QuranSyncService.syncSurahs();
        break;

      case '--ayahs':
        const surahNumber = parseInt(args[1]);
        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
          console.error('❌ Invalid surah number. Use 1-114');
          process.exit(1);
        }
        console.log(`🚀 Syncing ayahs for Surah ${surahNumber}...`);
        await QuranSyncService.syncAyahsBySurah(surahNumber);
        break;

      case '--all':
        console.log('🚀 Syncing complete Quran (surahs + all ayahs)...');
        console.log('⏳ This will take ~10-15 minutes...');
        await QuranSyncService.syncSurahs();
        await QuranSyncService.syncAllAyahs(['ru', 'en', 'ar']);
        break;

      case '--check':
        console.log('🔍 Checking sync status...');
        const needsSync = await QuranSyncService.needsSync();
        const counts = await QuranSyncService.getVerseCounts();

        console.log(`\n📊 Sync Status:`);
        console.log(`  - Total verses: ${counts.total}`);
        console.log(`  - Synced verses: ${counts.synced}`);
        console.log(`  - Progress: ${((counts.synced / counts.total) * 100).toFixed(1)}%`);
        console.log(`  - Needs sync: ${needsSync ? '❌ Yes' : '✅ No'}`);
        break;

      default:
        console.log(`
📖 Quran Sync CLI

Usage:
  npm run sync:quran -- --surahs          Sync only surahs (114 chapters)
  npm run sync:quran -- --ayahs <num>     Sync ayahs for specific surah
  npm run sync:quran -- --all             Sync complete Quran (⏳ ~15 min)
  npm run sync:quran -- --check           Check sync status

Examples:
  npm run sync:quran -- --surahs
  npm run sync:quran -- --ayahs 1
  npm run sync:quran -- --ayahs 2
  npm run sync:quran -- --all
  npm run sync:quran -- --check
        `);
        break;
    }

    console.log('\n✅ Operation completed successfully');
  } catch (error: any) {
    console.error('\n❌ Operation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
