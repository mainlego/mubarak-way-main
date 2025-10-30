import axios from 'axios';

async function testEReplikaAPI() {
  console.log('Testing E-Replika API...\n');

  try {
    const response = await axios.get('https://bot.e-replika.ru/api/v1/quran/surahs/1/ayahs');

    if (response.data.data && response.data.data.length > 0) {
      const ayah = response.data.data[0];
      console.log('✅ E-Replika API works!');
      console.log('Ayah keys:', Object.keys(ayah));
      console.log('Has textArabic?', !!ayah.textArabic);
      console.log('textArabic sample:', ayah.textArabic?.substring(0, 50));
      console.log('Has translations array?', Array.isArray(ayah.translations));
      console.log('Translations length:', ayah.translations?.length || 0);

      if (ayah.translations && ayah.translations.length > 0) {
        console.log('\n📖 First translation:');
        console.log(JSON.stringify(ayah.translations[0], null, 2));
      } else {
        console.log('\n⚠️  No translations in response');
      }
    } else {
      console.log('❌ No data in response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEReplikaAPI();
