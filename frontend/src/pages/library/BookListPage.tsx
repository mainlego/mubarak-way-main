import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import { deepLinks, isTelegram } from '@shared/lib/telegram';
import { BookCard } from '@widgets/library';
import { BookOpen, Search, ArrowLeft } from 'lucide-react';

export default function BookListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, toggleFavorite, toggleOffline } = useUserStore();
  const { books, isLoading, error, loadBooks, searchBooks } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (searchQuery) {
      searchBooks(searchQuery);
    } else if (selectedCategory === 'all') {
      loadBooks({ page, limit: 12 });
    } else {
      loadBooks({ category: selectedCategory, page, limit: 12 });
    }
  }, [searchQuery, selectedCategory, page, loadBooks, searchBooks]);

  const handleToggleFavorite = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    if (!user) return;
    await toggleFavorite('books', bookId);
  };

  const handleToggleOffline = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    if (!user) return;

    // Check subscription limits
    const limits = user.subscription.limits;
    const currentOffline = user.offline.books.length;

    if (!user.offline.books.includes(bookId)) {
      if (limits.offlineBooks !== -1 && currentOffline >= limits.offlineBooks) {
        alert(t('subscription.limitReached'));
        return;
      }
    }

    await toggleOffline('books', bookId);
  };

  const handleSendToBot = (e: React.MouseEvent, bookId: number, bookTitle: string) => {
    e.stopPropagation();
    deepLinks.sendBook(bookId, bookTitle);
  };

  const categories = [
    { id: 'all', name: t('common.all') },
    { id: 'quran', name: t('library.categoryQuran', { defaultValue: 'Quran Studies' }) },
    { id: 'hadith', name: t('library.categoryHadith', { defaultValue: 'Hadith' }) },
    { id: 'fiqh', name: t('library.categoryFiqh', { defaultValue: 'Fiqh' }) },
    { id: 'aqeedah', name: t('library.categoryAqeedah', { defaultValue: 'Aqeedah' }) },
    { id: 'seerah', name: t('library.categorySeerah', { defaultValue: 'Seerah' }) },
    { id: 'dua', name: t('library.categoryDua', { defaultValue: 'Dua' }) },
  ];

  if (isLoading && books.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error}</p>
          <Button onClick={() => loadBooks({ page: 1, limit: 12 })}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/library')}
            className="icon-container bg-card hover:bg-card-hover"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <div className="icon-container bg-gradient-accent">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('library.books')}
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('library.searchBooksPlaceholder', { defaultValue: 'Search books...' })}
            className="input w-full pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === category.id
                  ? 'bg-gradient-accent text-white shadow-md'
                  : 'glass text-text-secondary hover:text-text-primary'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <main className="container-app pb-24">

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">
              {t('library.noBooksFound', { defaultValue: 'No books found' })}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {books.map((book) => {
                const isFavorite = user?.favorites.books.includes(book.id) || false;
                const isOffline = user?.offline.books.includes(book.id) || false;

                return (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    category={book.category || ''}
                    pages={book.pages}
                    coverImage={book.coverUrl}
                    isDownloaded={isOffline}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => toggleFavorite('books', book.id)}
                    onDownload={() => toggleOffline('books', book.id)}
                  />
                );
              })}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button
                variant="secondary"
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? t('common.loading') : t('library.loadMore', { defaultValue: 'Load More' })}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
