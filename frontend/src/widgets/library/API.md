# EnhancedBookReader API Documentation

## Component Props

```typescript
// EnhancedBookReader не принимает props
// Все данные получаются через:
// - useParams() для bookId
// - useLocation() для query params
// - localStorage для настроек
// - IndexedDB для офлайн данных
```

## URL Parameters

### Route Parameter
```typescript
// :id - Book ID
/books/:id

// Example:
/books/123
/books/abc-def-456
```

### Query Parameters
```typescript
// guide - Enable guide mode
?guide=true

// Example:
/books/123?guide=true
```

## Exported Functions & Hooks

### From offlineStorage.ts

#### offlineBooks
```typescript
interface OfflineBooks {
  // Сохранить книгу для офлайн чтения
  saveBook(book: Partial<OfflineBook>): Promise<boolean>;

  // Получить все офлайн книги
  getAllBooks(): Promise<OfflineBook[]>;

  // Получить конкретную книгу
  getBook(bookId: string): Promise<OfflineBook | undefined>;

  // Удалить книгу из офлайн хранилища
  removeBook(bookId: string): Promise<boolean>;

  // Проверить, есть ли книга офлайн
  isBookOffline(bookId: string): Promise<boolean>;

  // Обновить время последнего чтения
  updateLastRead(bookId: string): Promise<void>;
}
```

#### readingProgress
```typescript
interface ReadingProgress {
  // Сохранить прогресс чтения
  saveProgress(
    bookId: string,
    progress: number,       // 0-100
    currentPage?: number,   // default: 1
    lastPosition?: number   // default: 0
  ): Promise<boolean>;

  // Получить прогресс чтения книги
  getProgress(bookId: string): Promise<ReadingProgress | undefined>;

  // Получить весь прогресс чтения
  getAllProgress(): Promise<ReadingProgress[]>;
}
```

### From useOffline.ts

#### useOfflineBooks()
```typescript
const {
  books,              // OfflineBook[] - все офлайн книги
  loading,            // boolean - статус загрузки
  saveBook,           // (book: Partial<OfflineBook>) => Promise<boolean>
  removeBook,         // (bookId: string) => Promise<boolean>
  isBookOffline,      // (bookId: string) => Promise<boolean>
  reload              // () => Promise<void> - перезагрузить список
} = useOfflineBooks();
```

#### useReadingProgress(bookId?: string)
```typescript
const {
  progress,           // ReadingProgress | undefined
  loading,            // boolean
  saveProgress,       // (id: string, progress: number, page?: number, pos?: number) => Promise<boolean>
  reload              // (() => Promise<void>) | undefined
} = useReadingProgress('bookId');
```

#### useNetworkStatus()
```typescript
const {
  isOnline,           // boolean - онлайн статус
  isOffline           // boolean - офлайн статус (!isOnline)
} = useNetworkStatus();
```

#### useStorage()
```typescript
const {
  storageSize,        // StorageSize | null - размер хранилища
  storageStats,       // StorageStats | null - статистика
  loading,            // boolean
  clearAllData,       // () => Promise<boolean> - очистить все
  reload              // () => Promise<void> - обновить данные
} = useStorage();
```

## Internal State

### Book State
```typescript
const [book, setBook] = useState<Book | null>(null);
const [loading, setLoading] = useState(true);
```

### Settings State
```typescript
interface ReaderSettings {
  isDarkTheme: boolean;      // default: false
  fontSize: number;          // default: 18, range: 14-24
  lineHeight: number;        // default: 1.8, range: 1.4-2.2
  isPageMode: boolean;       // default: true
  speechRate: number;        // default: 1, range: 0.5-1.5
}
```

### Pagination State
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [pages, setPages] = useState<string[]>([]);
```

### UI State
```typescript
const [showSettings, setShowSettings] = useState(false);
const [isBookmarked, setIsBookmarked] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
```

## Methods

### Navigation Methods

#### nextPage()
```typescript
function nextPage(): void;

// Переход на следующую страницу
// - Анимация flip-left
// - Сохранение позиции в localStorage
// - Обновление прогресса в IndexedDB
// - Scroll to top
```

#### prevPage()
```typescript
function prevPage(): void;

// Переход на предыдущую страницу
// - Анимация flip-right
// - Сохранение позиции в localStorage
// - Обновление прогресса в IndexedDB
// - Scroll to top
```

#### goToPage(pageNum: number)
```typescript
function goToPage(pageNum: number): void;

// Переход на конкретную страницу
// Parameters:
//   pageNum: number - номер страницы (1-based)
// - Проверка границ (1 <= pageNum <= totalPages)
// - Сохранение позиции
// - Обновление прогресса
// - Smooth scroll to top
```

### Content Methods

#### splitContentIntoPages(content: string)
```typescript
function splitContentIntoPages(content: string): void;

// Разделение контента на страницы
// Parameters:
//   content: string - полный текст книги
// Algorithm:
//   1. Markdown → HTML (marked)
//   2. Sanitize HTML (DOMPurify)
//   3. Extract words
//   4. Split by wordsPerPage (default: 800)
//   5. Create pages array
// Updates:
//   - setPages(newPages)
//   - setTotalPages(pageCount)
```

#### updateProgress(page: number)
```typescript
async function updateProgress(page: number): Promise<void>;

