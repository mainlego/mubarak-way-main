# EnhancedBookReader - Примеры использования

## 1. Базовое использование

### Добавить роут
```tsx
// App.tsx
import { EnhancedBookReader } from '@/widgets/library';

<Routes>
  <Route path="/books/:id" element={<EnhancedBookReader />} />
</Routes>
```

### Навигация к книге
```tsx
// BookCard.tsx
const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/books/${book.id}`)}>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
    </div>
  );
};
```

## 2. Офлайн функциональность

### Сохранить книгу для офлайн чтения
```tsx
// BookActions.tsx
import { offlineBooks } from '@/shared/lib/offlineStorage';
import { useOfflineBooks } from '@/shared/hooks/useOffline';

const BookActions = ({ book }) => {
  const { saveBook, isBookOffline } = useOfflineBooks();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkOfflineStatus();
  }, [book.id]);

  const checkOfflineStatus = async () => {
    const offline = await isBookOffline(book.id);
    setIsOffline(offline);
  };

  const handleSaveOffline = async () => {
    const success = await saveBook({
      bookId: book.id,
      title: book.title,
      author: book.author,
      content: book.content,
      description: book.description,
      cover: book.cover,
      category: book.category,
      isPro: book.isPro
    });

    if (success) {
      setIsOffline(true);
      alert('Книга сохранена для офлайн чтения!');
    }
  };

  return (
    <button onClick={handleSaveOffline}>
      {isOffline ? '✓ Доступно офлайн' : '↓ Сохранить офлайн'}
    </button>
  );
};
```

### Показать список офлайн книг
```tsx
// OfflineLibrary.tsx
import { useOfflineBooks } from '@/shared/hooks/useOffline';

const OfflineLibrary = () => {
  const { books, loading } = useOfflineBooks();

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Офлайн библиотека ({books.length})</h2>
      {books.map(book => (
        <BookCard key={book.bookId} book={book} />
      ))}
    </div>
  );
};
```

## 3. Прогресс чтения

### Показать прогресс на карточке книги
```tsx
// BookCard.tsx
import { useReadingProgress } from '@/shared/hooks/useOffline';

const BookCard = ({ book }) => {
  const { progress } = useReadingProgress(book.id);

  return (
    <div>
      <h3>{book.title}</h3>
      {progress && (
        <div className="progress-bar">
          <div style={{ width: `${progress.progress}%` }} />
          <span>Прочитано: {progress.progress}%</span>
          <span>Страница: {progress.currentPage}</span>
        </div>
      )}
    </div>
  );
};
```

### Восстановить позицию при открытии
```tsx
// Автоматически работает в EnhancedBookReader
// Прогресс восстанавливается из IndexedDB
// Также восстанавливается scroll position из закладки
```

## 4. Кастомизация тем

### Создать кастомную тему
```tsx
// CustomThemeReader.tsx
import { EnhancedBookReader } from '@/widgets/library';

const CustomThemeReader = () => {
  useEffect(() => {
    // Установить кастомные настройки при монтировании
    localStorage.setItem('readerTheme', 'dark');
    localStorage.setItem('readerFontSize', '22');
    localStorage.setItem('readerLineHeight', '2.0');
  }, []);

  return <EnhancedBookReader />;
};
```

### Переключатель темы в навбаре
```tsx
// Navbar.tsx
const Navbar = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('readerTheme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('readerTheme', newTheme ? 'dark' : 'light');
  };

  return (
    <nav>
      <button onClick={toggleTheme}>
        {isDark ? '🌙' : '☀️'}
      </button>
    </nav>
  );
};
```

## 5. Сетевой статус

### Глобальный индикатор онлайн/офлайн
```tsx
// NetworkIndicator.tsx
import { useNetworkStatus } from '@/shared/hooks/useOffline';

const NetworkIndicator = () => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className={`network-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Онлайн</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Офлайн режим</span>
        </>
      )}
    </div>
  );
};
```

### Предупреждение об офлайн режиме
```tsx
// App.tsx
import { useNetworkStatus } from '@/shared/hooks/useOffline';

const App = () => {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      showNotification('Вы работаете в офлайн режиме', {
        type: 'warning',
        duration: 5000
      });
    }
  }, [isOnline]);

  return <Routes>...</Routes>;
};
```

## 6. Storage Management

### Показать информацию о хранилище
```tsx
// StorageInfo.tsx
import { useStorage } from '@/shared/hooks/useOffline';

const StorageInfo = () => {
  const { storageSize, storageStats } = useStorage();

  if (!storageSize) return null;

  const usedMB = (storageSize.used / 1024 / 1024).toFixed(2);
  const availableMB = (storageSize.available / 1024 / 1024).toFixed(2);

  return (
    <div className="storage-info">
      <h3>Хранилище</h3>
      <div className="storage-bar">
        <div style={{ width: `${storageSize.percentage}%` }} />
      </div>
      <p>Использовано: {usedMB} MB из {availableMB} MB</p>

      <h4>Статистика:</h4>
      <ul>
        <li>Книги: {storageStats?.books || 0}</li>
        <li>Нашиды: {storageStats?.nashids || 0}</li>
        <li>Прогресс чтения: {storageStats?.readingProgress || 0}</li>
        <li>Всего записей: {storageStats?.total || 0}</li>
      </ul>
    </div>
  );
};
```

### Очистка хранилища
```tsx
// SettingsPage.tsx
import { useStorage } from '@/shared/hooks/useOffline';

const SettingsPage = () => {
  const { clearAllData } = useStorage();

  const handleClearStorage = async () => {
    const confirmed = confirm('Удалить все офлайн данные?');
    if (!confirmed) return;

    const success = await clearAllData();
    if (success) {
      alert('Хранилище очищено!');
    }
  };

  return (
    <div>
      <h2>Настройки</h2>
      <button onClick={handleClearStorage} className="danger">
        Очистить офлайн хранилище
      </button>
    </div>
  );
};
```

## 7. Интеграция с Telegram

### Deep Link для скачивания книги
```tsx
// TelegramActions.tsx
const TelegramActions = ({ book }) => {
  const sendToBot = () => {
    const botUsername = window.Telegram?.WebApp?.initDataUnsafe?.bot?.username || 'MubarakWayApp_bot';
    const deepLink = `https://t.me/${botUsername}?start=download_book_${book.id}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        `Отправить книгу "${book.title}" в чат с ботом?`,
        (confirmed) => {
          if (confirmed) {
            window.Telegram.WebApp.HapticFeedback?.impactOccurred('light');
            window.Telegram.WebApp.openLink(deepLink);
          }
        }
      );
    } else {
      window.open(deepLink, '_blank');
    }
  };

  return (
    <button onClick={sendToBot}>
      📥 Отправить в бот
    </button>
  );
};
```

### Haptic feedback при действиях
```tsx
// Utils/telegram.ts
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
  }
};

