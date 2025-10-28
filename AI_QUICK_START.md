# AI Assistant Quick Start Guide

## Быстрый старт для разработчика (Quick Start for Developer)

### 1. Проверка работоспособности (Health Check)

```bash
# Проверить конфигурацию (Check configuration)
curl http://localhost:4000/api/v1/debug/config

# Тестировать OpenAI (Test OpenAI)
curl -X POST http://localhost:4000/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Это тест."}'

# Полный тест пайплайна (Full pipeline test)
curl -X POST http://localhost:4000/api/v1/debug/ai/full-test \
  -H "Content-Type: application/json" \
  -d '{"question": "Что говорит Коран о терпении?"}'
```

### 2. Основные функции ИИ (Main AI Functions)

#### Задать вопрос (Ask Question)
```bash
curl -X POST http://localhost:4000/api/v1/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "Что такое намаз?",
    "language": "ru"
  }'
```

#### Объяснить аят (Explain Verse)
```bash
curl -X POST http://localhost:4000/api/v1/ai/explain-verse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "surahNumber": 1,
    "ayahNumber": 1,
    "language": "ru",
    "detailLevel": "medium"
  }'
```

#### Умный поиск (Smart Search)
```bash
curl -X POST http://localhost:4000/api/v1/ai/smart-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "терпение и награда",
    "language": "ru"
  }'
```

### 3. Новые функции (New Features)

#### Получить тафсир (Get Tafsir)
```bash
curl -X POST http://localhost:4000/api/v1/ai/tafsir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "surahNumber": 2,
    "ayahNumber": 255,
    "language": "ru"
  }'
```

#### Поиск хадисов (Search Hadiths)
```bash
curl -X POST http://localhost:4000/api/v1/ai/hadiths/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "намаз обязанность",
    "language": "ru",
    "limit": 5
  }'
```

#### 99 Имён Аллаха (99 Names of Allah)
```bash
curl -X GET http://localhost:4000/api/v1/ai/allah-names \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Анализ слова (Word Analysis)
```bash
curl -X POST http://localhost:4000/api/v1/ai/analyze-word \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "word": "صبر",
    "language": "ar"
  }'
```

#### Простое объяснение (Simple Explanation)
```bash
curl -X POST http://localhost:4000/api/v1/ai/explain-simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "surahNumber": 1,
    "ayahNumber": 1,
    "level": "child",
    "language": "ru"
  }'
```

## Отладка проблем (Debugging Issues)

### Проблема: Пустая страница после вопроса (Blank page after question)

**Шаг 1**: Открыть консоль браузера (F12 → Console)

Ищите логи:
- 🤖 - Запрос отправлен (Request sent)
- ✅ - Ответ получен (Response received)
- ❌ - Ошибка (Error)
- 📝 - Обработка ответа (Processing response)

**Шаг 2**: Проверить формат ответа

```javascript
// Правильный формат (Correct format)
{
  "question": "Что такое намаз?",
  "answer": {
    "answer": "Текст ответа...",
    "sources": [...],
    "relatedVerses": [...]
  }
}
```

**Шаг 3**: Проверить бэкенд

```bash
# Проверить статус сервера
curl http://localhost:4000/health

# Проверить конфигурацию ИИ
curl http://localhost:4000/api/v1/debug/config
```

### Проблема: Нет результатов поиска (No search results)

**Шаг 1**: Проверить Elasticsearch

```bash
curl http://localhost:4000/api/v1/debug/elasticsearch/test
```

**Шаг 2**: Проверить анализ запроса

```bash
curl -X POST http://localhost:4000/api/v1/debug/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "ваш запрос здесь"}'
```

**Шаг 3**: Попробовать разные ключевые слова

- Используйте синонимы (Use synonyms)
- Попробуйте арабские термины (Try Arabic terms)
- Используйте более общие темы (Use broader topics)

### Проблема: OpenAI не отвечает (OpenAI not responding)

**Шаг 1**: Проверить API ключ

```bash
# Проверить переменные окружения
curl http://localhost:4000/api/v1/debug/env
```

**Шаг 2**: Тестировать соединение

```bash
curl -X POST http://localhost:4000/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

**Шаг 3**: Проверить лимиты

- Убедитесь что не превышен лимит запросов (Check rate limits)
- Проверьте баланс OpenAI аккаунта (Check OpenAI account balance)

## Переменные окружения (Environment Variables)

Создайте файл `backend/.env`:

