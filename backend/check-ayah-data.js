import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAyahData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get first ayah directly from DB
    const ayah = await db.collection('ayahs').findOne({ surahNumber: 1, ayahNumber: 1 });

    console.log('Ayah 1:1 from database:');
    console.log('Fields present:', Object.keys(ayah));
    console.log('\nHas textArabic?', 'textArabic' in ayah);
    console.log('Has textSimple?', 'textSimple' in ayah);
    console.log('Has text?', 'text' in ayah);

    if (ayah.textArabic) {
      console.log('\ntextArabic:', ayah.textArabic);
    }
    if (ayah.textSimple) {
      console.log('textSimple:', ayah.textSimple);
    }
    if (ayah.text) {
      console.log('text:', ayah.text);
    }

    console.log('\nFull ayah object:');
    console.log(JSON.stringify(ayah, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAyahData();
