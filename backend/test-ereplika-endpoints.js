import axios from 'axios';

const BASE_URLS = [
  'https://bot.e-replika.ru/api/v1',
  'https://bot.e-replika.ru',
  'https://bot.e-replika.ru/api',
];
const TOKEN = 'test_token_123';

async function testEndpoints() {
  console.log('Testing E-Replika API endpoints...\n');

  const endpoints = [
    { method: 'GET', path: '/elasticsearch/quran/1', data: null },
    { method: 'GET', path: '/quran/surahs', data: null },
    { method: 'GET', path: '/quran/surahs/1', data: null },
    { method: 'POST', path: '/elasticsearch', data: { action: 'get_surah', surahNumber: 1, edition: 79 } },
  ];

  for (const BASE_URL of BASE_URLS) {
    console.log(`\n\n========= Testing BASE_URL: ${BASE_URL} =========`);

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔵 Testing: ${endpoint.method} ${endpoint.path}`);

      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${BASE_URL}${endpoint.path}`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
          },
          timeout: 10000,
        });
      } else {
        response = await axios.post(`${BASE_URL}${endpoint.path}`, endpoint.data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
          },
          timeout: 10000,
        });
      }

      console.log(`✅ SUCCESS (${response.status})`);
      console.log('Response keys:', Object.keys(response.data));

      if (response.data.ayahs) {
        console.log('Has ayahs:', response.data.ayahs.length);
        if (response.data.ayahs[0]) {
          console.log('First ayah keys:', Object.keys(response.data.ayahs[0]));
        }
      }
      if (response.data.data) {
        console.log('Has data:', Array.isArray(response.data.data) ? response.data.data.length : 'object');
      }
      if (response.data.verses) {
        console.log('Has verses:', response.data.verses.length);
      }
    } catch (error) {
      console.log(`❌ FAILED (${error.response?.status || 'no response'}): ${error.message}`);
    }
  }
  }
}

testEndpoints();
