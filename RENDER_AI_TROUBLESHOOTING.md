# Troubleshooting AI Timeout на Render

## 🐛 Проблема

**Симптом**: Timeout 30000ms при запросе к `/api/v1/ai/ask`

**Логи**:
```
🤖 AI Service: Sending request to /ai/ask
{ question: "Explain the concept of Tawhid", language: "ru" }

❌ timeout of 30000ms exceeded
```

**Backend URL**: `https://mubarak-way-backend.onrender.com/api/v1`

## 🔍 Диагностика

### 1. Проверьте Health Endpoint

Откройте в браузере:
```
https://mubarak-way-backend.onrender.com/health
```

**Ожидаемый ответ**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T18:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

Если не отвечает - сервер не запущен или упал.

### 2. Проверьте Переменные Окружения на Render

#### Обязательные для AI:

1. **OPENAI_API_KEY** ⚠️ КРИТИЧНО!
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxx
   ```
   Без этого AI не работает!
   **Важно**: Возьмите ключ из вашего локального `.env` файла!

2. **MONGODB_URI**
   ```
   mongodb+srv://...
   ```

3. **TELEGRAM_BOT_TOKEN**
   ```
   8257886464:AAHrJ525...
   ```

4. **JWT_SECRET**
   ```
   mubarakway-admin-jwt-secret-2025-production-key
   ```

5. **ELASTICSEARCH_API_URL** (опционально, но лучше добавить)
   ```
   https://bot.e-replika.ru/api/v1/elasticsearch
   ```

6. **ELASTICSEARCH_API_TOKEN** (опционально)
   ```
   test_token_123
   ```

#### Как проверить на Render:

1. Зайдите в **Render Dashboard**
2. Откройте ваш backend service: **mubarak-way-backend**
3. Перейдите в **Environment**
4. Проверьте что есть все переменные выше

#### Как добавить переменные:

1. В разделе **Environment** нажмите **Add Environment Variable**
2. Добавьте:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `[Ваш OpenAI API key из backend/.env]`
3. Нажмите **Save Changes**
4. Render автоматически **re-deploy** сервис

**Где взять OPENAI_API_KEY**: Скопируйте из `backend/.env` файла (строка 21)

### 3. Проверьте Логи на Render

#### Как посмотреть логи:

1. В **Render Dashboard** откройте ваш backend service
2. Перейдите в **Logs** (вкладка)
3. Найдите ошибки при запуске или при обработке запросов

#### Что искать в логах:

❌ **Ошибка: OPENAI_API_KEY not configured**
```
AI ask error: Error: OPENAI_API_KEY not configured
```
**Решение**: Добавьте `OPENAI_API_KEY` в Environment на Render

❌ **Ошибка: OpenAI API authentication failed**
```
Error: 401 Unauthorized - Invalid API key
```
**Решение**: API key неверный или истёк. Получите новый на platform.openai.com

❌ **Ошибка: Rate limit exceeded**
```
Error: 429 Too Many Requests
```
**Решение**: Превышен лимит OpenAI. Проверьте usage на platform.openai.com

❌ **Ошибка: Insufficient quota**
```
Error: 429 You exceeded your current quota
```
**Решение**: Закончились кредиты на OpenAI аккаунте. Пополните баланс.

❌ **Ошибка: MongoDB connection failed**
```
❌ MongoDB connection failed
```
**Решение**: Проверьте `MONGODB_URI` в Environment

### 4. Проверьте Статус OpenAI API

Откройте: https://status.openai.com/

Если статус не "All Systems Operational" - проблема на стороне OpenAI.

### 5. Проверьте OpenAI Account

1. Зайдите на https://platform.openai.com/
2. Перейдите в **Billing** → **Usage**
3. Проверьте:
   - ✅ Есть ли активная подписка или кредиты
   - ✅ Не превышен ли лимит запросов
   - ✅ Действителен ли API key

### 6. Тест Debug Endpoint

Если сервер запущен, протестируйте debug endpoint:

```bash
curl -X POST https://mubarak-way-backend.onrender.com/api/v1/debug/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Ожидаемый ответ**:
```json
{
  "success": true,
  "data": {
    "testMessage": "Test",
    "response": "Hello! How can I help you?",
    "model": "gpt-4o-mini",
    "tokensUsed": {...},
    "responseTime": "1.5s"
  }
}
```

**Если ошибка**:
```json
{
  "success": false,
  "error": {
    "code": "AI_NOT_CONFIGURED",
    "message": "OPENAI_API_KEY not configured"
  }
}
```

## 🔧 Пошаговое Решение

### Шаг 1: Добавить Переменные на Render

На Render Dashboard в **Environment** добавьте:

```env
# AI Service
OPENAI_API_KEY=sk-proj-xxxx... # ← Возьмите из локального backend/.env файла!

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database # ← Из локального .env

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABC... # ← Из локального .env
WEBAPP_URL=https://mubarak-way-frontend.onrender.com # ← URL вашего фронтенда на Render

# JWT
JWT_SECRET=mubarakway-admin-jwt-secret-2025-production-key
JWT_EXPIRES_IN=7d

# Elasticsearch (optional but recommended)
ELASTICSEARCH_API_URL=https://bot.e-replika.ru/api/v1/elasticsearch
ELASTICSEARCH_API_TOKEN=test_token_123

# Node Environment
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://mubarak-way-frontend.onrender.com,https://web.telegram.org

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AI_MAX_REQUESTS=10
```

