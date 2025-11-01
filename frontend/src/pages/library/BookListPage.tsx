import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import { deepLinks, isTelegram } from '@shared/lib/telegram';

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
    <div className="page-container p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/library')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📖 {t('library.books')}
          </h1>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('library.searchBooksPlaceholder', { defaultValue: 'Search books...' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('library.noBooksFound', { defaultValue: 'No books found' })}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {books.map((book) => {
              const isFavorite = user?.favorites.books.includes(book.id) || false;
              const isOffline = user?.offline.books.includes(book.id) || false;
              const isPremium = book.isPremium;
              const hasAccess = !isPremium || user?.subscription.tier !== 'free';

              return (
                <Card
                  key={book.id}
                  hoverable={hasAccess}
                  onClick={() => hasAccess && navigate(`/library/books/${book.id}`)}
                  className="relative"
                >
                  {/* Premium Badge */}
                  {isPremium && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                      ⭐ Pro
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={(e) => handleToggleFavorite(e, book.id)}
                      className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      {isFavorite ? '⭐' : '☆'}
                    </button>
                    {hasAccess && (
                      <button
                        onClick={(e) => handleToggleOffline(e, book.id)}
                        className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        {isOffline ? '📥' : '📄'}
                      </button>
                    )}
                    {hasAccess && isTelegram() && (
                      <button
                        onClick={(e) => handleSendToBot(e, book.id, book.title)}
                        className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        title={t('library.sendToBot', { defaultValue: 'Send to bot' })}
                      >
                        📤
                      </button>
                    )}
                  </div>

                  {/* Cover Image */}
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className={`w-full h-40 object-cover rounded-lg mb-2 ${
                        !hasAccess ? 'opacity-60 grayscale' : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-full h-40 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-2 flex items-center justify-center ${
                      !hasAccess ? 'opacity-60 grayscale' : ''
                    }`}>
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

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{book.pages} {t('library.pages', { defaultValue: 'pages' })}</span>
                    {book.language && (
                      <span className="uppercase">{book.language}</span>
                    )}
                  </div>

                  {/* Lock Overlay */}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/settings/subscription');
                          }}
                        >
                          {t('settings.upgrade')}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => setPage(p => p + 1)}
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('library.loadMore', { defaultValue: 'Load More' })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
