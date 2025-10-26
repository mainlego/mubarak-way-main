# 📡 MubarakWay API Reference

**Version**: 1.0.0
**Base URL**: `http://localhost:4000/api/v1` (development)
**Production URL**: `https://your-domain.com/api/v1`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Quran API](#quran-api)
3. [Library API](#library-api)
4. [Prayer API](#prayer-api)
5. [AI API](#ai-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Telegram WebApp Authentication

All user requests must include the Telegram `initData` in the header:

```http
X-Telegram-InitData: query_id=...&user=...&auth_date=...&hash=...
```

### Auth Endpoints

#### POST /auth/login

Login or register user via Telegram.

**Headers:**
```
X-Telegram-InitData: <telegram_init_data>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "telegramId": "123456789",
      "firstName": "Иван",
      "subscription": {
        "tier": "free",
        "isActive": true
      },
      ...
    }
  }
}
```

#### GET /auth/user/:telegramId

Get user by Telegram ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "telegramId": "123456789",
    "firstName": "Иван",
    "preferences": { ... },
    ...
  }
}
```

#### PUT /auth/user/:telegramId

Update user preferences.

**Request Body:**
```json
{
  "preferences": {
    "language": "ru",
    "theme": "dark",
    "fontSize": "medium"
  },
  "prayerSettings": {
    "madhab": "hanafi",
    "calculationMethod": "MuslimWorldLeague"
  }
}
```

#### POST /auth/onboarding/:telegramId

Complete onboarding.

**Request Body:**
```json
{
  "preferences": {
    "language": "ru",
    "theme": "dark"
  },
  "prayerSettings": {
    "madhab": "hanafi"
  }
}
```

#### POST /auth/favorites/:telegramId

Add/remove favorite.

**Request Body:**
```json
{
  "type": "books", // or "nashids", "ayahs", "lessons"
  "itemId": 123,
  "action": "add" // or "remove"
}
```

#### POST /auth/offline/:telegramId

Add/remove offline content.

**Request Body:**
```json
{
  "type": "books", // or "nashids"
  "itemId": 123,
  "action": "add" // or "remove"
}
```

**Error Response (Limit Reached):**
```json
{
  "success": false,
  "error": {
    "code": "OFFLINE_LIMIT_REACHED",
    "message": "Offline download limit reached. Please upgrade your subscription."
  }
}
```

---

## 📖 Quran API

### GET /quran/surahs

Get all surahs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "number": 1,
      "name": "Al-Fatihah",
      "nameArabic": "الفاتحة",
      "nameTransliteration": "Al-Faatiha",
      "ayahCount": 7,
      "revelation": "meccan"
    },
    ...
  ]
}
```

### GET /quran/surahs/:number

Get surah by number (1-114).

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 1,
    "name": "Al-Fatihah",
    "nameArabic": "الفاتحة",
    "ayahCount": 7,
    ...
  }
}
```

### GET /quran/surahs/:number/ayahs

Get ayahs by surah number.

**Query Parameters:**
- `language` (optional): Filter translations (e.g., `ru`, `en`, `ar`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "textArabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translations": [
        {
          "language": "ru",
          "text": "Во имя Аллаха, Милостивого, Милосердного!",
          "translator": "Кулиев"
        }
      ],
      "juzNumber": 1,
      "pageNumber": 1
    },
    ...
  ]
}
```

### GET /quran/ayahs/:surahNumber/:ayahNumber

Get single ayah.

**Query Parameters:**
- `language` (optional): Filter translations

**Response:**
```json
{
  "success": true,
  "data": {
    "surahNumber": 2,
    "ayahNumber": 255,
    "textArabic": "...",
    "translations": [...]
  }
}
```

### GET /quran/juz/:number

Get ayahs by Juz number (1-30).

### GET /quran/page/:number

Get ayahs by page number (1-604).

### GET /quran/sajdah

Get all Sajda (prostration) ayahs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "surahNumber": 7,
      "ayahNumber": 206,
      "sajdah": {
        "required": true,
        "type": "recommended"
      },
      ...
    },
    ...
  ]
}
```

### GET /quran/search

Search in Quran.

**Query Parameters:**
- `q` (required): Search query
- `language` (optional): Language filter
- `surah` (optional): Surah number filter
- `juz` (optional): Juz number filter

**Response:**
```json
{
  "success": true,
  "data": [
    { /* matching ayahs */ }
  ],
  "meta": {
    "total": 25
  }
}
```

### GET /quran/random

Get random ayah.

### GET /quran/stats

Get Quran statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSurahs": 114,
    "totalAyahs": 6236,
    "totalJuz": 30,
    "totalPages": 604
  }
}
```

---

## 📚 Library API

### GET /library/books

Get all books with filters.

