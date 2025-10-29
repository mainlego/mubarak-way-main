# EnhancedBookReader

Продвинутый компонент для чтения книг с постраничной навигацией, офлайн режимом и множеством функций.

## Основные возможности

### 1. Постраничная навигация
- **Автоматическое разделение на страницы** (~800 слов на страницу)
- **3D анимация переворачивания страниц** с эффектом книги
- **Swipe навигация** (влево/вправо для перелистывания)
- **Pointer events** для десктопа
- **Клавиши навигации** на десктопе
- **Переход на конкретную страницу** через input

### 2. Прогресс чтения
- **Прогресс-бар** в шапке компонента
- **Сохранение прогресса** в IndexedDB через Dexie
- **Восстановление позиции** при повторном открытии
- **Процент прочитанного** в floating controls

### 3. Настройки читателя
- **Темная/Светлая тема** с разными шрифтами
- **Размер шрифта**: 14, 16, 18, 20, 22, 24px
- **Межстрочный интервал**: 1.4, 1.6, 1.8, 2.0, 2.2
- **Режим страниц**: вкл/выкл (постраничный или scroll)
- **Скорость озвучки**: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- **Сохранение настроек** в localStorage

### 4. Закладки
- **Добавление/удаление закладок** одной кнопкой
- **Сохранение страницы** и scroll позиции
- **Восстановление позиции** при открытии книги
- **Хранение в localStorage** с timestamp

### 5. Офлайн режим
- **Интеграция с Dexie** (IndexedDB)
- **Сохранение книг офлайн** через `offlineBooks.saveBook()`
- **Прогресс чтения** через `readingProgress.saveProgress()`
- **Индикатор онлайн/офлайн** статуса
- **Индикатор доступности** книги офлайн
- **Автоматическая загрузка** из офлайн хранилища при отсутствии сети

### 6. Аудио чтение (Text-to-Speech)
- **Web Speech API** для озвучки текста
- **Настраиваемая скорость** чтения
- **Русский язык** по умолчанию
- **Озвучка текущей страницы**

### 7. Swipe Navigation
- **Touch события** для мобильных устройств
- **Pointer события** для десктопа
- **Индикатор свайпов** на мобильных
- **Защита от случайных свайпов** (минимум 50px)

### 8. Дополнительные функции
- **Sharing API** для шаринга книг
- **Telegram Bot** интеграция (отправка книги в бот)
- **Download функционал**
- **Кнопка "Начать сначала"**
- **Режим гида** (guide mode)

## Использование

```tsx
import EnhancedBookReader from '@/widgets/library/EnhancedBookReader';

// В router
<Route path="/books/:id" element={<EnhancedBookReader />} />

// С параметрами
navigate(`/books/${bookId}?guide=true`);
```

## Архитектура

### Компоненты
```
EnhancedBookReader.tsx  - Основной компонент
types.ts               - TypeScript типы
README.md              - Документация
```

### Зависимости
```typescript
// React
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// External
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { lucide-react } from 'lucide-react';

// Internal
import { getApiUrl } from '@/shared/lib/apiConfig';
import { offlineBooks, readingProgress } from '@/shared/lib/offlineStorage';
import { useOfflineBooks, useReadingProgress, useNetworkStatus } from '@/shared/hooks/useOffline';
```

## State Management

### Local State
```typescript
// Book data
const [book, setBook] = useState<Book | null>(null);
const [loading, setLoading] = useState(true);

// Settings
const [settings, setSettings] = useState<ReaderSettings>({
  isDarkTheme: false,
  fontSize: 18,
  lineHeight: 1.8,
  isPageMode: true,
  speechRate: 1
});

// Reading state
const [readingProgressValue, setReadingProgressValue] = useState(0);
const [isBookmarked, setIsBookmarked] = useState(false);

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [pages, setPages] = useState<string[]>([]);
```

