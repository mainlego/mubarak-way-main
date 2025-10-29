# Архитектура API - Полный анализ

## Источники данных (по проекту mubarak-way-assistent)

### 1. Коран (Суры и Аяты)

**Основной источник:** Quran.com API
**URL:** `https://api.quran.com/api/v4/`
**Тип:** Публичное API, не требует токена

#### Endpoints:

```javascript
// 1. Получить аяты суры
GET https://api.quran.com/api/v4/verses/by_chapter/{chapter_number}
Params:
  - language: 'ru' | 'en' | 'ar' | ...
  - words: true
  - translations: 131 (для русского - Кулиев)
  - fields: 'text_uthmani,text_imlaei'

// Translation IDs:
const TRANSLATION_IDS = {
  'ru': 131,  // Russian - Kuliev
  'en': 85,   // English - Sahih International
  'ar': 54,   // Arabic - Tafseer
  'tr': 77,   // Turkish - Diyanet
  'uz': 84,   // Uzbek
  'kk': 109,  // Kazakh
  'ky': 131   // Kyrgyz (fallback to Russian)
};
```

**Формат ответа:**
```json
{
  "verses": [
    {
      "id": 1,
      "verse_number": 1,
      "verse_key": "1:1",
      "juz_number": 1,
      "hizb_number": 1,
      "rub_el_hizb_number": 1,
      "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "text_imlaei": "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      "words": [...],
      "translations": [...]
    }
  ]
}
```

---

### 2. Elasticsearch (Расширенный поиск)

**Источник:** Собственный backend
**URL:** `http://localhost:3001/api/elasticsearch/*`
**Требует:** Backend proxy для безопасности токена

#### Endpoints:

```javascript
// 1. Получить аяты суры
POST /api/elasticsearch/verses
Body: {
  "surahNumber": 1,
  "language": "ru",
  "translationId": "auto" | 131
}

// 2. Текстовый поиск
POST /api/elasticsearch/search
Body: {
  "query": "милосердие",
  "language": "ru",
  "size": 20
}

// 3. Семантический поиск (векторный)
POST /api/elasticsearch/semantic-search
Body: {
  "query": "как быть терпеливым",
  "language": "ru",
  "size": 10
}
```

**Преимущества Elasticsearch:**
- Полнотекстовый поиск на всех языках
- Семантический поиск (по смыслу)
- Быстрее чем Quran.com API
- Offline-ready (можно кешировать)

---

### 3. AI Сервисы

**Источник:** Собственный backend с OpenAI/Claude
**URL:** `http://localhost:3001/api/ai/*`

#### Endpoints:

```javascript
// 1. Умный поиск с AI
POST /api/ai/smart-search
Body: {
  "query": "о терпении в трудностях",
  "verses": [...],  // найденные аяты
  "language": "ru"
}
Response: {
  "answer": "...",  // AI-сгенерированный ответ
  "verses": [...]   // топ-5 релевантных аятов
}

// 2. Спросить у Корана
POST /api/ai/ask-quran
Body: {
  "question": "Как преодолеть страх?",
  "language": "ru"
}
Response: {
  "success": true,
  "answer": "...",
  "references": ["1:1", "2:255", ...]
}

// 3. Анализ слова
POST /api/ai/analyze-word
Body: {
  "word": "терпение",
  "language": "ru",
  "verses": [...]
}
Response: {
  "word": "терпение",
  "count": 42,
  "analysis": "...",
  "examples": [...]
}

// 4. Объяснить аят
POST /api/ai/explain-verse
Body: {
  "verse": {...},
  "context": "simple" | "detailed",
  "language": "ru"
}
Response: {
  "explanation": "...",
  "keywords": [...],
  "related_verses": [...]
}
```

---

### 4. Bot.e-replika.ru API (Каталог и Контент)

**URL:** `https://bot.e-replika.ru/api/v1`
**Требует:** Bearer token (получается через `/auth/test-token`)

#### Используется для:

