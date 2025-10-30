/**
 * Production Quran Sync Script
 * Connects directly to production MongoDB and syncs all Quran data
 */

import dotenv from 'dotenv';
import { exec } from 'child_process';

// Load environment variables
dotenv.config();

const PRODUCTION_MONGODB_URI = process.env.MONGODB_URI;

if (!PRODUCTION_MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('🚀 Starting production Quran synchronization...');
console.log('📡 Target database:', PRODUCTION_MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('⏳ This will take ~12-15 minutes...\n');

// Confirm before proceeding
console.log('⚠️  This will sync data to PRODUCTION database!');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  console.log('✅ Starting sync in 3 seconds...');

  setTimeout(() => {
    // Run the sync script
    const syncProcess = exec('npm run sync:quran:ereplika -- --all', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MONGODB_URI: PRODUCTION_MONGODB_URI,
      },
      maxBuffer: 10 * 1024 * 1024,
    });

    syncProcess.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });

    syncProcess.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    syncProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n\n✅ Production Quran sync completed successfully!');
        console.log('🎉 All 114 surahs and 6236 ayahs should now be in production database');
        console.log('\n📊 Verify at: https://mubarak-way-backend.onrender.com/api/v1/quran/surahs');
      } else {
        console.error(`\n\n❌ Sync failed with code ${code}`);
      }
      process.exit(code || 0);
    });
  }, 3000);
}, 5000);
