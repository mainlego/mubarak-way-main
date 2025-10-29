# AI Chat Setup Guide

## Overview

The AI Chat feature provides intelligent answers about Islam, Quran, and Hadith using OpenAI's GPT-4. The AI assistant:
- Answers questions based on Quran and authentic Hadith
- Provides verse explanations with context
- Cites sources with Surah:Ayah references
- Supports multiple languages (Russian, English, Arabic)
- Tracks conversation history

## Prerequisites

1. **OpenAI API Key** (Required)
   - Sign up at https://platform.openai.com
   - Create API key at https://platform.openai.com/api-keys
   - Copy your API key (starts with `sk-...`)

2. **MongoDB** (Already configured)
   - Stores Quran data for context
   - Stores conversation history

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create account or sign in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name it "Mubarak Way Production"
6. Copy the key immediately (shown only once)

**Cost Estimate:**
- Model used: `gpt-4o-mini` (cheap, fast)
- ~1000 requests/month ≈ $1-2 USD
- 10,000 requests/month ≈ $10-20 USD

### 2. Add to Render Backend

#### Option A: Via Render Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: OPENAI_API_KEY
   Value: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. Click **Save Changes**
7. Service will automatically redeploy (~2 minutes)

#### Option B: Via Render Shell

```bash
# Set environment variable
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Restart service (if needed)
pm2 restart all
```

### 3. Verify Setup

#### Test via API:

```bash
curl -X POST https://your-backend.onrender.com/api/v1/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What does Islam say about prayer?",
    "language": "ru"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "question": "What does Islam say about prayer?",
    "answer": {
      "answer": "🤖 **Ответ:**\n\n## Молитва в Исламе\n\n...",
      "sources": [],
      "relatedVerses": []
    }
  }
}
```

#### Test via Frontend:

1. Open app in Telegram: @MubarakWayApp_bot
2. Navigate to **AI Assistant** page
3. Ask: "Что говорит Ислам о намазе?"
4. Should receive detailed answer with Quranic citations

### 4. Test Verse Explanation

```bash
curl -X POST https://your-backend.onrender.com/api/v1/ai/explain-verse \
  -H "Content-Type: application/json" \
  -d '{
    "surahNumber": 1,
    "ayahNumber": 1,
    "language": "ru",
    "detailLevel": "medium"
  }'
```

## Features

### 1. General Questions (`/ai/ask`)

Ask any question about Islam:
- "Что говорит Ислам о намазе?"
- "Как правильно совершать омовение?"
- "Что означает Бисмиллах?"

**Response includes:**
- Detailed answer in markdown format
- Quranic citations (Surah:Ayah)
- Hadith references (if applicable)
- Related verses

### 2. Verse Explanation (`/ai/explain-verse`)

Get detailed explanations of specific ayahs:
- Brief: Short, clear explanation
- Medium: Moderate detail with key context
- Detailed: In-depth with historical context and scholarly insights

**Response includes:**
- Arabic text
- Translation
- Tafsir (exegesis)
- Historical context
- Related verses

### 3. Book Recommendations (`/ai/recommend-books`)

Get personalized Islamic book recommendations based on:
- Your interests
- Previously read books
- Difficulty level

### 4. Smart Search (`/ai/search`)

AI-powered search across:
- Quran verses
- Books
- Lessons
- Articles

## Subscription Limits

AI requests are limited by subscription tier:

| Tier | AI Requests/Day |
|------|----------------|
| Free | 5 requests |
| Pro | 50 requests |
| Premium | Unlimited |

Users are notified when limit is reached and prompted to upgrade.

## Error Handling

### Error: "OPENAI_API_KEY not configured"

**Cause:** OpenAI API key not set in environment variables

**Solution:**
1. Add `OPENAI_API_KEY` to Render environment variables
2. Restart service
3. Verify with health check

### Error: "Daily limit reached"

**Cause:** User exceeded daily AI request limit