// Обновление прогресса чтения
// Parameters:
//   page: number - текущая страница
// Actions:
//   1. Calculate progress % (page / totalPages * 100)
//   2. Update state (setReadingProgress)
//   3. Save to localStorage
//   4. Save to IndexedDB (offlineReadingProgress.saveProgress)
```

### Settings Methods

#### toggleTheme()
```typescript
function toggleTheme(): void;

// Переключение темной/светлой темы
// - Toggle isDarkTheme state
// - Save to localStorage ('readerTheme')
```

#### changeFontSize(newSize: number)
```typescript
function changeFontSize(newSize: number): void;

// Изменение размера шрифта
// Parameters:
//   newSize: number - размер (14, 16, 18, 20, 22, 24)
// - Update fontSize state
// - Save to localStorage ('readerFontSize')
// - Trigger content re-split
```

#### changeLineHeight(newHeight: number)
```typescript
function changeLineHeight(newHeight: number): void;

// Изменение межстрочного интервала
// Parameters:
//   newHeight: number - интервал (1.4, 1.6, 1.8, 2.0, 2.2)
// - Update lineHeight state
// - Save to localStorage ('readerLineHeight')
// - Trigger content re-split
```

#### togglePageMode()
```typescript
function togglePageMode(): void;

// Переключение режима страниц
// - Toggle isPageMode state
// - Save to localStorage ('readerPageMode')
// - true: постраничный режим
// - false: scroll режим (вся книга)
```

#### changeSpeechRate(rate: number)
```typescript
function changeSpeechRate(rate: number): void;

// Изменение скорости озвучки
// Parameters:
//   rate: number - скорость (0.5, 0.75, 1, 1.25, 1.5)
// - Update speechRate state
// - Affects next TTS playback
```

### Bookmark Methods

#### toggleBookmark()
```typescript
function toggleBookmark(): void;

// Добавить/удалить закладку
// Actions:
//   - Get bookmarks from localStorage
//   - If bookmarked: remove from bookmarks
//   - If not: save bookmark with:
//     - page: currentPage
//     - progress: readingProgress
//     - scrollPosition: window.scrollY
//     - timestamp: Date.now()
//   - Save to localStorage ('bookmarks')
//   - Show Telegram alert (if available)
```

### Audio Methods

#### toggleSpeech()
```typescript
function toggleSpeech(): void;

// Включить/выключить озвучку текста
// Actions:
//   - Check browser support (window.speechSynthesis)
//   - If playing: cancel speech
//   - If not: start speech
//     - Get current page text
//     - Clean HTML tags
//     - Create SpeechSynthesisUtterance
//     - Set rate, lang (ru-RU)
//     - Speak
```

### Offline Methods

#### toggleOfflineAccess()
```typescript
async function toggleOfflineAccess(): Promise<void>;

// Сохранить/удалить книгу из офлайн хранилища
// Actions:
//   - Check if book is offline (isOfflineAvailable)
//   - If offline: remove from IndexedDB
//   - If not: save to IndexedDB
//   - Update isOfflineAvailable state
```

### Share Methods

#### shareBook()
```typescript
async function shareBook(): Promise<void>;

// Поделиться книгой
// Actions:
//   - Check navigator.share support
//   - If supported: use Web Share API
//   - If not: copy link to clipboard
```

#### sendBookToBot()
```typescript
async function sendBookToBot(): Promise<void>;

// Отправить книгу в Telegram бот
// Actions:
//   - Get bot username from Telegram WebApp
//   - Create deep link: https://t.me/{bot}?start=download_book_{id}
//   - Show confirm dialog (Telegram or native)
//   - Open link if confirmed
```

### Touch Handlers

#### handleTouchStart(e: React.TouchEvent)
```typescript
function handleTouchStart(e: React.TouchEvent): void;

// Обработчик начала касания
// - Save touch.start = e.targetTouches[0].clientX
// - Reset touch.end = null
```

#### handleTouchMove(e: React.TouchEvent)
```typescript
function handleTouchMove(e: React.TouchEvent): void;

// Обработчик движения касания
// - Update touch.end = e.targetTouches[0].clientX
```

#### handleTouchEnd()
```typescript
function handleTouchEnd(): void;

// Обработчик окончания касания
// - Calculate distance = touch.start - touch.end
// - If leftSwipe (distance > 50): nextPage()
// - If rightSwipe (distance < -50): prevPage()
```

## localStorage Keys

```typescript
// Settings
'readerTheme'          // 'dark' | 'light'
'readerFontSize'       // '14' | '16' | '18' | '20' | '22' | '24'
'readerLineHeight'     // '1.4' | '1.6' | '1.8' | '2.0' | '2.2'
'readerPageMode'       // 'true' | 'false'

// Per-book data
`currentPage_${id}`    // '1' ... 'N'
`readingProgress_${id}` // '0' ... '100'

// Bookmarks (shared)
'bookmarks'            // JSON: { [bookId]: BookmarkData }