```javascript
// 1. Нашиды
GET /catalog/items?category=nasheed&lang=ru

// 2. Книги
GET /library/books

// 3. Цели и прогресс
GET /goals/
POST /goals/

// 4. Подписки
GET /subscriptions/me

// 5. Пользователи
GET /users/me
PATCH /users/me

// 6. Тасбих
POST /tasbih/sessions
POST /tasbih/events

// 7. Азкары
GET /azkar/today
POST /azkar/start
```

---

## Архитектура приложения mubarak-way-assistent

```
┌─────────────────────────────────────────┐
│          React Frontend                 │
│  (Telegram Mini App / Web App)          │
└─────────────────────────────────────────┘
              │
              │
        ┌─────┴──────┬──────────┬───────────┐
        │            │          │           │
        ▼            ▼          ▼           ▼
┌──────────────┐ ┌────────┐ ┌───────┐ ┌──────────┐
│  Quran.com   │ │  Own   │ │  Own  │ │ e-replika│
│     API      │ │Backend │ │Backend│ │   API    │
│  (Public)    │ │  ES    │ │  AI   │ │ (Secure) │
└──────────────┘ └────────┘ └───────┘ └──────────┘
                      │          │
                      └────┬─────┘
                           │
                      ┌────▼─────┐
                      │Elasticsearch│
                      │  Cluster   │
                      └────────────┘
```

### Data Flow:

1. **Чтение Корана**:
   ```
   Frontend → quranApi.js → getVersesByChapter()
   ├─> Try: Elasticsearch (через backend proxy)
   └─> Fallback: Quran.com API (прямой запрос)
   ```

2. **Поиск**:
   ```
   Frontend → elasticsearchApi.js → searchQuran()
   → Backend Proxy → Elasticsearch
   ```

3. **AI Chat**:
   ```
   Frontend → aiService.js → askQuran()
   → Backend /api/ai/* → OpenAI/Claude API
   ```

4. **Нашиды/Контент**:
   ```
   Frontend → catalogService.ts → eReplikaApi.ts
   → https://bot.e-replika.ru/api/v1/*
   ```

---

## План миграции для mubarak-way-unified

### Этап 1: Создать сервисы для Quran.com API ✅ (МОЖНО НАЧИНАТЬ)

```typescript
// frontend/src/shared/lib/services/quranComService.ts

export const quranComService = {
  // Получить все суры (используя chapters.json локально)
  getAllSurahs: () => import('../data/chapters.json'),

  // Получить аяты суры
  getVersesByChapter: async (
    chapterId: number,
    language: string = 'ru'
  ) => {
    const translationId = TRANSLATION_MAP[language] || 131;
    const response = await axios.get(
      `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}`,
      {
        params: {
          language,
          words: true,
          translations: translationId,
          fields: 'text_uthmani,text_imlaei',
        },
      }
    );
    return response.data.verses;
  },

  // Поиск по Корану (через Quran.com)
  searchVerses: async (query: string, language: string = 'ru') => {
    // Используем Quran.com search API
  },
};
```

### Этап 2: Backend Elasticsearch Proxy (НУЖЕН BACKEND)

**Вариант A:** Развернуть на Render собственный backend
**Вариант B:** Использовать только Quran.com (медленнее, но проще)

```typescript
// backend/src/routes/elasticsearch.ts

router.post('/verses', async (req, res) => {
  const { surahNumber, language, translationId } = req.body;

  // Запрос к Elasticsearch
  const result = await esClient.search({
    index: 'quran_verses',
    body: {
      query: {
        match: { surah_number: surahNumber },
      },
    },
  });

  res.json({ success: true, verses: result.hits.hits });
});
```

### Этап 3: AI Integration (НУЖЕН AI API KEY)

**Варианты:**
1. OpenAI API (платный, но простой)
2. Claude API (Anthropic)
3. Собственная модель (сложно, дорого)