// BookReader.tsx
const handlePageTurn = () => {
  nextPage();
  hapticFeedback('light');
};

const handleBookmark = () => {
  toggleBookmark();
  hapticFeedback('medium');
};
```

## 8. Аналитика чтения

### Трекинг прогресса чтения
```tsx
// ReadingAnalytics.tsx
import { readingProgress } from '@/shared/lib/offlineStorage';

const ReadingAnalytics = ({ userId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const allProgress = await readingProgress.getAllProgress();

    const stats = {
      totalBooks: allProgress.length,
      completedBooks: allProgress.filter(p => p.progress === 100).length,
      inProgressBooks: allProgress.filter(p => p.progress > 0 && p.progress < 100).length,
      averageProgress: allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length,
      totalPages: allProgress.reduce((sum, p) => sum + p.currentPage, 0)
    };

    setStats(stats);
  };

  if (!stats) return <div>Загрузка статистики...</div>;

  return (
    <div className="reading-analytics">
      <h2>Статистика чтения</h2>
      <div className="stats-grid">
        <StatCard
          icon="📚"
          label="Всего книг"
          value={stats.totalBooks}
        />
        <StatCard
          icon="✅"
          label="Прочитано"
          value={stats.completedBooks}
        />
        <StatCard
          icon="📖"
          label="В процессе"
          value={stats.inProgressBooks}
        />
        <StatCard
          icon="📊"
          label="Средний прогресс"
          value={`${stats.averageProgress.toFixed(0)}%`}
        />
        <StatCard
          icon="📄"
          label="Всего страниц"
          value={stats.totalPages}
        />
      </div>
    </div>
  );
};
```

## 9. Search & Filter

### Поиск по офлайн книгам
```tsx
// OfflineLibrarySearch.tsx
import { useOfflineBooks } from '@/shared/hooks/useOffline';

const OfflineLibrarySearch = () => {
  const { books } = useOfflineBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  return (
    <div>
      <input
        type="search"
        placeholder="Поиск по офлайн книгам..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="books-grid">
        {filteredBooks.map(book => (
          <BookCard key={book.bookId} book={book} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="empty-state">
          Книги не найдены
        </div>
      )}
    </div>
  );
};
```

## 10. Миграция данных

### Миграция из localStorage в IndexedDB
```tsx
// utils/migrateStorage.ts
import { offlineBooks } from '@/shared/lib/offlineStorage';

export const migrateLocalStorageToIndexedDB = async () => {
  try {
    const keys = Object.keys(localStorage);
    const offlineBookKeys = keys.filter(k => k.startsWith('offline_book_'));

    console.log(`Found ${offlineBookKeys.length} books to migrate`);

    for (const key of offlineBookKeys) {
      try {
        const bookData = JSON.parse(localStorage.getItem(key)!);

        // Migrate to IndexedDB
        await offlineBooks.saveBook({
          bookId: bookData.id.toString(),
          title: bookData.title,
          author: bookData.author || '',
          content: bookData.content,
          description: bookData.description,
          cover: bookData.cover,
          category: bookData.category,
          isPro: bookData.isPro
        });

        // Remove from localStorage
        localStorage.removeItem(key);
        console.log(`Migrated: ${bookData.title}`);
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
      }
    }

    console.log('Migration completed!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

// App.tsx - Run once on app init
useEffect(() => {
  const runMigration = async () => {
    const migrated = localStorage.getItem('storage_migrated');
    if (!migrated) {
      await migrateLocalStorageToIndexedDB();
      localStorage.setItem('storage_migrated', 'true');
    }
  };

  runMigration();
}, []);
```

## Заключение

Эти примеры показывают, как использовать EnhancedBookReader в различных сценариях. Компонент полностью интегрирован с offline storage и предоставляет богатый API для работы с книгами, прогрессом чтения и сетевым статусом.