// Migration flag
'storage_migrated'     // 'true'
```

## IndexedDB Schema

### Database: MubarakWayDB

#### Table: books
```typescript
interface OfflineBook {
  id?: number;              // auto-increment
  bookId: string;           // indexed
  title: string;            // indexed
  author: string;           // indexed
  content: string;
  description?: string;
  cover?: string;
  category?: string;        // indexed
  isPro?: boolean;          // indexed
  downloadedAt: Date;       // indexed
  lastRead: Date;           // indexed
}
```

#### Table: readingProgress
```typescript
interface ReadingProgress {
  id?: number;              // auto-increment
  bookId: string;           // indexed
  progress: number;         // indexed
  currentPage: number;      // indexed
  lastPosition: number;     // indexed
  updatedAt: Date;          // indexed
}
```

## Events

### Network Events
```typescript
// window.addEventListener('online', handleOnline)
// window.addEventListener('offline', handleOffline)

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

### Pointer Events
```typescript
// element.addEventListener('pointerdown', handlePointerDown)
// element.addEventListener('pointerup', handlePointerUp)

useEffect(() => {
  const element = document.getElementById('book-reader-content');
  if (element && settings.isPageMode) {
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
    };
  }
}, [currentPage, totalPages, settings.isPageMode]);
```

## Error Handling

### API Errors
```typescript
try {
  const response = await axios.get(`${API_URL}/books/${id}`);
  // Success
} catch (error) {
  console.error('[EnhancedBookReader] Failed to fetch book:', error);

  // Fallback to offline storage
  if (!isOnline) {
    const offlineBook = await offlineBooks.getBook(id);
    if (offlineBook) {
      // Use offline data
    }
  }
}
```

### IndexedDB Errors
```typescript
try {
  await offlineBooks.saveBook(book);
  return true;
} catch (error) {
  console.error('Error saving book offline:', error);
  return false;
}
```

### TTS Errors
```typescript
const utterance = new SpeechSynthesisUtterance(text);

utterance.onend = () => setIsPlaying(false);
utterance.onerror = () => {
  setIsPlaying(false);
  console.error('Ошибка озвучки');
};

try {
  window.speechSynthesis.speak(utterance);
  setIsPlaying(true);
} catch (error) {
  console.error('Error starting speech:', error);
  setIsPlaying(false);
}
```

## Performance Optimization

### useCallback
```typescript
// Memoize functions that are passed as props or used in dependencies
const splitContentIntoPages = useCallback((content: string) => {
  // ...
}, []);
```

### useEffect Dependencies
```typescript
// Re-split content only when settings change
useEffect(() => {
  if (book && book.content) {
    splitContentIntoPages(book.content);
  }
}, [settings.fontSize, settings.lineHeight, book]);
```

### Debounce
```typescript
// Debounce scroll position save
const debouncedSaveScroll = debounce(() => {
  const scrollPos = window.scrollY;
  // Save to bookmark
}, 1000);
```

## Security

### XSS Protection
```typescript
// Sanitize all HTML content
import DOMPurify from 'dompurify';

const cleanContent = DOMPurify.sanitize(htmlContent);
```

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' https: data:;">
```

## Browser Compatibility

### Required APIs
- IndexedDB (для Dexie) ✅
- Web Speech API (опционально) ⚠️
- Touch Events / Pointer Events ✅
- Storage API (для quota) ⚠️
- Web Share API (опционально) ⚠️

### Fallbacks
- No Web Speech: Show alert "Not supported"
- No Share API: Copy to clipboard
- No Storage API: Skip quota check

## Testing

### Unit Tests
```typescript
describe('EnhancedBookReader', () => {
  test('should split content into pages', () => {
    const content = 'Lorem ipsum...';
    splitContentIntoPages(content);
    expect(pages.length).toBeGreaterThan(0);
  });

  test('should navigate to next page', () => {
    nextPage();
    expect(currentPage).toBe(2);
  });

  test('should save progress to IndexedDB', async () => {
    await updateProgress(5);
    const progress = await readingProgress.getProgress('bookId');
    expect(progress.currentPage).toBe(5);
  });
});
```

### Integration Tests
```typescript
describe('EnhancedBookReader Integration', () => {
  test('should load book from API', async () => {
    render(<EnhancedBookReader />);
    await waitFor(() => {
      expect(screen.getByText('Book Title')).toBeInTheDocument();
    });
  });

  test('should fallback to offline storage', async () => {
    // Mock offline
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<EnhancedBookReader />);
    await waitFor(() => {
      expect(offlineBooks.getBook).toHaveBeenCalled();
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Book not loading**
   - Check API URL in apiConfig.ts
   - Check network tab in DevTools
   - Check IndexedDB for offline data

2. **Progress not saving**
   - Check IndexedDB in Application tab
   - Check bookId type (must be string)
   - Check saveProgress() calls

3. **Swipe not working**
   - Check touch-action CSS
   - Check minimum swipe distance (50px)
   - Check pointer events registration

4. **TTS not working**
   - Check browser support
   - Check text content (not empty)
   - Check lang setting ('ru-RU')
