import axios from 'axios';

async function testStructure() {
  const urls = [
    'https://bot.e-replika.ru/elasticsearch/quran/1?edition=79',
    'https://bot.e-replika.ru/elasticsearch/quran/1/79',
    'https://bot.e-replika.ru/api/v1/quran/surahs/1/ayahs',
  ];

  for (const url of urls) {
    try {
      console.log(`\n🔵 Testing: ${url}\n`);

      const response = await axios.get(url, {
        headers: {
          'Authorization': 'Bearer test_token_123',
          'Accept': 'application/json',
        },
      });

      console.log('✅ SUCCESS!');
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Response is array?', Array.isArray(response.data));

      if (Array.isArray(response.data)) {
        console.log('Total items:', response.data.length);
        if (response.data[0]) {
          console.log('\n📖 First item:');
          console.log(JSON.stringify(response.data[0], null, 2));
        }
      } else if (typeof response.data === 'object') {
        console.log('Response keys:', Object.keys(response.data));
        console.log('\n📖 Response:');
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.status, error.message);
    }
  }
}

testStructure();
