# EnhancedBookReader - Быстрый старт

## 1. Установка зависимостей

```bash
npm install marked dompurify lucide-react axios dexie
npm install -D @types/marked @types/dompurify
```

## 2. Добавить в Router

```tsx
// App.tsx или routes.tsx
import { EnhancedBookReader } from '@/widgets/library';

<Routes>
  <Route path="/books/:id" element={<EnhancedBookReader />} />
</Routes>
```

## 3. Использование

```tsx
// Навигация к читателю
navigate(`/books/${bookId}`);

// С параметрами
navigate(`/books/${bookId}?guide=true`);
```

## 4. Проверить работу offline storage

```tsx
// В DevTools → Console
// Проверить IndexedDB
const books = await offlineBooks.getAllBooks();
console.log('Offline books:', books);

// Проверить прогресс
const progress = await readingProgress.getProgress('bookId');
console.log('Reading progress:', progress);
```

## 5. Основные функции

### Сохранить книгу офлайн
```tsx
await offlineBooks.saveBook({
  bookId: '123',
  title: 'Book Title',
  author: 'Author Name',
  content: 'Full book content...',
  ...
});
```

### Сохранить прогресс чтения
```tsx
await readingProgress.saveProgress(
  'bookId',
  75,      // progress %
  15,      // current page
  0        // scroll position
);
```

### Проверить онлайн статус
```tsx
const { isOnline, isOffline } = useNetworkStatus();
```

## 6. Keyboard shortcuts (будущая фича)

- `←` - Предыдущая страница
- `→` - Следующая страница
- `Home` - Первая страница
- `End` - Последняя страница
- `Space` - Следующая страница
- `S` - Сохранить закладку
- `T` - Переключить тему
- `F` - Полноэкранный режим

## 7. API Response format

```typescript
// Ожидаемый формат от API
{
  success: true,
  book: {
    _id: "123",
    title: "Book Title",
    author: "Author Name",
    content: "Full text content...",
    extractedText: "Extracted from PDF...",
    description: "Book description",
    cover: "https://example.com/cover.jpg",
    category: "Islamic",
    isPro: false
  }
}
```

## 8. Troubleshooting

### Книга не загружается
```bash
# Проверить API URL
console.log(getApiUrl()); // должен быть правильный URL

# Проверить response
axios.get(`${API_URL}/books/${id}`)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

### IndexedDB не работает
```bash
# В DevTools → Application → IndexedDB
# Должна быть база MubarakWayDB с таблицами:
# - books
# - readingProgress
# - nashids
# - prayerTimes
# - userSettings
# - offlineContent
```

### Swipe не работает
```tsx
// Проверить touch-action в CSS
style={{ touchAction: 'pan-y' }}

// Проверить что нет конфликтующих handlers
// Убрать preventDefault() если есть
```

## 9. Customization

### Изменить количество слов на странице
```tsx
// В splitContentIntoPages()
const wordsPerPage = 1000; // Было: 800
```

### Добавить свою тему
```tsx
const customTheme = {
  isDarkTheme: true,
  fontSize: 20,
  lineHeight: 2.0,
  isPageMode: true,
  speechRate: 1.25
};
```

### Изменить анимацию переворота
```tsx
// В CSS или inline styles
transition: 'all 500ms ease-in-out', // Было: 700ms
```

## 10. Testing

```tsx
// Тест постраничной навигации
test('should navigate pages', () => {
  render(<EnhancedBookReader />);
  const nextButton = screen.getByText('Вперед');
  fireEvent.click(nextButton);
  expect(currentPage).toBe(2);
});

// Тест офлайн режима
test('should load from offline storage', async () => {
  // Mock offline status
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

  // Mock IndexedDB
  const mockBook = { ... };
  offlineBooks.getBook.mockResolvedValue(mockBook);

  render(<EnhancedBookReader />);
  await waitFor(() => {
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
  });
});
```

## Готово!

Теперь компонент готов к использованию. Все функции сохранены, добавлена TypeScript типизация и интеграция с offline storage.