### IndexedDB (через Dexie)
```typescript
// Сохранение книги офлайн
await offlineBooks.saveBook({
  bookId: String(book.id),
  title: book.title,
  author: book.author,
  content: book.content,
  ...
});

// Сохранение прогресса чтения
await readingProgress.saveProgress(
  bookId,
  progress,      // 0-100%
  currentPage,   // номер страницы
  lastPosition   // scroll position
);
```

### localStorage
```typescript
// Настройки читателя
localStorage.setItem('readerTheme', 'dark' | 'light');
localStorage.setItem('readerFontSize', '18');
localStorage.setItem('readerLineHeight', '1.8');
localStorage.setItem('readerPageMode', 'true');

// Закладки
localStorage.setItem('bookmarks', JSON.stringify({
  [bookId]: {
    page: currentPage,
    progress: readingProgress,
    scrollPosition: window.scrollY,
    timestamp: Date.now()
  }
}));

// Текущая страница
localStorage.setItem(`currentPage_${bookId}`, currentPage);

// Прогресс чтения
localStorage.setItem(`readingProgress_${bookId}`, progress);
```

## Функции

### Постраничная навигация
```typescript
const nextPage = () => {
  // 3D анимация перелистывания влево
  setPageTransition('flip-left');
  setCurrentPage(currentPage + 1);
  updateProgress(currentPage + 1);
};

const prevPage = () => {
  // 3D анимация перелистывания вправо
  setPageTransition('flip-right');
  setCurrentPage(currentPage - 1);
  updateProgress(currentPage - 1);
};

const goToPage = (pageNum: number) => {
  // Переход на конкретную страницу
  setCurrentPage(pageNum);
  updateProgress(pageNum);
};
```

### Разделение на страницы
```typescript
const splitContentIntoPages = (content: string) => {
  // Markdown → HTML → DOMPurify
  const cleanContent = DOMPurify.sanitize(marked(content));

  // Разделение по словам (~800 слов на страницу)
  const wordsPerPage = 800;
  const words = cleanContent.split(/\s+/);
  const pageCount = Math.ceil(words.length / wordsPerPage);

  // Создание массива страниц
  const newPages = [];
  for (let i = 0; i < pageCount; i++) {
    const pageWords = words.slice(i * wordsPerPage, (i + 1) * wordsPerPage);
    newPages.push(pageWords.join(' '));
  }

  setPages(newPages);
  setTotalPages(pageCount);
};
```

### Swipe Navigation
```typescript
// Touch events
const handleTouchStart = (e: React.TouchEvent) => {
  setTouch({ start: e.targetTouches[0].clientX, end: null });
};

const handleTouchEnd = () => {
  const distance = touch.start - touch.end;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;

  if (isLeftSwipe) nextPage();
  if (isRightSwipe) prevPage();
};

// Pointer events (desktop)
useEffect(() => {
  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
  };

  const handlePointerUp = (e: PointerEvent) => {
    const diffX = startX - e.clientX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) nextPage();
      else prevPage();
    }
  };

  element.addEventListener('pointerdown', handlePointerDown);
  element.addEventListener('pointerup', handlePointerUp);
}, []);
```

### Text-to-Speech
```typescript
const toggleSpeech = () => {
  const utterance = new SpeechSynthesisUtterance(
    pages[currentPage - 1].replace(/<[^>]*>/g, '')
  );
  utterance.rate = settings.speechRate;
  utterance.lang = 'ru-RU';

  utterance.onend = () => setIsPlaying(false);
  utterance.onerror = () => setIsPlaying(false);

  window.speechSynthesis.speak(utterance);
  setIsPlaying(true);
};
```

## Стилизация

### Темы
```typescript
// Темная тема
const darkTheme = {
  background: 'linear-gradient(135deg, #1a1f2e 0%, #151820 100%)',
  pageBackground: 'from-gray-800 to-gray-900',
  textColor: 'text-gray-100',
  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
};

// Светлая тема
const lightTheme = {
  background: 'linear-gradient(135deg, #fdfbfb 0%, #f5f7fa 100%)',
  pageBackground: 'from-amber-50 via-white to-amber-50',
  textColor: 'text-gray-800',
  fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif'
};
```

