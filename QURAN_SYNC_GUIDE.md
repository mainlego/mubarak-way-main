# Руководство по синхронизации Корана

## Обзор

Система синхронизации загружает полные данные Корана из Quran.com API в нашу MongoDB базу данных. Это обеспечивает:

- ✅ Быстрый доступ к данным (без внешних API вызовов)
- ✅ Offline-ready архитектуру
- ✅ Полный контроль над данными
- ✅ Поддержку множественных переводов

---

## Первоначальная настройка

### 1. Настройка переменных окружения

Добавьте в `backend/.env`:

```env
# Quran.com OAuth2 (Pre-Production для тестирования)
QURAN_COM_CLIENT_ID=eef6b72d-7a97-432b-b4f6-4293baf7257d
QURAN_COM_CLIENT_SECRET=gQtoRJHhwI4sX7z1Lsv3ce.9g8
QURAN_COM_ENDPOINT=https://prelive-oauth2.quran.foundation

# Для production используйте:
# QURAN_COM_CLIENT_ID=3d370570-a211-4e38-8ca4-882792179406
# QURAN_COM_CLIENT_SECRET=N-nuFPys0DNqCsALrTKtoHrwTT
# QURAN_COM_ENDPOINT=https://oauth2.quran.foundation
```

### 2. Убедитесь что MongoDB запущена

```bash
# Проверка подключения
cd backend
npm run dev
# Должно подключиться к MongoDB без ошибок
```

---

## Команды синхронизации

### Проверить статус

```bash
cd backend
npm run sync:quran -- --check
```

**Вывод:**
```
📊 Sync Status:
  - Total verses: 6236
  - Synced verses: 0
  - Progress: 0.0%
  - Needs sync: ❌ Yes
```

### Синхронизировать только суры (быстро)

```bash
npm run sync:quran -- --surahs
```

**Время:** ~30 секунд
**Результат:** 114 сур с метаданными

### Синхронизировать аяты одной суры

```bash
npm run sync:quran -- --ayahs 1   # Аль-Фатиха
npm run sync:quran -- --ayahs 2   # Аль-Бакара
# ... до 114
```

**Время:** ~5 секунд на суру
**Результат:** Все аяты суры с переводами (ru, en)

### Полная синхронизация (ВСЕ 114 сур)

```bash
npm run sync:quran -- --all
```

**Время:** ~15-20 минут
**Результат:** Весь Коран (6236 аятов) с переводами на русский, английский, арабский

⚠️ **Важно**: Эта команда делает ~114 API запросов. Используйте её только один раз для первоначальной загрузки!

---

## Расписание обновлений

### Автоматическое обнаружение устаревших данных

QuranService автоматически проверяет нужна ли синхронизация при запуске:

```typescript
// Синхронизация нужна если:
// 1. Меньше 114 сур в БД
// 2. Меньше 6000 аятов в БД
// 3. Последнее обновление > 30 дней назад
```

### Рекомендуемое расписание

1. **Первый запуск**: Полная синхронизация
```bash
npm run sync:quran -- --all
```

2. **Ежемесячно**: Обновление сур
```bash
npm run sync:quran -- --surahs
```

3. **По необходимости**: Отдельные суры
```bash
npm run sync:quran -- --ayahs 114
```

---

## Структура данных

### Surah (Сура)

```typescript
{
  number: 1,
  name: "Al-Fatihah",
  nameArabic: "الفاتحة",
  nameTransliteration: "Al-Fātiĥah",
  ayahCount: 7,
  revelation: "meccan" | "medinan",
  revelationOrder: 5,
  bismillahPre: false,
  createdAt: Date,
  updatedAt: Date
}
```

### Ayah (Аят)

```typescript
{
  surahNumber: 1,
  ayahNumber: 1,
  globalNumber: 1,
  textArabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  textSimple: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  translations: [
    {
      language: "ru",
      text: "Во имя Аллаха, Милостивого, Милосердного!",
      translator: "Kuliev",
      translatorId: 131
    },
    {
      language: "en",
      text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      translator: "Sahih International",
      translatorId: 85
    }
  ],
  juzNumber: 1,
  hizbNumber: 1,
  pageNumber: 1,
  sajdah: { required: boolean, type: "recommended" | "obligatory" }
}
```

---

## ID переводов

Используемые переводы из Quran.com:

```typescript
const TRANSLATION_IDS = {
  ru: 131,  // Russian - Кулиев (Kuliev)
  en: 85,   // English - Sahih International
  ar: 54,   // Arabic - Tafseer
  tr: 77,   // Turkish - Diyanet
  uz: 84,   // Uzbek - Alauddin Mansour
  kk: 109,  // Kazakh - Khalifa Altai
};
```

