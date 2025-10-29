# Миграция EnhancedBookReader из shop в unified

## Что было сделано

### 1. Конвертация в TypeScript
- ✅ Все компоненты переведены на TypeScript
- ✅ Добавлены строгие типы для всех props, state и функций
- ✅ Созданы интерфейсы в `types.ts`
- ✅ Добавлены типы для Telegram WebApp API

### 2. Интеграция с offlineStorage
```typescript
// До (localStorage)
localStorage.setItem(`offline_book_${book.id}`, JSON.stringify(book));

// После (Dexie/IndexedDB)
await offlineBooks.saveBook({
  bookId: String(book.id),
  title: book.title,
  author: book.author,
  content: book.content,
  ...
});
```

### 3. Использование хуков из shared
```typescript
import {
  useOfflineBooks,
  useReadingProgress,
  useNetworkStatus
} from '../../shared/hooks/useOffline';

const { isOnline } = useNetworkStatus();
const { isBookOffline, saveBook, removeBook } = useOfflineBooks();
const { saveProgress } = useReadingProgress(id);
```

### 4. API конфигурация
```typescript
import { getApiUrl } from '../../shared/lib/apiConfig';
const API_URL = getApiUrl();
```

## Структура файлов

```
mubarak-way-unified/frontend/src/widgets/library/
├── EnhancedBookReader.tsx  - Основной компонент (53KB)
├── types.ts                - TypeScript типы (1.8KB)
├── index.ts                - Barrel export (267B)
├── README.md               - Документация (14KB)
└── MIGRATION.md            - Этот файл
```

## Что изменилось

### Улучшения

1. **TypeScript типизация**
   - Все функции типизированы
   - Props и State строго типизированы
   - Добавлены интерфейсы для всех данных

2. **Offline Storage (Dexie)**
   - Книги: `offlineBooks.saveBook()` / `getBook()` / `removeBook()`
   - Прогресс: `readingProgress.saveProgress()` / `getProgress()`
   - Автоматическое отслеживание онлайн/офлайн статуса

3. **Shared хуки**
   - `useOfflineBooks()` - управление офлайн книгами
   - `useReadingProgress()` - управление прогрессом чтения
   - `useNetworkStatus()` - отслеживание сети

4. **Улучшенная структура**
   - Разделение на модули (types, hooks)
   - Barrel exports для удобного импорта
   - Документация в README

### Что осталось без изменений

1. **UI/UX**
   - ✅ Все кнопки и меню
   - ✅ Анимации перелистывания страниц
   - ✅ Темная/светлая темы
   - ✅ Responsive дизайн

2. **Функциональность**
   - ✅ Постраничная навигация
   - ✅ Swipe navigation (touch + pointer events)
   - ✅ Text-to-Speech
   - ✅ Progress bar и tracking
   - ✅ Закладки
   - ✅ Настройки читателя
   - ✅ Share/Download функции
   - ✅ Telegram bot интеграция

3. **Стили**
   - ✅ 3D эффекты переворачивания
   - ✅ Page stack layers
   - ✅ Градиенты и тени
   - ✅ Mobile-first подход

## Как использовать

### 1. Импорт компонента
```tsx
// В роутере
import { EnhancedBookReader } from '@/widgets/library';

// В routes
<Route path="/books/:id" element={<EnhancedBookReader />} />
```

### 2. Навигация к читателю
```tsx
// Обычный режим
navigate(`/books/${bookId}`);

// Режим гида
navigate(`/books/${bookId}?guide=true`);
```

### 3. Проверка зависимостей
```bash
# Убедитесь что установлены:
npm install marked dompurify lucide-react axios
npm install @types/marked @types/dompurify
```

## Зависимости

### Обязательные
- `react` ^18.0.0
- `react-router-dom` ^6.0.0
- `axios` - HTTP запросы
- `marked` - Markdown парсинг
- `dompurify` - XSS защита
- `lucide-react` - Иконки
- `dexie` - IndexedDB wrapper

### Shared модули
- `@/shared/lib/apiConfig` - API конфигурация
- `@/shared/lib/offlineStorage` - Offline storage (Dexie)
- `@/shared/hooks/useOffline` - Offline hooks

## Миграция данных

### localStorage → IndexedDB

