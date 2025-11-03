import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Surah from '../models/Surah.js';
import Ayah from '../models/Ayah.js';

dotenv.config();

// Allow MONGODB_URI to be passed as command line argument
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI || 'mongodb://localhost:27017/mubarak-way-unified';

interface AlQuranCloudAyah {
  number: number;
  numberInSurah: number;
  text: string;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

interface AlQuranCloudSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: AlQuranCloudAyah[];
}

async function importAllSurahs() {
  try {
    console.log('📥 Starting Quran import...');
    console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing Quran data...');
    await Surah.deleteMany({});
    await Ayah.deleteMany({});
    console.log('✅ Existing data cleared');

    let totalAyahs = 0;

    // Import all 114 surahs
    for (let i = 1; i <= 114; i++) {
      console.log(`\n📖 Importing Surah ${i}/114...`);

      try {
        // Fetch surah data from Al-Quran Cloud API
        const response = await axios.get<{ data: AlQuranCloudSurah }>(
          `https://api.alquran.cloud/v1/surah/${i}`
        );
        const surahData = response.data.data;

        // Create surah document
        const surah = await Surah.create({
          number: surahData.number,
          name: surahData.englishName,
          nameArabic: surahData.name,
          nameTransliteration: surahData.englishNameTranslation,
          numberOfAyahs: surahData.numberOfAyahs,
          revelationType: surahData.revelationType.toLowerCase(),
        });

        console.log(`  ✅ Created Surah: ${surahData.englishName} (${surahData.name})`);
        console.log(`     - ${surahData.numberOfAyahs} ayahs`);
        console.log(`     - ${surahData.revelationType}`);

        // Create ayah documents for this surah
        const ayahsToCreate = surahData.ayahs.map(ayah => ({
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

        console.log(`  ✅ Created ${ayahsToCreate.length} ayahs`);

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`  ❌ Error importing Surah ${i}:`, error.message);
        throw error;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Import completed successfully!');
    console.log('='.repeat(60));
    console.log(`✅ Total Surahs imported: 114`);
    console.log(`✅ Total Ayahs imported: ${totalAyahs}`);
    console.log('='.repeat(60));
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run import
importAllSurahs()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