**Solution:**
- Wait until tomorrow (limit resets at midnight UTC)
- Upgrade subscription tier
- Contact support for limit increase

### Error: "Verse not found"

**Cause:** Invalid Surah:Ayah reference or Quran data not synced

**Solution:**
1. Verify Surah number (1-114)
2. Verify Ayah number is valid for that Surah
3. Run Quran sync: `npm run sync:quran -- --all`

### Error: OpenAI API Rate Limit

**Cause:** Too many requests to OpenAI API

**Solution:**
- Wait 60 seconds and retry
- Upgrade OpenAI plan if hitting limits frequently
- Implement request queuing (already built-in)

## Architecture

### How AI Chat Works

```
User Question
    ↓
Frontend (AIChatPage.tsx)
    ↓
aiService.ask() → POST /api/v1/ai/ask
    ↓
Backend AIService.ask()
    ↓
1. Load Quran context from MongoDB (if verse-specific)
2. Build system prompt with instructions
3. Call OpenAI GPT-4o-mini API
4. Parse response
5. Extract citations
6. Return formatted answer
    ↓
Frontend displays with formatting
```

### System Prompts

**General Questions:**
```
You are an Islamic mentor for Quran study.
Your task is to help people understand Quran, giving answers
STRICTLY based on Quran text and authentic Hadith.
Always cite specific verses with Surah and Ayah numbers.
```

**Verse Explanation:**
```
You are an expert in Quranic tafsir (exegesis).
Explain this verse with accuracy and respect to the sacred text.
Include historical context and scholarly insights.
```

## Language Support

AI responses support multiple languages:
- **Russian** (ru) - Default
- **English** (en)
- **Arabic** (ar)

**Example:**
```json
{
  "question": "What is Ramadan?",
  "language": "en"
}
```

## Monitoring

### Check AI Usage

```bash
# View logs
curl https://your-backend.onrender.com/api/v1/logs

# Check user AI usage
GET /api/v1/users/:userId
# Response includes: usage.aiRequestsPerDay
```

### Track Costs

Monitor OpenAI usage at https://platform.openai.com/usage

**Typical costs:**
- Average question: ~500 tokens = $0.0003 USD
- Verse explanation: ~1000 tokens = $0.0006 USD
- 1000 users × 5 questions/day = ~$1.50/day

## Optimization Tips

### 1. Use gpt-4o-mini (Already Implemented)

- 10x cheaper than GPT-4
- Faster responses
- Still excellent quality for Islamic Q&A

### 2. Implement Caching (Future)

Cache common questions:
- "What is prayer in Islam?"
- "How to perform wudu?"
- Saves API costs and improves speed

### 3. Rate Limiting (Already Implemented)

- 10 requests/15 minutes per user
- Prevents abuse
- Reduces costs

## Troubleshooting

### Check if OpenAI is Working

```bash
# Test with curl
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

**Should return:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Hello! How can I assist you today?"
      }
    }
  ]
}
```

### Check Backend Logs

```bash
# Via Render Shell
pm2 logs

# Look for:
# ✅ "OpenAI client initialized"
# ❌ "OPENAI_API_KEY not configured"
```

## Next Steps

After setting up AI Chat:

1. ✅ **Test thoroughly** - Try various questions
2. ✅ **Monitor costs** - Check OpenAI usage dashboard
3. ✅ **Add Russian i18n** - Already completed
4. ✅ **Run Quran sync** - Provides context for AI
5. ⏳ **Deploy to production** - After all testing passes

## Support

If you encounter issues:

1. Check logs in Render dashboard
2. Verify OPENAI_API_KEY is set correctly
3. Test OpenAI API directly (see troubleshooting)
4. Review MongoDB connection (Quran data must be synced)
5. Check rate limits (may need to wait)

## Summary

AI Chat is **ready to use** once you:
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to Render environment variables
3. Test with a question
4. Monitor usage and costs

**Estimated monthly cost:** $10-50 USD depending on usage.