**Query Parameters:**
- `q` (optional): Search query
- `category` (optional): `religious`, `education`, `spiritual`, etc.
- `genre` (optional): `quran`, `hadith`, `prophets`, etc.
- `language` (optional): `ru`, `ar`, `en`
- `accessLevel` (optional): `free`, `pro`, `premium`
- `sortBy` (optional): `title`, `author`, `publishedDate`, `rating`
- `sortOrder` (optional): `asc`, `desc`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookId": 1,
      "title": "Сахих Бухари",
      "author": "Имам аль-Бухари",
      "category": "religious",
      "genre": "hadith",
      "accessLevel": "free",
      "cover": "https://...",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /library/books/:id

Get book by ID.

### GET /library/books/featured

Get featured/new books.

**Query Parameters:**
- `limit` (optional): Number of books (default: 10)

### GET /library/nashids

Get all nashids with filters.

**Query Parameters:** (same as books)

### GET /library/nashids/:id

Get nashid by ID.

### GET /library/stats

Get library statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "books": {
      "total": 150,
      "free": 60,
      "pro": 70,
      "premium": 20
    },
    "nashids": {
      "total": 200
    }
  }
}
```

---

## 🕌 Prayer API

### GET /prayer/lessons

Get all lessons.

**Query Parameters:**
- `category` (optional): `obligatory-prayers`, `optional-prayers`, `special-prayers`, `ablution`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "fajr-prayer",
      "title": "Фаджр (Утренний намаз)",
      "category": "obligatory-prayers",
      "difficulty": "beginner",
      "estimatedMinutes": 15,
      "steps": [
        {
          "id": "1",
          "title": "Намерение (Ният)",
          "titleArabic": "النية",
          "description": "...",
          "order": 1
        },
        ...
      ]
    }
  ]
}
```

### GET /prayer/lessons/:slug

Get lesson by slug.

### GET /prayer/lessons/featured

Get featured lessons.

### GET /prayer/lessons/category/:category

Get lessons by category.

### GET /prayer/lessons/difficulty/:difficulty

Get lessons by difficulty (`beginner`, `intermediate`, `advanced`).

### GET /prayer/search

Search lessons.

**Query Parameters:**
- `q` (required): Search query

### GET /prayer/stats

Get prayer statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byCategory": {
      "obligatory": 5,
      "optional": 10,
      "special": 5,
      "ablution": 5
    }
  }
}
```

---

## 🤖 AI API

**Note:** All AI endpoints are rate-limited (10 requests per 15 minutes for free tier).

### POST /ai/ask

Ask general question about Quran/Islam.

**Request Body:**
```json
{
  "question": "Что такое таухид?",
  "language": "ru",
  "context": {
    "surahNumber": 112,
    "ayahNumber": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "Что такое таухид?",
    "answer": "Таухид — это единобожие, основополагающий принцип ислама..."
  }
}
```

### POST /ai/explain-verse

Explain a specific Quranic verse.

**Request Body:**
```json
{
  "surahNumber": 2,
  "ayahNumber": 255,
  "language": "ru",
  "level": "detailed" // or "simple"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "surahNumber": 2,
    "ayahNumber": 255,
    "explanation": "Аят аль-Курси является одним из величайших аятов Корана..."
  }
}
```

### POST /ai/recommend-books

Get book recommendations.

**Request Body:**
```json
{
  "interests": ["hadith", "seerah"],
  "readBooks": [1, 5, 10],
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": "На основе ваших интересов рекомендую следующие книги:\n1. Сахих Муслим...\n2. ..."
  }
}
```

### POST /ai/search

Smart search across all content.

**Request Body:**
```json
{
  "query": "как правильно совершать омовение",
  "type": "all", // or "quran", "library", "prayer"
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "как правильно совершать омовение",
    "results": "Вот что я нашел по вашему запросу:\n\n1. Урок 'Как совершать вуду'..."
  }
}
```

---

## ❌ Error Handling

All errors follow the same format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_AUTH` | 401 | Invalid Telegram authentication |
| `AUTH_EXPIRED` | 401 | Authentication expired (>24h) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `AI_RATE_LIMIT` | 429 | AI request limit exceeded |
| `OFFLINE_LIMIT_REACHED` | 403 | Offline download limit reached |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## ⏱️ Rate Limiting

### General API

- **Window**: 15 minutes
- **Max Requests**: 100 requests

### AI Endpoints

- **Window**: 15 minutes
- **Max Requests**:
  - Free tier: 10 requests
  - Pro tier: 100 requests
  - Premium tier: Unlimited

### Auth Endpoints

- **Window**: 15 minutes
- **Max Requests**: 20 requests

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635789600
```

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": { /* optional metadata */ }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ /* items */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🔗 Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:4000/api/v1` |
| Staging | `https://staging.mubarakway.com/api/v1` |
| Production | `https://api.mubarakway.com/api/v1` |

---

**Last Updated:** 26 October 2025
**API Version:** 1.0.0
