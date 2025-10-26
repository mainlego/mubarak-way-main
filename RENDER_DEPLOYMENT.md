# 🚀 Render Deployment Guide - MubarakWay Unified

## ✅ Успешно выполнено!

Проект **MubarakWay Unified** успешно настроен для деплоя на Render и запушен на GitHub!

- **GitHub Repository:** https://github.com/mainlego/mubarak-way-main.git
- **Branch:** main
- **Commit:** Initial commit with full project structure

---

## 📋 Что было настроено

### ✅ 1. Render Blueprint (`render.yaml`)

Создан файл конфигурации для автоматического деплоя:

- **Backend Service:** Node.js web service на порту 10000
- **Frontend Service:** Static site с автоматической сборкой
- **Region:** Frankfurt (ближайший регион к пользователям)
- **Plan:** Free tier для обоих сервисов

### ✅ 2. Git Repository

- Инициализирован Git репозиторий
- Создан `.gitignore` для исключения ненужных файлов
- Сделан initial commit с полной структурой проекта
- Запушен на GitHub: `main` branch

### ✅ 3. Environment Templates

Созданы `.env.example` файлы:
- `backend/.env.example` - все необходимые переменные окружения
- `frontend/.env.example` - конфигурация фронтенда

### ✅ 4. Production Configuration

- Build скрипты настроены для production
- CORS настроен для Render URLs
- Rate limiting настроен
- MongoDB Atlas готов к использованию

---

## 🚀 Деплой на Render

### Шаг 1: Создать аккаунт на Render

1. Перейти на https://render.com
2. Зарегистрироваться через GitHub
3. Авторизовать доступ к репозиторию

### Шаг 2: Deploy через Blueprint

1. В Render Dashboard нажать **"New +"** → **"Blueprint"**
2. Выбрать репозиторий: `mainlego/mubarak-way-main`
3. Render автоматически найдет `render.yaml`
4. Нажать **"Apply"**

### Шаг 3: Настроить Environment Variables

#### Backend Service Environment Variables

В Render Dashboard → Backend Service → Environment:

```bash
# Обязательные переменные
MONGODB_URI=mongodb+srv://melishkairishka8_db_user:izxI35sDWAUk90x6@mubarak-way.vipbvcm.mongodb.net/mubarak-way-unified?retryWrites=true&w=majority
TELEGRAM_BOT_TOKEN=8257886464:AAHrJ525tcZV2WzbNWX-HWFc85T4OlJrgu0
JWT_SECRET=mubarakway-admin-jwt-secret-2025-production-key

# Опциональные (если есть)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_QURAN_API_TOKEN=test_token_123
```

**Важно:** Эти переменные уже есть в вашем `.env`, просто скопируйте их в Render!

#### Frontend Service Environment Variables

Frontend переменные уже настроены в `render.yaml`, но можно переопределить:

```bash
VITE_API_URL=https://mubarak-way-backend.onrender.com/api/v1
VITE_TELEGRAM_BOT_USERNAME=MubarakWayBot
VITE_QURAN_API_TOKEN=test_token_123
```

### Шаг 4: Обновить ALLOWED_ORIGINS после деплоя

После того как Render создаст URL для frontend, обновите в Backend Environment:

```bash
ALLOWED_ORIGINS=https://mubarak-way-frontend.onrender.com,https://web.telegram.org
```

---

## 📊 Статус деплоя

### Backend Service

- **Name:** mubarak-way-backend
- **Type:** Web Service
- **Expected URL:** `https://mubarak-way-backend.onrender.com`
- **Health Check:** `/health`
- **Build Time:** ~3-5 минут
- **Start Command:** `cd backend && npm start`

### Frontend Service

- **Name:** mubarak-way-frontend
- **Type:** Static Site
- **Expected URL:** `https://mubarak-way-frontend.onrender.com`
- **Build Time:** ~2-3 минуты
- **Publish Path:** `./frontend/dist`

---

## 🧪 Проверка после деплоя

### 1. Backend Health Check

```bash
curl https://mubarak-way-backend.onrender.com/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "environment": "production"
}
```

### 2. API Test

```bash
curl https://mubarak-way-backend.onrender.com/api/v1/quran/surahs
```

Должен вернуть список сур.

### 3. Frontend Test

Открыть в браузере:
```
https://mubarak-way-frontend.onrender.com
```

Должна загрузиться главная страница приложения.

