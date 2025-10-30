import axios from 'axios';

const TOKEN = 'test_token_123';
const BASE_URL = 'https://bot.e-replika.ru/api/v1';

async function testAuthFormats() {
  console.log('Testing different auth formats for E-Replika API...\n');

  const authVariants = [
    { name: 'Bearer in Authorization header', headers: { 'Authorization': `Bearer ${TOKEN}` } },
    { name: 'Token in Authorization header', headers: { 'Authorization': `Token ${TOKEN}` } },
    { name: 'Just token in Authorization', headers: { 'Authorization': TOKEN } },
    { name: 'X-API-Key header', headers: { 'X-API-Key': TOKEN } },
    { name: 'X-Auth-Token header', headers: { 'X-Auth-Token': TOKEN } },
    { name: 'api-key query param', headers: {}, params: { api_key: TOKEN } },
    { name: 'token query param', headers: {}, params: { token: TOKEN } },
    { name: 'No auth', headers: {}, params: {} },
  ];

  for (const variant of authVariants) {
    try {
      console.log(`\n🔵 Testing: ${variant.name}`);

      const response = await axios.get(`${BASE_URL}/quran/surahs`, {
        headers: {
          'Accept': 'application/json',
          ...variant.headers,
        },
        params: variant.params || {},
        timeout: 10000,
      });

      console.log(`✅ SUCCESS (${response.status})`);
      console.log('Response type:', Array.isArray(response.data) ? 'array' : typeof response.data);
      console.log('Data length:', response.data?.length || 'N/A');

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('✨ GOT DATA! First item keys:', Object.keys(response.data[0]));
        console.log('First item:', JSON.stringify(response.data[0], null, 2).substring(0, 300));
      } else if (response.data && typeof response.data === 'object') {
        console.log('Response keys:', Object.keys(response.data));
      }
    } catch (error) {
      console.log(`❌ FAILED (${error.response?.status || 'no response'}): ${error.message}`);
      if (error.response?.data) {
        console.log('Error data:', JSON.stringify(error.response.data, null, 2).substring(0, 200));
      }
    }
  }

  // Test with /api/v1/auth/test-token to get a real token
  console.log('\n\n🔵 Testing: Get real token from /api/v1/auth/test-token');
  try {
    const response = await axios.post(`${BASE_URL}/auth/test-token`, {}, {
      headers: { 'Accept': 'application/json' },
    });

    console.log('✅ Got token response!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data?.access_token) {
      const realToken = response.data.access_token;
      console.log('\n🔵 Testing with REAL token...');

      const testResponse = await axios.get(`${BASE_URL}/quran/surahs`, {
        headers: {
          'Authorization': `Bearer ${realToken}`,
          'Accept': 'application/json',
        },
      });

      console.log(`✅ SUCCESS with real token!`);
      console.log('Data length:', testResponse.data?.length);
      if (Array.isArray(testResponse.data) && testResponse.data.length > 0) {
        console.log('✨ GOT DATA! First surah:', JSON.stringify(testResponse.data[0], null, 2).substring(0, 300));
      }
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.response?.data) {
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAuthFormats();
