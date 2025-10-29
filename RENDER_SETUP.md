# Render.com Setup Instructions

## Шаг 1: Добавить Environment Variables

Зайдите в **Render Dashboard** → **mubarak-way-backend** → **Environment**

Добавьте следующие переменные:

### Quran.com OAuth2 (PRODUCTION)

```
QURAN_COM_CLIENT_ID=3d370570-a211-4e38-8ca4-882792179406
QURAN_COM_CLIENT_SECRET=N-nuFPys0DNqCsALrTKtoHrwTT
QURAN_COM_ENDPOINT=https://oauth2.quran.foundation
```

### OpenAI API (для AI Chat)

```
OPENAI_API_KEY=sk-proj-ваш_ключ_здесь
```

⚠️ **Вам нужно получить OpenAI API key:**
1. Зайдите на https://platform.openai.com/api-keys
2. Create new secret key
3. Скопируйте ключ (начинается с `sk-proj-...`)
4. Добавьте в Render

---

## Шаг 2: Запустить синхронизацию Корана

После деплоя с новыми env variables:

### Вариант A: Через Render Shell (рекомендуется)

1. Зайдите в **Render Dashboard** → **mubarak-way-backend**
2. Нажмите **Shell** (справа вверху)
3. Выполните команды:

```bash
cd /opt/render/project/src

# Проверить статус
npm run sync:quran -- --check

# Запустить полную синхронизацию (⏳ ~15 минут)
npm run sync:quran -- --all

# После завершения проверить результат
npm run sync:quran -- --check
```

**Ожидаемый результат:**
```
📊 Sync Status:
  - Total verses: 6236
  - Synced verses: 6236
  - Progress: 100.0%
  - Needs sync: ✅ No
```

### Вариант B: Создать Cron Job (автоматически)

1. В Render Dashboard создайте **New → Cron Job**
2. Настройки:
   ```
   Name: quran-sync-monthly
   Environment: Use existing environment (mubarak-way-backend)
   Build Command: cd backend && npm install
   Start Command: cd backend && npm run sync:quran -- --all
   Schedule: 0 0 1 * * (каждое 1-е число месяца в 00:00)
   ```

3. Запустите вручную первый раз: **Manual Deploy**

---

## Шаг 3: Проверка синхронизации

### Через MongoDB Atlas Dashboard:

1. Зайдите в MongoDB Atlas → **Browse Collections**
2. Database: `mubarak-way`
3. Проверьте коллекции:
   - `surahs` - должно быть 114 документов
   - `ayahs` - должно быть ~6236 документов

### Через Render Shell:

```bash
# Подключиться к MongoDB
mongo $MONGODB_URI

# Выполнить запросы
use mubarak-way
db.surahs.countDocuments()  // 114
db.ayahs.countDocuments()   // 6236
```

---

## Шаг 4: Тестирование API

После успешной синхронизации проверьте API:

```bash
# Получить все суры
curl https://mubarak-way-backend.onrender.com/api/v1/quran/surahs

# Получить аяты суры 1
curl https://mubarak-way-backend.onrender.com/api/v1/quran/surahs/1/ayahs?language=ru

# Поиск
curl https://mubarak-way-backend.onrender.com/api/v1/quran/search?q=милосердие&language=ru
```

---

## Troubleshooting

### Ошибка: "OAuth2 authentication failed"

**Проблема:** Неправильные credentials

**Решение:**
1. Проверьте что QURAN_COM_CLIENT_ID и CLIENT_SECRET точно скопированы
2. Убедитесь что нет лишних пробелов
3. Перезапустите backend service

### Ошибка: "MongoDB connection failed"

**Проблема:** Проблема с MONGODB_URI

**Решение:**
1. Проверьте что MONGODB_URI правильный в Render Environment
2. Убедитесь что IP Render серверов добавлен в MongoDB Atlas Network Access
3. В MongoDB Atlas → Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)

### Sync застрял на определенной суре

**Проблема:** Rate limiting или timeout

**Решение:**
```bash
# Продолжить с конкретной суры
npm run sync:quran -- --ayahs 50
npm run sync:quran -- --ayahs 51
# ... и так далее
```

---

## Production Checklist

Перед финальным деплоем убедитесь:

- [ ] ✅ MONGODB_URI настроен
- [ ] ✅ QURAN_COM_CLIENT_ID (production) добавлен
- [ ] ✅ QURAN_COM_CLIENT_SECRET (production) добавлен
- [ ] ✅ OPENAI_API_KEY добавлен
- [ ] ✅ TELEGRAM_BOT_TOKEN добавлен
- [ ] ✅ JWT_SECRET установлен (min 32 символа)
- [ ] ✅ ANTHROPIC_API_KEY добавлен (если используете Claude)
- [ ] ✅ NODE_ENV=production
- [ ] ✅ Синхронизация Корана выполнена (6236/6236 verses)
- [ ] ✅ API endpoints отвечают корректно

---

## Полный список Environment Variables для Render

```env
# Server
NODE_ENV=production
PORT=10000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mubarak-way

# Quran.com OAuth2
QURAN_COM_CLIENT_ID=3d370570-a211-4e38-8ca4-882792179406
QURAN_COM_CLIENT_SECRET=N-nuFPys0DNqCsALrTKtoHrwTT
QURAN_COM_ENDPOINT=https://oauth2.quran.foundation

# OpenAI
OPENAI_API_KEY=sk-proj-ваш_ключ_здесь

# Telegram
TELEGRAM_BOT_TOKEN=ваш_токен
WEBAPP_URL=https://mubarak-way-frontend.onrender.com

# JWT
JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
JWT_EXPIRES_IN=7d

# Optional: Anthropic Claude (alternative to OpenAI)
ANTHROPIC_API_KEY=sk-ant-api03-ваш_ключ

# Optional: E-Replika API
ELASTICSEARCH_API_URL=https://bot.e-replika.ru
ELASTICSEARCH_API_TOKEN=ваш_токен

# Cache & Rate Limiting
CACHE_TTL=3600
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AI_MAX_REQUESTS=10

# Logging
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=https://mubarak-way-frontend.onrender.com,https://web.telegram.org,https://t.me
```

---

## После синхронизации

1. ✅ Frontend автоматически начнет получать данные из БД
2. ✅ Все страницы Корана заработают
3. ✅ Поиск по Корану заработает
4. ✅ API будет быстрым (нет внешних запросов)

**Следующий шаг:** Добавить русскую локализацию и интегрировать нашиды!