### 4. Full Integration Test

1. Открыть frontend URL
2. Проверить загрузку данных с backend
3. Протестировать все модули:
   - Quran - должны загрузиться 5 сур
   - Library - должна открыться страница
   - Prayer - должна открыться страница
   - Settings - проверить переключение языка

---

## 🔧 Troubleshooting

### Backend не запускается

**Проблема:** Build fails или Health check fails

**Решение:**
1. Проверить логи в Render Dashboard
2. Убедиться что `MONGODB_URI` правильно настроен
3. Проверить что все env переменные установлены
4. Проверить что в `render.yaml` правильные команды

### Frontend показывает ошибки API

**Проблема:** Network errors при загрузке данных

**Решение:**
1. Проверить что `VITE_API_URL` указывает на правильный backend URL
2. Проверить CORS настройки в backend
3. Убедиться что backend успешно задеплоен и работает

### Ошибки CORS

**Проблема:** `Access-Control-Allow-Origin` errors

**Решение:**
1. Обновить `ALLOWED_ORIGINS` в backend environment
2. Добавить фактический frontend URL от Render
3. Перезапустить backend service

### Build fails with "Module not found"

**Проблема:** Не находит модули при сборке

**Решение:**
1. Проверить что `buildCommand` использует `--legacy-peer-deps`
2. Очистить кэш: Settings → Clear build cache
3. Trigger manual deploy

---

## 🎯 Post-Deployment Checklist

После успешного деплоя:

- [ ] Backend работает и отвечает на `/health`
- [ ] Frontend загружается корректно
- [ ] API endpoints работают
- [ ] MongoDB подключена и данные доступны
- [ ] Все 5 сур отображаются в разделе Quran
- [ ] Subscription plans загружены (проверить в БД)
- [ ] CORS настроен правильно
- [ ] Env variables установлены корректно
- [ ] Logs показывают нормальную работу

---

## 📈 Мониторинг

### Render Dashboard

- **Logs:** Render автоматически собирает логи
- **Metrics:** CPU, Memory, Network usage
- **Health Checks:** Автоматические проверки `/health`

### Полезные команды для проверки

```bash
# Проверить health backend
curl https://mubarak-way-backend.onrender.com/health

# Проверить API
curl https://mubarak-way-backend.onrender.com/api/v1/status

# Проверить количество сур
curl https://mubarak-way-backend.onrender.com/api/v1/quran/surahs | jq '.data | length'

# Проверить subscription plans
curl https://mubarak-way-backend.onrender.com/api/v1/subscriptions
```

---

## 🔄 Автоматический деплой

Render автоматически деплоит при push в GitHub:

```bash
# Внести изменения
git add .
git commit -m "Your changes"
git push origin main

# Render автоматически:
# 1. Обнаружит изменения
# 2. Запустит build
# 3. Задеплоит новую версию
```

---

## 💰 Free Tier Limits

### Render Free Plan:

- **Web Services:** 750 hours/month (достаточно для 1 сервиса 24/7)
- **Static Sites:** Unlimited
- **Builds:** 400 build minutes/month
- **Bandwidth:** 100GB/month
- **Sleep after inactivity:** 15 минут (первый запрос займет ~30 секунд)

### Рекомендации для Free Tier:

1. Backend может "засыпать" - первый запрос будет медленным
2. Использовать external cron для keep-alive (например, cron-job.org)
3. Оптимизировать сборку для экономии build minutes

---

## 📞 Поддержка

### Render Support

- **Документация:** https://render.com/docs
- **Community:** https://community.render.com
- **Status:** https://status.render.com

### Project Issues

- **GitHub Issues:** https://github.com/mainlego/mubarak-way-main/issues

---

## 🎉 Готово!

Проект успешно настроен для деплоя на Render через Blueprint!

### Что делать дальше:

1. **Перейти на Render.com** и создать Blueprint deployment
2. **Настроить environment variables** (особенно MongoDB URI)
3. **Дождаться успешного деплоя** (5-10 минут)
4. **Протестировать приложение** на production URLs
5. **Настроить Telegram Bot** с production URL frontend
6. **Наполнить контентом** через Admin панель или seeding

---

**Last Updated:** 26 October 2025
**Version:** 1.0.0
**Status:** Ready for Deployment 🚀

**بارك الله فيكم** (Baraka Allahu Feekum) - May Allah bless you!