```typescript
// backend/src/routes/ai.ts

router.post('/ask-quran', async (req, res) => {
  const { question, language } = req.body;

  // 1. Поиск релевантных аятов
  const verses = await searchQuran(question);

  // 2. Формирование промпта для AI
  const prompt = `
    Вопрос пользователя: ${question}

    Релевантные аяты из Корана:
    ${verses.map(v => `${v.verse_key}: ${v.translation}`).join('\n')}

    Дай ответ со ссылками на аяты.
  `;

  // 3. Запрос к AI
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Ты исламский ученый...' },
      { role: 'user', content: prompt },
    ],
  });

  res.json({
    success: true,
    answer: aiResponse.choices[0].message.content,
    references: verses.map(v => v.verse_key),
  });
});
```

### Этап 4: Каталог (УЖЕ ГОТОВ) ✅

```typescript
// УЖЕ СОЗДАНО:
// - frontend/src/shared/lib/eReplikaApi.ts
// - frontend/src/shared/lib/services/catalogService.ts
// - frontend/src/shared/types/eReplika.ts

// НУЖНО ТОЛЬКО:
// - Интегрировать в NashidListPage.tsx
// - Тестирование
```

---

## Environment Variables

### Frontend (.env.production)

```env
# Наш собственный backend (Render)
VITE_API_BASE_URL=https://mubarak-way-backend.onrender.com/api/v1

# E-Replika API (каталог, нашиды, подписки)
VITE_QURAN_API_URL=https://bot.e-replika.ru/api/v1
VITE_QURAN_API_TOKEN=test_token_123  # получаем через /auth/test-token

# Telegram
VITE_TELEGRAM_BOT_USERNAME=MubarakWayBot
VITE_ENV=production
```

### Backend (.env)

```env
# Database
MONGO_URI=mongodb+srv://...

# Elasticsearch
ELASTICSEARCH_NODE=https://...
ELASTICSEARCH_API_KEY=...

# AI (если используем)
OPENAI_API_KEY=sk-...
# или
ANTHROPIC_API_KEY=sk-ant-...

# E-Replika
E_REPLIKA_API_URL=https://bot.e-replika.ru/api/v1
E_REPLIKA_API_TOKEN=...
```

---

## Следующие шаги

### Приоритет 1: Коран (КРИТИЧНО) 🔴

```typescript
// TODO: Создать quranComService.ts
// TODO: Интегрировать в SurahListPage
// TODO: Интегрировать в SurahReaderPage
// TODO: Тестирование с реальными данными
```

**Время:** 4-6 часов
**Зависимости:** Нет (используем публичное API)

### Приоритет 2: Русская локализация 🔴

```typescript
// TODO: Расширить i18n.ts с ~300 строками переводов
// TODO: Обновить все компоненты
```

**Время:** 6-8 часов
**Зависимости:** Нет

### Приоритет 3: Нашиды 🟡

```typescript
// TODO: Обновить NashidListPage с catalogService
// TODO: Тестирование audio player
```

**Время:** 2-3 часа
**Зависимости:** E-Replika API token

### Приоритет 4: AI Chat 🟡

```typescript
// TODO: Выбрать AI provider (OpenAI/Claude)
// TODO: Создать backend endpoints
// TODO: Интегрировать в AIChatPage
```

**Время:** 1-2 дня
**Зависимости:** AI API key, backend deployment

### Приоритет 5: Elasticsearch 🟢

```typescript
// TODO: Настроить Elasticsearch cluster
// TODO: Индексировать Коран
// TODO: Backend proxy
```

**Время:** 2-3 дня
**Зависимости:** Elasticsearch hosting (дорого)

---

## Вопросы для обсуждения

1. **AI Provider**: OpenAI (GPT-4) или Claude? Или свой backend с моделью?
2. **Elasticsearch**: Нужен ли сейчас или можно использовать только Quran.com?
3. **E-Replika Token**: Как получить production token? Test token работает?
4. **Приоритеты**: Что САМОЕ важное прямо сейчас?

---

**Готов начать реализацию!** Жду ваших ответов на вопросы.