### 3D эффекты
```typescript
// Page stack layers
style={{
  transform: 'translateZ(-15px) translateY(6px)',
  opacity: 0.5,
  boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
}}

// Page flip animation
style={{
  transformStyle: 'preserve-3d',
  transformOrigin: 'left' | 'right',
  transform: 'rotateY(-180deg) scale(0.95)',
  transition: 'all 700ms ease-in-out',
  backfaceVisibility: 'hidden'
}}
```

## Mobile Optimization

### Responsive Design
- **Mobile-first** подход
- **Touch-friendly** кнопки (touch-manipulation)
- **Adaptive controls** (показывать/скрывать по размеру экрана)
- **Bottom sheet** settings panel на мобильных
- **Swipe indicators** для навигации

### Performance
- **Lazy loading** страниц
- **useCallback** для мемоизации функций
- **useMemo** для тяжелых вычислений (если нужно)
- **Debounce** для scroll events
- **requestAnimationFrame** для анимаций

## API Integration

### Загрузка книги
```typescript
// Online
const response = await axios.get(`${API_URL}/books/${id}`);
const bookData = {
  ...response.data.book,
  id: response.data.book._id,
  content: response.data.book.extractedText || response.data.book.content
};

// Offline fallback
if (!isOnline) {
  const offlineBook = await offlineBooks.getBook(id);
  if (offlineBook) {
    // Use offline data
  }
}
```

### Сохранение прогресса
```typescript
// localStorage (быстрое сохранение)
localStorage.setItem(`readingProgress_${id}`, progress.toString());
localStorage.setItem(`currentPage_${id}`, currentPage.toString());

// IndexedDB (постоянное хранилище)
await readingProgress.saveProgress(id, progress, currentPage, 0);
```

## Telegram Integration

### Deep Links
```typescript
const botUsername = window.Telegram?.WebApp?.initDataUnsafe?.bot?.username;
const deepLink = `https://t.me/${botUsername}?start=download_book_${bookId}`;

window.Telegram.WebApp.showConfirm(
  `Отправить книгу "${book.title}" в чат с ботом?`,
  (confirmed) => {
    if (confirmed) {
      window.Telegram.WebApp.HapticFeedback?.impactOccurred('light');
      window.Telegram.WebApp.openLink(deepLink);
    }
  }
);
```

## Accessibility

- **Keyboard navigation** (стрелки влево/вправо)
- **ARIA labels** на кнопках
- **Focus management** для модальных окон
- **Screen reader** friendly
- **High contrast** themes

## Browser Support

- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+)
- **Mobile browsers** (iOS Safari 14+, Chrome Android 90+)
- **Required APIs**:
  - IndexedDB (для Dexie)
  - Web Speech API (опционально, для TTS)
  - Touch Events / Pointer Events
  - Storage API (для проверки квоты)

## Future Improvements

1. **Поиск внутри книги** - fulltext search
2. **Highlights & Notes** - выделение текста и заметки
3. **Chapter navigation** - навигация по главам
4. **Reading statistics** - статистика чтения
5. **Sync across devices** - синхронизация прогресса
6. **Custom themes** - настраиваемые темы
7. **PDF support** - поддержка PDF файлов
8. **EPUB support** - поддержка EPUB формата

## Troubleshooting

### Книга не загружается
- Проверьте `API_URL` в `apiConfig.ts`
- Проверьте формат `content` в API response
- Проверьте IndexedDB в DevTools

### Swipe не работает
- Проверьте `touch-action: pan-y` в CSS
- Проверьте минимальную дистанцию (50px)
- Проверьте конфликты с другими touch handlers

### Text-to-Speech не работает
- Проверьте поддержку браузера: `'speechSynthesis' in window`
- Проверьте язык: `utterance.lang = 'ru-RU'`
- Проверьте наличие текста на странице

### Прогресс не сохраняется
- Проверьте IndexedDB в DevTools
- Проверьте `id` книги (должен быть string)
- Проверьте вызов `saveProgress()` в `updateProgress()`
