# Production Deployment Checklist

## Дата: 2025-10-29

## Pre-Deployment Checklist

### ✅ Выполнено

- [x] **Переведено на русский язык**
  - ✅ Добавлено ~200 ключей перевода (ru, en, ar)
  - ✅ Quran раздел (суры, аяты, закладки, поиск)
  - ✅ Library раздел (книги, нашиды, категории)
  - ✅ AI Chat раздел (вопросы, источники, история)
  - ✅ Settings раздел (аккаунт, конфиденциальность, уведомления)
  - 📝 Файл: `frontend/src/shared/lib/i18n.ts`

- [x] **Интегрированы нашиды из E-Replika API**
  - ✅ libraryService использует catalogService
  - ✅ Автоматическая конвертация CatalogItem → Nashid
  - ✅ Поддержка многоязычных названий (ru, en, ar)
  - ✅ Cover изображения, audio URLs, duration
  - 📝 Файлы: `frontend/src/shared/lib/services/libraryService.ts`, `catalogService.ts`

- [x] **Настроен AI Chat**
  - ✅ OpenAI GPT-4o-mini интеграция
  - ✅ Объяснение аятов с контекстом
  - ✅ Общие вопросы об Исламе с цитатами
  - ✅ Рекомендации книг
  - ✅ Умный поиск
  - ✅ Многоязычность (ru, en, ar)
  - ✅ История разговоров
  - ✅ Rate limiting (10 запросов/15 мин)
  - 📝 Файлы: `backend/src/services/AIService.ts`, `backend/src/routes/ai.ts`

- [x] **Исправлены баги из предыдущих сессий**
  - ✅ QiblaCompass undefined (3e539d5)
  - ✅ PWA иконки 404 (33a8b2f)
  - ✅ Telegram белый экран (d1b03bf)

- [x] **Создана документация**
  - ✅ API_ARCHITECTURE.md - Архитектура API
  - ✅ INTEGRATION_PLAN.md - План интеграции
  - ✅ QURAN_SYNC_GUIDE.md - Синхронизация Корана
  - ✅ RENDER_SETUP.md - Настройка Render
  - ✅ AI_CHAT_SETUP.md - Настройка AI Chat

- [x] **QuranSyncService создан**
  - ✅ OAuth2 авторизация с Quran.com
  - ✅ Синхронизация 114 сур
  - ✅ Синхронизация 6236 аятов
  - ✅ Поддержка множества переводов (ru, en, ar, tr, uz, kk)
  - ✅ Rate limiting (500ms между запросами)
  - ✅ CLI команды (--all, --check, --surahs, --ayahs)
  - 📝 Файлы: `backend/src/services/QuranSyncService.ts`, `backend/src/scripts/syncQuran.ts`

### ⏳ Требует действий пользователя

- [ ] **1. Получить OpenAI API ключ**
  - 🔗 Перейти: https://platform.openai.com/api-keys
  - ➕ Создать новый ключ: "Mubarak Way Production"
  - 📋 Скопировать ключ (начинается с `sk-proj-...`)
  - 💰 Стоимость: ~$1-2 за 1000 запросов (gpt-4o-mini)
  - 📖 Документация: `AI_CHAT_SETUP.md`

- [ ] **2. Добавить переменные окружения в Render**
  - 🔗 Render Dashboard → mubarak-way-backend → Environment
  - Добавить:
    ```
    QURAN_COM_CLIENT_ID=3d370570-a211-4e38-8ca4-882792179406
    QURAN_COM_CLIENT_SECRET=N-nuFPys0DNqCsALrTKtoHrwTT
    QURAN_COM_ENDPOINT=https://oauth2.quran.foundation
    OPENAI_API_KEY=sk-proj-ваш_ключ_здесь
    ```
  - 💾 Save Changes
  - ⏱️ Подождать автоматический redeploy (~2 мин)
  - 📖 Документация: `RENDER_SETUP.md` (шаг 1)

- [ ] **3. Запустить синхронизацию Корана на Render**
  - 🔗 Render Dashboard → mubarak-way-backend → Shell
  - Выполнить:
    ```bash
    cd /opt/render/project/src
    npm run sync:quran -- --check     # Проверить статус
    npm run sync:quran -- --all       # Запустить полную синхронизацию
    ```
  - ⏱️ Время: ~15-20 минут (6236 аятов)
  - ✅ Ожидаемый результат:
    ```
    📊 Sync Status:
      - Total verses: 6236
      - Synced verses: 6236
      - Progress: 100.0%
      - Needs sync: ✅ No
    ```
  - 📖 Документация: `RENDER_SETUP.md` (шаг 2), `QURAN_SYNC_GUIDE.md`

