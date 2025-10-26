# 🚀 Quick Start Guide - MubarakWay Unified

## ✅ Что уже сделано

### Базовая структура проекта
- ✅ Monorepo структура (frontend + backend + shared)
- ✅ TypeScript конфигурация для всех пакетов
- ✅ Общий пакет типов `@mubarak-way/shared`

### Backend
- ✅ Express.js 5 + TypeScript сервер
- ✅ MongoDB модели (User, Surah, Ayah, Book, Nashid, Lesson, SubscriptionPlan)
- ✅ Конфигурация базы данных
- ✅ Environment variables setup
- ✅ CORS, Helmet, Compression middleware
- ✅ Health check endpoints

### Frontend
- ✅ React 19 + Vite + TypeScript
- ✅ Tailwind CSS настроен
- ✅ Telegram WebApp SDK интеграция
- ✅ React Router настроен
- ✅ Bottom Navigation (5 разделов)
- ✅ Базовые страницы (Home, Onboarding)
- ✅ PWA конфигурация (Service Worker)

---

## 📋 Требования

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **MongoDB** (локальный или Atlas)
- **Git**

---

## 🔧 Установка

### 1. Установите зависимости

```bash
cd mubarak-way-unified
npm install
```

Это установит зависимости для всех workspace (frontend, backend, shared).

### 2. Настройте environment variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Отредактируйте `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mubarak-way-unified
TELEGRAM_BOT_TOKEN=your_bot_token_here
JWT_SECRET=your_secret_key_here
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env
```

Отредактируйте `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 🏃 Запуск

### Вариант 1: Запустить всё сразу (рекомендуется)

Из корневой директории:
```bash
npm run dev
```

Это запустит:
- Frontend dev server на `http://localhost:3000`
- Backend API server на `http://localhost:4000`

### Вариант 2: Запустить отдельно

**Backend:**
```bash
npm run dev:backend
```

**Frontend:**
```bash
npm run dev:frontend
```

---

## 🧪 Проверка

1. **Backend API:**
   ```bash
   curl http://localhost:4000/health
   ```

   Должен вернуть:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123.456,
     "environment": "development"
   }
   ```

2. **Frontend:**
   Откройте `http://localhost:3000` в браузере

3. **MongoDB:**
   Убедитесь, что MongoDB запущен:
   ```bash
   mongosh
   ```

---

## 📁 Структура проекта

```
mubarak-way-unified/
├── frontend/              # React 19 + Vite
│   ├── src/
│   │   ├── app/          # Application shell
│   │   ├── pages/        # Page components
│   │   ├── widgets/      # Complex UI components
│   │   ├── features/     # Business logic
│   │   ├── entities/     # Domain models
│   │   └── shared/       # Shared utilities
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # Express + TypeScript
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes (TODO)
│   │   ├── services/     # Business logic (TODO)
│   │   ├── middlewares/  # Express middlewares (TODO)
│   │   └── index.ts      # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/               # Shared types
│   ├── src/types/
│   │   ├── user.ts
│   │   ├── quran.ts
│   │   ├── library.ts
│   │   ├── prayer.ts
│   │   ├── subscription.ts
│   │   └── api.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                 # Documentation
├── package.json          # Root package
└── README.md
```

---

## 🎯 Следующие шаги

### 1. Backend - API Routes (Week 3-5)
- [ ] Создать `/api/v1/auth` - аутентификация через Telegram
- [ ] Создать `/api/v1/quran` - endpoints для Корана
- [ ] Создать `/api/v1/library` - books & nashids
- [ ] Создать `/api/v1/prayer` - lessons & prayer times
- [ ] Создать `/api/v1/ai` - Claude AI integration
- [ ] Создать `/api/v1/subscription` - subscription management

### 2. Frontend - Pages (Week 6-9)
- [ ] Quran Module (SurahList, SurahReader, Bookmarks)
- [ ] Library Module (Books, Nashids, Reader)
- [ ] Prayer Module (Lessons, Practice, Times, Qibla)
- [ ] Progress Module (Stats, Achievements)
- [ ] Settings Module (Preferences, Subscription)

### 3. i18next Setup
- [ ] Настроить i18next
- [ ] Создать переводы (RU, EN, AR)
- [ ] Добавить RTL поддержку для Arabic

### 4. UI Components
- [ ] Button, Card, Badge, Tabs
- [ ] Modal, Drawer, Toast
- [ ] AudioPlayer (global)
- [ ] AI Assistant (floating button)

### 5. State Management
- [ ] Zustand stores (user, lessons, progress, etc.)
- [ ] API integration (axios + interceptors)
- [ ] Offline storage (IndexedDB via Dexie)

---

## 🛠️ Полезные команды

```bash
# Установить зависимости
npm install

# Запустить всё
npm run dev

# Запустить только backend
npm run dev:backend

# Запустить только frontend
npm run dev:frontend

# Build для production
npm run build

# Lint всех workspace
npm run lint

# Type checking
npm run type-check

# Очистить node_modules и dist
npm run clean
```

---

## 🐛 Troubleshooting

### Backend не запускается
- Проверьте, что MongoDB запущен
- Проверьте environment variables в `backend/.env`
- Убедитесь, что порт 4000 свободен

### Frontend не запускается
- Проверьте, что backend запущен
- Очистите cache: `rm -rf frontend/node_modules/.vite`
- Проверьте `frontend/.env`

### TypeScript ошибки
- Убедитесь, что все зависимости установлены: `npm install`
- Пересоберите shared пакет: `cd shared && npm run build`

---

## 📚 Документация

- [README.md](README.md) - Общее описание проекта
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Архитектура (TODO)
- [API_SPEC.md](docs/API_SPEC.md) - API спецификация (TODO)
- [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) - Миграция данных (TODO)

---

## 🤝 Вопросы?

Если возникли вопросы или проблемы:
1. Проверьте этот файл
2. Проверьте логи backend/frontend
3. Создайте Issue в GitHub

---

**Удачи в разработке! 🚀**