Если у пользователей были сохранены книги в старом формате (localStorage), нужно создать миграцию:

```typescript
// utils/migrateLocalStorage.ts
export const migrateLocalStorageToIndexedDB = async () => {
  // Получить все ключи из localStorage
  const keys = Object.keys(localStorage);
  const offlineBookKeys = keys.filter(k => k.startsWith('offline_book_'));

  for (const key of offlineBookKeys) {
    try {
      const bookData = JSON.parse(localStorage.getItem(key)!);
      await offlineBooks.saveBook(bookData);
      localStorage.removeItem(key); // Удалить старые данные
    } catch (error) {
      console.error('Migration error:', error);
    }
  }
};

// Вызвать при инициализации приложения
useEffect(() => {
  migrateLocalStorageToIndexedDB();
}, []);
```

## Тестирование

### Чек-лист функций

- [ ] Загрузка книги с API
- [ ] Офлайн режим (загрузка из IndexedDB)
- [ ] Постраничная навигация (кнопки)
- [ ] Swipe навигация (touch)
- [ ] Pointer навигация (desktop)
- [ ] Сохранение прогресса в IndexedDB
- [ ] Восстановление позиции при открытии
- [ ] Закладки (добавить/удалить)
- [ ] Темная/светлая тема
- [ ] Изменение размера шрифта
- [ ] Изменение межстрочного интервала
- [ ] Режим страниц вкл/выкл
- [ ] Text-to-Speech озвучка
- [ ] Скорость озвучки
- [ ] Сохранение офлайн
- [ ] Удаление из офлайн
- [ ] Индикатор онлайн/офлайн
- [ ] Share функция
- [ ] Download функция
- [ ] Telegram bot интеграция
- [ ] Кнопка "Начать сначала"
- [ ] Mobile responsive
- [ ] Settings panel (mobile/desktop)

### Тестовые сценарии

1. **Онлайн → Офлайн**
   - Открыть книгу онлайн
   - Сохранить офлайн
   - Выключить интернет
   - Перезагрузить страницу
   - Книга должна открыться из IndexedDB

2. **Прогресс чтения**
   - Прочитать несколько страниц
   - Закрыть книгу
   - Открыть снова
   - Позиция должна восстановиться

3. **Закладки**
   - Добавить закладку на странице 5
   - Закрыть книгу
   - Открыть снова
   - Должна открыться страница 5

4. **Swipe навигация**
   - На мобильном устройстве
   - Свайп влево → следующая страница
   - Свайп вправо → предыдущая страница

## Известные проблемы

### 1. localStorage закладки
**Проблема**: Закладки всё ещё хранятся в localStorage, а не в IndexedDB.

**Решение**: Создать таблицу `bookmarks` в Dexie и мигрировать данные.

```typescript
// В offlineStorage.ts добавить:
bookmarks!: Table<Bookmark>;

// В version(1).stores добавить:
bookmarks: '++id, bookId, userId, page, updatedAt'
```

### 2. Web Speech API поддержка
**Проблема**: Не все браузеры поддерживают Web Speech API.

**Решение**: Проверка поддержки добавлена, показывается alert.

### 3. Большие книги
**Проблема**: Книги >10MB могут медленно загружаться в IndexedDB.

**Решение**: Добавить progress indicator при сохранении офлайн.

## TODO (будущие улучшения)

1. [ ] Поиск внутри книги (fulltext search)
2. [ ] Highlights & Notes (выделение и заметки)
3. [ ] Chapter navigation (навигация по главам)
4. [ ] Reading statistics (статистика чтения)
5. [ ] Sync across devices (синхронизация)
6. [ ] Custom themes (кастомные темы)
7. [ ] PDF/EPUB support
8. [ ] Bookmarks в IndexedDB (вместо localStorage)

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера
2. Проверьте Application → IndexedDB → MubarakWayDB
3. Проверьте Network tab для API запросов
4. Убедитесь что все зависимости установлены

## Changelog

### v2.0.0 (29.10.2024)
- ✅ Полная конвертация в TypeScript
- ✅ Интеграция с Dexie (IndexedDB)
- ✅ Использование shared hooks
- ✅ Улучшенная типизация
- ✅ Документация и тесты

### v1.0.0 (исходная версия в shop)
- React компонент
- localStorage для офлайн
- Базовая функциональность