- [ ] **4. Протестировать все фичи**
  - Открыть приложение: @MubarakWayApp_bot
  - Тесты:
    - ✅ Главная страница загружается
    - ✅ Namaz расписание показывает правильное время
    - ✅ Qibla компас работает
    - ✅ Quran → Список сур (114 сур)
    - ✅ Quran → Чтение суры (аяты загружаются)
    - ✅ Library → Нашиды (данные из E-Replika API)
    - ✅ Library → Нашиды → Воспроизведение аудио
    - ✅ AI Chat → Задать вопрос → Получить ответ с цитатами
    - ✅ AI Chat → Объяснить аят → Получить tafsir
    - ✅ Settings → Переключить язык (ru/en/ar)
    - ✅ Settings → Сменить тему (light/dark)

- [ ] **5. Задеплоить frontend на Render**
  - 🔗 Render Dashboard → mubarak-way-frontend
  - 🚀 Manual Deploy → Deploy latest commit
  - ⏱️ Время: ~3-5 минут
  - ✅ Проверить: https://your-frontend.onrender.com загружается

- [ ] **6. Проверить Telegram WebApp**
  - Открыть бота: @MubarakWayApp_bot
  - Нажать "Open App"
  - Проверить:
    - ✅ Приложение загружается (не белый экран)
    - ✅ Telegram SDK инициализирован
    - ✅ User data доступна
    - ✅ Haptic feedback работает
    - ✅ BackButton работает

## Post-Deployment Verification

### API Endpoints тестирование

```bash
# Backend URL (замените на ваш)
BACKEND_URL="https://your-backend.onrender.com"

# 1. Health check
curl $BACKEND_URL/api/v1/health

# 2. Quran - Get Surahs
curl $BACKEND_URL/api/v1/quran/surahs

# 3. Quran - Get Surah 1
curl "$BACKEND_URL/api/v1/quran/surahs/1/ayahs?language=ru"

# 4. Library - Get Nasheeds
curl "$BACKEND_URL/api/v1/library/nashids?limit=10"

# 5. AI Chat - Ask question
curl -X POST $BACKEND_URL/api/v1/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Что говорит Ислам о намазе?", "language": "ru"}'

# 6. AI Chat - Explain verse
curl -X POST $BACKEND_URL/api/v1/ai/explain-verse \
  -H "Content-Type: application/json" \
  -d '{"surahNumber": 1, "ayahNumber": 1, "language": "ru", "detailLevel": "medium"}'
```

### Ожидаемые ответы

**✅ Health Check:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-10-29T12:00:00.000Z"
  }
}
```

**✅ Surahs:**
```json
{
  "success": true,
  "data": [
    {
      "surahNumber": 1,
      "name": "Al-Fatihah",
      "nameArabic": "الفاتحة",
      "nameRussian": "Открывающая",
      "versesCount": 7,
      "revelationPlace": "meccan"
    },
    ...
  ]
}
```

**✅ Nasheeds:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "...",
        "nashidId": 1,
        "title": "...",
        "artist": "...",
        "audioUrl": "https://...",
        "coverUrl": "https://...",
        "duration": 180
      },
      ...
    ],
    "total": 50
  }
}
```

**✅ AI Ask:**
```json
{
  "success": true,
  "data": {
    "question": "Что говорит Ислам о намазе?",
    "answer": {
      "answer": "🤖 **Ответ:**\n\n## Молитва в Исламе\n\n...\n\n**Источник:**\n– **Коран, сура 2, аят 43**",
      "sources": [],
      "relatedVerses": []
    }
  }
}
```

## Monitoring

### После деплоя, отслеживайте:

1. **Render Dashboard**
   - 🔗 https://dashboard.render.com
   - Проверить логи backend
   - Проверить логи frontend
   - Проверить метрики (CPU, Memory)

2. **OpenAI Usage**
   - 🔗 https://platform.openai.com/usage
   - Отслеживать количество запросов
   - Отслеживать расходы
   - Установить budget alert ($10/month)

3. **MongoDB Atlas**
   - 🔗 https://cloud.mongodb.com
   - Проверить размер базы данных (~50MB после sync)
   - Проверить connections
   - Проверить performance metrics

4. **Telegram Bot**
   - 🔗 @BotFather
   - Проверить статус бота (active)
   - Проверить webhook status

