# 🛠️ AI Debug Panel

Comprehensive debugging panel for AI Assistant and system configuration.

## 📡 Available Endpoints

### 1. **Configuration Check**
```bash
GET /api/v1/debug/config
```

**Purpose:** Check all system configuration (API keys, database, services)

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "development",
    "server": { "port": 4000, "allowedOrigins": [...] },
    "database": { "mongodbUri": "✅ SET" },
    "telegram": { "botToken": "✅ SET (bot1234...xyz)", "webappUrl": "..." },
    "ai": {
      "openaiApiKey": "✅ SET (sk-proj...QoA)",
      "anthropicApiKey": "❌ NOT SET"
    },
    "elasticsearch": {
      "url": "http://localhost:9200",
      "apiUrl": "https://bot.e-replika.ru/api/v1/elasticsearch",
      "apiToken": "✅ SET (test_t...123)"
    },
    "jwt": { "secret": "✅ SET", "expiresIn": "7d" },
    "rateLimit": { ... }
  }
}
```

**Use Case:** Quickly verify all API keys are set correctly

---

### 2. **OpenAI Connection Test**
```bash
POST /api/v1/debug/ai/test
Content-Type: application/json

{
  "message": "Привет! Это тест."
}
```

**Purpose:** Test OpenAI API connectivity and response

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "status": "✅ OpenAI API Working",
    "model": "gpt-4o-mini",
    "duration": "1234ms",
    "request": { "message": "Привет! Это тест.", ... },
    "response": {
      "content": "Привет! Рад помочь с тестированием. Как дела?",
      "finishReason": "stop",
      "usage": { "prompt_tokens": 25, "completion_tokens": 15, "total_tokens": 40 }
    },
    "apiKeyStatus": "Valid (sk-proj...QoA)"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "AI_NOT_CONFIGURED",
    "message": "OPENAI_API_KEY not configured in environment",
    "debug": {
      "envVarName": "OPENAI_API_KEY",
      "currentValue": "undefined",
      "suggestion": "Add OPENAI_API_KEY=sk-... to backend/.env file"
    }
  }
}
```

**Common Errors:**
- **401 Unauthorized:** Invalid API key
- **ENOTFOUND:** Network error (can't reach OpenAI servers)
- **429 Rate Limit:** Too many requests

---

### 3. **Query Analysis Test**
```bash
POST /api/v1/debug/ai/analyze
Content-Type: application/json

{
  "query": "Что говорит Коран о терпении?"
}
```

**Purpose:** Test AI query analysis (keyword extraction, intent detection)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "✅ Query Analysis Working",
    "duration": "1456ms",
    "input": "Что говорит Коран о терпении?",
    "analysis": {
      "intent": "question",
      "topics": ["терпение", "испытания", "сабр"],
      "keywords": ["терпение", "Коран"],
      "synonyms": ["сабр", "стойкость", "выдержка", "терпеливость"],
      "arabicKeywords": ["sabr", "صبر"],
      "mentionedSurahs": [],
      "mentionedAyahs": [],
      "language": "ru"
    }
  }
}
```

**Use Case:** Verify keyword extraction and synonym generation work correctly

---

### 4. **Elasticsearch Test**
```bash
GET /api/v1/debug/elasticsearch/test
```

**Purpose:** Test Elasticsearch connection and search functionality

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "✅ Elasticsearch Working",
    "healthCheck": { "healthy": true, "duration": "234ms" },
    "searchTest": {
      "query": "терпение",
      "language": "ru",
      "resultsCount": 15,
      "duration": "567ms",
      "sampleResults": [
        { "surah": 2, "ayah": 155, "translation": "Мы непременно испытаем вас..." },
        { "surah": 3, "ayah": 200, "translation": "О те, которые уверовали!..." }
      ]
    },
    "config": {
      "url": "https://bot.e-replika.ru/api/v1/elasticsearch",
      "tokenStatus": "✅ SET"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "ELASTICSEARCH_UNAVAILABLE",
    "message": "Elasticsearch health check failed",
    "debug": {
      "url": "https://bot.e-replika.ru/api/v1/elasticsearch",
      "tokenStatus": "NOT SET",
      "healthCheckDuration": "5002ms"
    }
  }
}
```

---

### 5. **Full AI Pipeline Test** 🚀
```bash
POST /api/v1/debug/ai/full-test
Content-Type: application/json

{
  "question": "Что говорит Коран о терпении?"
}
```

**Purpose:** Test entire AI pipeline (analysis → search → response generation)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "✅ Full AI Pipeline Working",
    "totalDuration": "3456ms",
    "question": "Что говорит Коран о терпении?",
    "steps": [
      {
        "step": 1,
        "name": "Query Analysis",
        "duration": "1234ms",
        "status": "✅",
        "data": { "intent": "question", "keywords": [...], "synonyms": [...] }
      },
      {
        "step": 2,
        "name": "Elasticsearch Search",
        "duration": "890ms",
        "status": "✅",
        "data": {
          "query": "терпение сабр стойкость sabr صبر",
          "resultsCount": 15,
          "sampleResults": [...]
        }
      },
      {
        "step": 3,
        "name": "AI Response Generation",
        "duration": "1332ms",
        "status": "✅",
        "data": {
          "model": "gpt-4o-mini",
          "response": "В Коране терпение (сабр) упоминается множество раз...",
          "usage": { "total_tokens": 245 }
        }
      }
    ],
    "summary": {
      "analysisWorking": true,
      "searchWorking": true,
      "aiResponseWorking": true,
      "versesFound": 15,
      "totalSteps": 3
    }
  }
}
```

**Use Case:** Comprehensive test of all AI features in one request

---

### 6. **Environment Variables** (Development Only)
```bash
GET /api/v1/debug/env
```

**Purpose:** Show all environment variables (only in development mode)

**Response:**
```json
{
  "success": true,
  "data": {
    "NODE_ENV": "development",
    "PORT": "4000",
    "MONGODB_URI": "✅ SET",
    "TELEGRAM_BOT_TOKEN": "✅ SET",
    "OPENAI_API_KEY": "✅ SET (sk-proj-aF...)",
    "ANTHROPIC_API_KEY": "❌ NOT SET",
    "ELASTICSEARCH_API_URL": "https://bot.e-replika.ru/api/v1/elasticsearch",
    "ELASTICSEARCH_API_TOKEN": "✅ SET",
    "JWT_SECRET": "✅ SET",
    "ALLOWED_ORIGINS": "http://localhost:3000"
  }
}
```

**Note:** This endpoint returns 403 Forbidden in production for security.

---

## 🔍 Usage Examples

### Quick AI Health Check
```bash
# Check configuration
curl http://localhost:4000/api/v1/debug/config