### Шаг 2: Дождитесь Re-deploy

После сохранения переменных Render автоматически перезапустит сервис.

Следите за логами в разделе **Logs**.

### Шаг 3: Проверьте Запуск

В логах должны быть строки:
```
✅ MongoDB connected successfully
🤖 Starting Telegram bot...
🚀 Server listening on port 10000
```

### Шаг 4: Протестируйте AI

1. Откройте Telegram Web App
2. Перейдите в AI Ассистент
3. Отправьте вопрос
4. Проверьте логи браузера (F12)

**Ожидаемые логи**:
```
🤖 AI Service: Sending request to /ai/ask
✅ AI Service: Response received from /ai/ask
📝 AIChatPage: Processing AI response
📝 AIChatPage: Extracted answerText: "..."
✅ AIChatPage: Adding assistant message
```

## 📊 Проверка через Render Dashboard

### Environment Variables Checklist

Убедитесь что на Render установлены:

- [x] **OPENAI_API_KEY** - ключ OpenAI API
- [x] **MONGODB_URI** - строка подключения MongoDB
- [x] **TELEGRAM_BOT_TOKEN** - токен Telegram бота
- [x] **JWT_SECRET** - секрет для JWT
- [x] **NODE_ENV** - должен быть `production`
- [x] **ALLOWED_ORIGINS** - URL фронтенда
- [ ] **ELASTICSEARCH_API_URL** - (опционально)
- [ ] **ELASTICSEARCH_API_TOKEN** - (опционально)

### Logs Analysis

Если в логах видите:

#### ✅ Успешный запуск:
```
[dotenv] injecting env (10) from .env
✅ MongoDB connected successfully
🤖 Starting Telegram bot...
🚀 Server listening on port 10000
```

#### ❌ Проблема с переменными:
```
ValidationError: "OPENAI_API_KEY" is required
```
**Решение**: Добавьте переменную на Render

#### ❌ Проблема с MongoDB:
```
❌ MongoDB connection failed: MongoServerError: Authentication failed
```
**Решение**: Проверьте `MONGODB_URI`

#### ❌ Проблема с OpenAI:
```
POST /api/v1/ai/ask - 503 - 100ms
AI ask error: Error: OPENAI_API_KEY not configured
```
**Решение**: Добавьте `OPENAI_API_KEY`

## 🚨 Частые Ошибки

### 1. Забыли добавить OPENAI_API_KEY

**Симптом**: Timeout или 503 ошибка

**Решение**: Добавьте в Environment на Render

### 2. Неверный OpenAI API Key

**Симптом**: 401 Unauthorized

**Решение**:
1. Зайдите на https://platform.openai.com/api-keys
2. Создайте новый API key
3. Обновите на Render

### 3. Закончились кредиты на OpenAI

**Симптом**: 429 Quota exceeded

**Решение**:
1. Зайдите на https://platform.openai.com/billing
2. Добавьте payment method
3. Пополните баланс ($5-10 достаточно на тестирование)

### 4. Rate Limiting

**Симптом**: 429 Too Many Requests

**Решение**: Подождите или увеличьте лимиты в настройках OpenAI

### 5. Timeout из-за холодного старта Render

**Симптом**: Первый запрос timeout, следующие работают

**Решение**: Это нормально для free tier Render. Подождите 30 секунд и попробуйте снова.

## 🔄 Проверка после исправления

1. ✅ Переменные добавлены на Render
2. ✅ Сервис успешно запустился (проверить в Logs)
3. ✅ Health endpoint отвечает
4. ✅ Debug endpoint возвращает успешный ответ
5. ✅ AI запрос работает в Telegram Web App

## 💡 Рекомендации

### Увеличить Timeout на Frontend

Render free tier может быть медленным. Увеличьте timeout в `frontend/src/shared/lib/api.ts`:

```typescript
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // ← Увеличено с 30000 до 60000 (60 секунд)
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Добавить Retry Logic

В `aiService.ts` добавьте повторные попытки:

```typescript
const MAX_RETRIES = 2;

ask: async (request: AIAskRequest, retryCount = 0) => {
  try {
    const response = await apiPost<...>('/ai/ask', request);
    return response;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES && error.message.includes('timeout')) {
      console.log(`⚠️ Retry attempt ${retryCount + 1}/${MAX_RETRIES}`);
      return aiService.ask(request, retryCount + 1);
    }
    throw error;
  }
}
```

### Мониторинг

Используйте Render dashboard для мониторинга:
- **Metrics** - CPU, Memory usage
- **Logs** - ошибки в реальном времени
- **Events** - deploys, restarts

## 📞 Контакты для помощи

Если проблема не решается:

1. Скопируйте логи из **Render Logs**
2. Скопируйте логи из **Browser Console** (F12)
3. Проверьте скриншот **Environment Variables** на Render
4. Опишите шаги которые уже попробовали

---

**Дата создания**: 2025-10-28
**Статус**: ✅ Готово к использованию
**Приоритет**: 🔴 КРИТИЧНО - AI не работает без этих настроек