## Rollback Plan

Если что-то пошло не так:

### Option 1: Rollback via Render Dashboard

1. Render Dashboard → mubarak-way-backend → Settings
2. Scroll to "Manual Deploy"
3. Select previous commit from dropdown
4. Click "Deploy"

### Option 2: Rollback via Git

```bash
# Find previous working commit
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>

# Force push to trigger redeploy
git push origin main --force
```

### Option 3: Disable Feature

Если проблема только с AI Chat:

```bash
# Remove OPENAI_API_KEY from Render
# AI endpoints will return "AI_NOT_CONFIGURED" error
# App will continue working without AI Chat
```

## Known Issues & Solutions

### Issue 1: Telegram белый экран

**Причина:** Telegram SDK не успел загрузиться

**Решение:** ✅ Уже исправлено в `TelegramProvider` (d1b03bf)

### Issue 2: PWA иконки 404

**Причина:** Не были сгенерированы icon-192.png и icon-512.png

**Решение:** ✅ Уже исправлено (33a8b2f)

### Issue 3: QiblaCompass undefined

**Причина:** Конфликт экспортов

**Решение:** ✅ Уже исправлено (3e539d5)

### Issue 4: Нашиды не загружаются

**Причина:** Использовались mock данные вместо реального API

**Решение:** ✅ Уже исправлено - интегрирован catalogService (815b572)

### Issue 5: AI Chat не работает

**Возможные причины:**
1. OPENAI_API_KEY не установлен
2. Коран не синхронизирован
3. OpenAI rate limit

**Решение:**
1. Добавить OPENAI_API_KEY в Render environment
2. Запустить `npm run sync:quran -- --all`
3. Подождать 60 секунд и попробовать снова

## Success Criteria

✅ **Деплой успешен, если:**

1. ✅ Backend здоров: `curl $BACKEND_URL/api/v1/health` → 200 OK
2. ✅ Frontend загружается: `https://your-frontend.onrender.com` → 200 OK
3. ✅ Telegram WebApp открывается: @MubarakWayApp_bot → No white screen
4. ✅ Коран синхронизирован: 6236 аятов в MongoDB
5. ✅ Нашиды загружаются из E-Replika API
6. ✅ AI Chat отвечает на вопросы с цитатами
7. ✅ Все языки работают: ru, en, ar
8. ✅ Темы работают: light, dark
9. ✅ PWA иконки отображаются
10. ✅ Qibla компас работает

## Timeline

| Шаг | Время | Статус |
|-----|-------|--------|
| 1. Получить OpenAI API key | 5 мин | ⏳ Pending |
| 2. Добавить env variables | 2 мин | ⏳ Pending |
| 3. Redeploy backend | 2 мин | ⏳ Pending |
| 4. Запустить sync Корана | 15-20 мин | ⏳ Pending |
| 5. Тестировать фичи | 10 мин | ⏳ Pending |
| 6. Deploy frontend | 5 мин | ⏳ Pending |
| 7. Проверить Telegram WebApp | 5 мин | ⏳ Pending |
| **ИТОГО** | **~45-50 мин** | |

## Cost Estimate

### Monthly costs:

| Сервис | План | Стоимость |
|--------|------|-----------|
| Render Backend | Free/Starter | $0-7/month |
| Render Frontend | Free | $0 |
| MongoDB Atlas | Free (M0) | $0 |
| OpenAI API | Pay-as-you-go | $10-50/month* |
| Quran.com API | Free | $0 |
| E-Replika API | Free | $0 |
| **ИТОГО** | | **$10-57/month** |

*Зависит от использования:
- 1000 запросов = ~$1-2
- 5000 запросов = ~$5-10
- 10000 запросов = ~$10-20

## Support Contacts

- **OpenAI Support:** https://help.openai.com
- **Render Support:** https://render.com/docs
- **MongoDB Support:** https://www.mongodb.com/docs/atlas/
- **Telegram Bot Support:** https://core.telegram.org/bots/api

## Final Notes

Все основные фичи **реализованы и готовы к деплою**:

✅ Quran с синхронизацией
✅ Нашиды из E-Replika API
✅ AI Chat с GPT-4o-mini
✅ Русский, English, Arabic языки
✅ Темы (light/dark)
✅ PWA ready
✅ Telegram WebApp ready

**Требуется от пользователя:**
1. Получить OpenAI API key
2. Добавить в Render env variables
3. Запустить sync Корана
4. Протестировать и задеплоить

**Время до production: ~1 час**

Удачи! 🚀