# Test OpenAI
curl -X POST http://localhost:4000/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Test Elasticsearch
curl http://localhost:4000/api/v1/debug/elasticsearch/test

# Full pipeline test
curl -X POST http://localhost:4000/api/v1/debug/ai/full-test \
  -H "Content-Type: application/json" \
  -d '{"question": "Что говорит Коран о терпении?"}'
```

### Production URL
```bash
# Replace with your production URL
BASE_URL="https://mubarak-way-unified.onrender.com"

curl $BASE_URL/api/v1/debug/config
curl -X POST $BASE_URL/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🐛 Troubleshooting Guide

### Problem: "OPENAI_API_KEY not configured"

**Solution:**
1. Check `backend/.env` file exists
2. Add `OPENAI_API_KEY=sk-proj-...` to the file
3. Restart backend server
4. Test: `curl http://localhost:4000/api/v1/debug/ai/test -X POST -H "Content-Type: application/json" -d '{"message":"test"}'`

### Problem: "401 Unauthorized" from OpenAI

**Solution:**
1. Verify API key is correct: `curl http://localhost:4000/api/v1/debug/config`
2. Check OpenAI dashboard: https://platform.openai.com/api-keys
3. Ensure key starts with `sk-proj-` or `sk-`
4. Update `.env` file with correct key
5. Restart server

### Problem: "Elasticsearch health check failed"

**Solution:**
1. Check Elasticsearch URL: `curl http://localhost:4000/api/v1/debug/config`
2. Verify ELASTICSEARCH_API_TOKEN is set
3. Test external API: `curl https://bot.e-replika.ru/api/v1/elasticsearch/health`
4. If external API is down, AI will fallback to MongoDB search

### Problem: "Query analysis returns empty keywords"

**Possible Causes:**
- OpenAI API key invalid
- Network connectivity issues
- Rate limit exceeded

**Solution:**
1. Test OpenAI connection: `POST /api/v1/debug/ai/test`
2. Check API key validity
3. Verify network access to api.openai.com

---

## 📊 Performance Benchmarks

**Typical Response Times:**
- Config check: ~5ms
- OpenAI test: 800-2000ms
- Query analysis: 1000-1500ms
- Elasticsearch search: 200-800ms
- Full pipeline: 2500-4000ms

**Performance Tips:**
- Elasticsearch is cached (5 min TTL)
- Use `/api/v1/debug/ai/full-test` to measure end-to-end latency
- Monitor `usage.total_tokens` to optimize costs

---

## 🔒 Security Notes

1. **Never expose API keys in responses** - All keys are masked (shows first 7 and last 4 chars)
2. **Environment endpoint disabled in production** - `/api/v1/debug/env` returns 403 in production
3. **No authentication required** - Debug endpoints are public for convenience during development
4. **Disable in production** - Consider removing `/api/v1/debug` route in production or add authentication

---

## 🎯 Quick Diagnostic Checklist

Use this checklist when AI isn't working:

- [ ] Check config: `GET /api/v1/debug/config`
  - ✅ OpenAI API key is SET
  - ✅ Elasticsearch token is SET
  - ✅ MongoDB URI is SET

- [ ] Test OpenAI: `POST /api/v1/debug/ai/test`
  - ✅ Returns 200 OK
  - ✅ Response contains valid content
  - ✅ Usage tokens are counted

- [ ] Test Elasticsearch: `GET /api/v1/debug/elasticsearch/test`
  - ✅ Health check passes
  - ✅ Search returns results
  - ✅ Response time < 1 second

- [ ] Test full pipeline: `POST /api/v1/debug/ai/full-test`
  - ✅ All 3 steps complete successfully
  - ✅ Verses are found (resultsCount > 0)
  - ✅ AI generates response
  - ✅ Total duration < 5 seconds

If all checks pass ✅ → AI system is working correctly!

---

## 📝 Example Debug Session

```bash
# 1. Check configuration
curl http://localhost:4000/api/v1/debug/config

# Output shows:
# ❌ openaiApiKey: "❌ NOT SET"

# 2. Fix: Add to backend/.env
echo "OPENAI_API_KEY=sk-proj-your-key-here" >> backend/.env

# 3. Restart server
npm run dev

# 4. Test again
curl -X POST http://localhost:4000/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# ✅ Success! OpenAI working
```

---

## 🚀 Ready to Use

All endpoints are available immediately after building the backend:

```bash
cd backend
npm run build
npm run dev

# Test debug panel
curl http://localhost:4000/api/v1/debug/config
```

Happy debugging! 🐛🔧
