import axios from 'axios';

async function testTranslationsAPI() {
  console.log('Testing Quran.com API with different parameters...\n');

  // Test 1: With fields parameter
  try {
    console.log('Test 1: With fields=text_uthmani');
    const response1 = await axios.get('https://api.quran.com/api/v4/verses/by_chapter/1', {
      params: {
        language: 'ru',
        translations: 131,
        fields: 'text_uthmani',
        per_page: 2
      }
    });
    const v1 = response1.data.verses[0];
    console.log('Keys:', Object.keys(v1));
    console.log('Has text_uthmani?', !!v1.text_uthmani);
    console.log('Has translations array?', Array.isArray(v1.translations));
    console.log('Translations length:', v1.translations?.length || 0);
    if (v1.translations && v1.translations.length > 0) {
      console.log('First translation:', JSON.stringify(v1.translations[0], null, 2));
    }
    console.log('\n');
  } catch (error) {
    console.error('Test 1 failed:', error.message);
  }

  // Test 2: With words=true
  try {
    console.log('Test 2: With words=true');
    const response2 = await axios.get('https://api.quran.com/api/v4/verses/by_chapter/1', {
      params: {
        language: 'ru',
        translations: 131,
        words: true,
        per_page: 2
      }
    });
    const v2 = response2.data.verses[0];
    console.log('Keys:', Object.keys(v2));
    console.log('Has translations array?', Array.isArray(v2.translations));
    console.log('Translations length:', v2.translations?.length || 0);
    if (v2.translations && v2.translations.length > 0) {
      console.log('First translation:', JSON.stringify(v2.translations[0], null, 2));
    }
    console.log('\n');
  } catch (error) {
    console.error('Test 2 failed:', error.message);
  }

  // Test 3: Using /quran/translations endpoint
  try {
    console.log('Test 3: Using /quran/translations/131 endpoint for Surah 1');
    const response3 = await axios.get('https://api.quran.com/api/v4/quran/translations/131', {
      params: {
        chapter_number: 1
      }
    });
    console.log('Response keys:', Object.keys(response3.data));
    console.log('Translations array length:', response3.data.translations?.length || 0);
    if (response3.data.translations && response3.data.translations.length > 0) {
      const t = response3.data.translations[0];
      console.log('First translation keys:', Object.keys(t));
      console.log('First translation sample:', JSON.stringify(t, null, 2).substring(0, 300));
    }
    console.log('\n');
  } catch (error) {
    console.error('Test 3 failed:', error.message);
  }

  // Test 4: Try without chapter_number filter
  try {
    console.log('Test 4: /quran/translations/131 without filter (all Quran)');
    const response4 = await axios.get('https://api.quran.com/api/v4/quran/translations/131');
    console.log('Translations array length:', response4.data.translations?.length || 0);
    if (response4.data.translations && response4.data.translations.length > 0) {
      const t = response4.data.translations[0];
      console.log('First translation sample:', JSON.stringify(t, null, 2).substring(0, 300));
    }
  } catch (error) {
    console.error('Test 4 failed:', error.message);
  }
}

testTranslationsAPI();
