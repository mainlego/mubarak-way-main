import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Card, Button } from '@shared/ui';
import { useEffect } from 'react';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { books, nashids, loadBooks, loadNashids } = useLibraryStore();

  useEffect(() => {
    if (books.length === 0) {
      loadBooks({ page: 1, limit: 6 });
    }
    if (nashids.length === 0) {
      loadNashids({ page: 1, limit: 6 });
    }
  }, [books.length, nashids.length, loadBooks, loadNashids]);

  const favoriteBooks = user?.favorites.books || [];
  const favoriteNashids = user?.favorites.nashids || [];
  const offlineBooks = user?.offline.books || [];
  const offlineNashids = user?.offline.nashids || [];

  return (
    <div className="page-container p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📚 {t('library.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('library.description', { defaultValue: 'Islamic books and nashids collection' })}
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {favoriteBooks.length + favoriteNashids.length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('library.favorites')}
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {offlineBooks.length + offlineNashids.length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('library.offline')}
          </p>
        </Card>
      </div>

      {/* Books Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📖 {t('library.books')}
          </h2>
          <button
            onClick={() => navigate('/library/books')}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('common.all')} →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {books.slice(0, 6).map((book) => {
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
                <div className="absolute top-2 right-2 flex gap-1">
                  {isFavorite && <span className="text-lg">⭐</span>}
                  {isOffline && <span className="text-lg">📥</span>}
                </div>

                {/* Cover Image */}
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-4xl text-white">📖</span>
                  </div>
                )}

                {/* Info */}
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {book.author}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {book.pages} {t('library.pages', { defaultValue: 'pages' })}
                </p>
              </Card>
            );
          })}
        </div>

        {books.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('common.loading')}
          </div>
        )}
      </section>

      {/* Nashids Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            🎵 {t('library.nashids')}
          </h2>
          <button
            onClick={() => navigate('/library/nashids')}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('common.all')} →
          </button>
        </div>

        <div className="space-y-2">
          {nashids.slice(0, 6).map((nashid) => {
            const isFavorite = favoriteNashids.includes(nashid.id);
            const isOffline = offlineNashids.includes(nashid.id);

            return (
              <Card
                key={nashid.id}
                hoverable
                onClick={() => navigate(`/library/nashids?play=${nashid.id}`)}
              >
                <div className="flex items-center gap-3">
                  {/* Cover */}
                  {nashid.coverUrl ? (
                    <img
                      src={nashid.coverUrl}
                      alt={nashid.title}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl text-white">🎵</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {nashid.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {nashid.artist}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {Math.floor(nashid.duration / 60)}:{String(nashid.duration % 60).padStart(2, '0')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isFavorite && <span className="text-lg">⭐</span>}
                    {isOffline && <span className="text-lg">📥</span>}
                    <button className="text-2xl hover:scale-110 transition-transform">
                      ▶️
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {nashids.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('common.loading')}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/library/favorites')}
        >
          ⭐ {t('library.favorites')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/library/offline')}
        >
          📥 {t('library.offline')}
        </Button>
      </div>
    </div>
  );
}