```env
# Обязательные (Required)
MONGODB_URI=mongodb://localhost:27017/mubarak-way-unified
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=sk-proj-your_openai_key
JWT_SECRET=your_secure_jwt_secret

# Elasticsearch (обязательно для поиска)
ELASTICSEARCH_API_URL=https://bot.e-replika.ru
ELASTICSEARCH_API_TOKEN=your_elasticsearch_token

# Опциональные (Optional)
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
PORT=4000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100     # 100 requests per window
RATE_LIMIT_AI_MAX_REQUESTS=10   # 10 AI requests per window
```

## Структура проекта (Project Structure)

```
mubarak-way-unified/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── aiService.ts              # Базовый ИИ сервис
│   │   │   ├── AdvancedAIService.ts      # Продвинутые функции
│   │   │   ├── contextGathering.ts       # Анализ запросов
│   │   │   └── elasticsearchProxy.ts     # Поиск и тафсир
│   │   ├── routes/
│   │   │   ├── ai.ts                     # Эндпоинты ИИ
│   │   │   └── debug.ts                  # Эндпоинты отладки
│   │   └── models/
│   │       └── User.ts                   # История поиска + TTL
│   └── .env                              # Конфигурация
├── frontend/
│   ├── src/
│   │   ├── pages/quran/
│   │   │   └── AIChatPage.tsx           # Страница чата
│   │   └── shared/lib/services/
│   │       └── aiService.ts              # Клиент API
│   └── ...
├── AI_IMPLEMENTATION_SUMMARY.md          # Полная документация
├── AI_QUICK_START.md                     # Этот файл
└── DEBUG_PANEL.md                        # Документация отладки
```

## Подписки и лимиты (Subscriptions & Limits)

### Free Tier (Бесплатная подписка)
- 5 ИИ запросов в день (5 AI requests per day)
- История поиска: 1 день (Search history: 1 day)
- Избранное: постоянно (Favorites: permanent)

### Pro Tier
- 50 ИИ запросов в день (50 AI requests per day)
- История поиска: 30 дней (Search history: 30 days)
- Избранное: постоянно (Favorites: permanent)

### Premium Tier
- Безлимитные запросы (Unlimited requests)
- История поиска: 30 дней (Search history: 30 days)
- Избранное: постоянно (Favorites: permanent)

## Управление историей поиска (Search History Management)

### Очистка истории (Clean History)
```javascript
// Автоматическая очистка истекших записей
await user.cleanSearchHistory();
```

### Сделать избранным (Make Favorite)
```javascript
// Сделать постоянным (make permanent)
await user.toggleSearchFavorite(searchId);
```

### Очистить всё кроме избранного (Clear All Except Favorites)
```javascript
await user.clearSearchHistory();
```

## Производительность (Performance)

### Среднее время ответа (Average Response Time)
- Анализ запроса: 500-800ms
- Поиск в Elasticsearch: 200-400ms
- Генерация ответа: 1000-2000ms
- **Общее время: 1.5-3 секунды**

### Кэширование (Caching)
- Поиск: 5 минут
- Суры: 5 минут
- Тафсир: 5 минут
- Имена Аллаха: 1 час
- **Повторный запрос: <50ms**

## Полезные команды (Useful Commands)

### Запуск проекта (Start Project)
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Сборка проекта (Build Project)
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Проверка типов (Type Check)
```bash
# Backend
cd backend
npx tsc --noEmit

# Frontend
cd frontend
npx tsc --noEmit
```

### Логи в реальном времени (Real-time Logs)
```bash
# Backend
cd backend
npm run dev | grep "AI\|Error"
```

## Контакты и поддержка (Contact & Support)

При возникновении проблем:

1. ✅ Проверьте DEBUG_PANEL.md
2. ✅ Используйте эндпоинты /debug/*
3. ✅ Проверьте консоль браузера
4. ✅ Проверьте логи бэкенда
5. ✅ Проверьте .env файл

## Дополнительная документация (Additional Documentation)

- **AI_IMPLEMENTATION_SUMMARY.md** - Полная техническая документация
- **DEBUG_PANEL.md** - Документация панели отладки
- **backend/src/services/AdvancedAIService.ts** - Примеры использования
- **frontend/src/pages/quran/AIChatPage.tsx** - Пример интеграции

---

**Версия**: 1.0.0
**Обновлено**: 2025-10-28
**Статус**: ✅ Готово к использованию (Ready to use)
