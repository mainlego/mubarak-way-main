import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Card, Button, Spinner } from '@shared/ui';
import { Search, Star, Download, BookOpen, Filter } from 'lucide-react';

export default function BooksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { books, isLoading, error, loadBooks } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);

  useEffect(() => {
    if (books.length === 0) {
      loadBooks({ page: 1, limit: 50 });
    }
  }, [books.length, loadBooks]);

  const favoriteBooks = user?.favorites.books || [];
  const offlineBooks = user?.offline.books || [];

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favoriteBooks.includes(book.id);
    const matchesOffline = !showOfflineOnly || offlineBooks.includes(book.id);

    return matchesSearch && matchesCategory && matchesFavorites && matchesOffline;
  });

  const categories = [
    { id: 'all', name: t('common.all'), emoji: '📚' },
    { id: 'quran', name: t('library.categories.quran', { defaultValue: 'Quran Studies' }), emoji: '📖' },
    { id: 'hadith', name: t('library.categories.hadith', { defaultValue: 'Hadith' }), emoji: '📜' },
    { id: 'fiqh', name: t('library.categories.fiqh', { defaultValue: 'Fiqh' }), emoji: '⚖️' },
    { id: 'aqeedah', name: t('library.categories.aqeedah', { defaultValue: 'Aqeedah' }), emoji: '🕌' },
    { id: 'history', name: t('library.categories.history', { defaultValue: 'History' }), emoji: '📚' },
    { id: 'other', name: t('library.categories.other', { defaultValue: 'Other' }), emoji: '📕' },
  ];

  return (
    <div className="page-container p-4 pb-32">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📖 {t('library.books')}
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('library.searchBooks', { defaultValue: 'Search books...' })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Star className="w-4 h-4" />
            {t('library.favorites')}
          </button>
          <button
            onClick={() => setShowOfflineOnly(!showOfflineOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showOfflineOnly
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Download className="w-4 h-4" />
            {t('library.offline')}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {filteredBooks.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.books')}
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {favoriteBooks.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.favorites')}
          </p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {offlineBooks.length}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('library.offline')}
          </p>
        </Card>
      </div>

      {/* Books Grid */}
      {isLoading && books.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => loadBooks({ page: 1, limit: 50 })}>
            {t('common.retry')}
          </Button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('library.noBooksFound', { defaultValue: 'No books found' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const isFavorite = favoriteBooks.includes(book.id);
            const isOffline = offlineBooks.includes(book.id);

            return (
              <Card
                key={book.id}
                hoverable
                onClick={() => navigate(`/library/books/${book.id}`)}
                className="relative"
              >
                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  {isFavorite && <span className="text-lg">⭐</span>}
                  {isOffline && <span className="text-lg">📥</span>}
                </div>

                {/* Cover Image */}
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-5xl text-white">📖</span>
                  </div>
                )}

                {/* Info */}
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                  {book.author}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{book.pages} {t('library.pages', { defaultValue: 'pages' })}</span>
                  {book.language && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {book.language}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