Можно добавить больше переводов в `QuranSyncService.ts`.

---

## Мониторинг и проблемы

### Проверка синхронизации

```bash
# В Mongo Shell или MongoDB Compass
use mubarak-way

# Количество сур
db.surahs.countDocuments()
// Должно быть: 114

# Количество аятов
db.ayahs.countDocuments()
// Должно быть: ~6236

# Проверить конкретную суру
db.ayahs.find({ surahNumber: 1 }).count()
// Должно быть: 7 (для Аль-Фатиха)

# Проверить переводы
db.ayahs.findOne({ surahNumber: 1, ayahNumber: 1 })
// translations должен содержать ru, en
```

### Частые проблемы

#### 1. OAuth2 ошибка

```
❌ Failed to get Quran.com access token
```

**Решение:**
- Проверьте CLIENT_ID и CLIENT_SECRET в .env
- Убедитесь что используете правильный ENDPOINT (prelive vs production)

#### 2. Rate limiting

```
⚠️ API rate limit exceeded
```

**Решение:**
- Добавлена задержка 500ms между запросами
- Если всё равно возникает - увеличьте в `QuranSyncService.ts`:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 секунда
```

#### 3. Неполные данные

```
⚠️ No ayahs for Surah X
```

**Решение:**
```bash
npm run sync:quran -- --ayahs X
```

---

## Production Deployment

### На Render.com

1. **Добавьте переменные окружения** в Render Dashboard:
```
QURAN_COM_CLIENT_ID=3d370570-a211-4e38-8ca4-882792179406
QURAN_COM_CLIENT_SECRET=N-nuFPys0DNqCsALrTKtoHrwTT
QURAN_COM_ENDPOINT=https://oauth2.quran.foundation
```

2. **Запустите синхронизацию** через Render Shell:
```bash
cd /opt/render/project/src/backend
npm run sync:quran -- --all
```

3. **Или создайте отдельный Job** в Render:
```yaml
type: job
name: quran-sync
buildCommand: cd backend && npm install
startCommand: cd backend && npm run sync:quran -- --all
schedule: "0 0 1 * *"  # Каждое 1-е число месяца
```

---

## API Usage

После синхронизации используйте `QuranService` в коде:

```typescript
import QuranService from '../services/QuranService';

// Получить все суры
const surahs = await QuranService.getAllSurahs();

// Получить аяты суры
const ayahs = await QuranService.getAyahsBySurah(1, 'ru');

// Поиск
const results = await QuranService.searchAyahs('милосердие', 'ru');

// Случайный аят
const random = await QuranService.getRandomAyah('ru');
```

---

## Оптимизация

### Индексы MongoDB

Уже настроены в models:

```typescript
// Surah
surahSchema.index({ number: 1 });
surahSchema.index({ name: 'text', nameTransliteration: 'text' });

// Ayah
ayahSchema.index({ surahNumber: 1, ayahNumber: 1 });
ayahSchema.index({ juzNumber: 1 });
ayahSchema.index({ pageNumber: 1 });
ayahSchema.index({ textSimple: 'text', 'translations.text': 'text' });
```

### Кэширование

QuranService автоматически использует MongoDB индексы. Можно добавить Redis:

```typescript
// Кэш для часто запрашиваемых сур
const cached = await redis.get(`surah:${number}`);
if (cached) return JSON.parse(cached);
```

---

## Дополнительные возможности

### Добавить больше языков

Измените в `QuranSyncService.ts`:

```typescript
await this.syncAllAyahs(['ru', 'en', 'ar', 'tr', 'uz', 'kk']);
```

### Добавить Tafsir (толкование)

```typescript
// В QuranSyncService.ts добавьте запрос tafsir
const tafsirResponse = await this.api.get(`/tafsirs/${tafsirId}/by_ayah/${verse.verse_key}`);
```

### Экспорт данных

```bash
# Экспорт в JSON
mongoexport --db=mubarak-way --collection=ayahs --out=quran.json

# Импорт
mongoimport --db=mubarak-way --collection=ayahs --file=quran.json
```

---

## Заключение

Система синхронизации позволяет:

- ✅ **Один раз** загрузить весь Коран
- ✅ **Быстро** отдавать данные из БД
- ✅ **Работать offline** после загрузки
- ✅ **Контролировать** данные полностью
- ✅ **Обновлять** при необходимости

**Следующий шаг**: Обновить frontend для использования нашего API!
