import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryStore, useUserStore } from '@shared/store';
import { Spinner, Button } from '@shared/ui';

export default function BookReaderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const { currentBook, isLoading, error, loadBook } = useLibraryStore();
  const { user, updateUser } = useUserStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBook(parseInt(bookId, 10));
    }
  }, [bookId, loadBook]);

  // Load saved progress
  useEffect(() => {
    if (currentBook && user) {
      const progress = user.readingProgress?.find(b => b.bookId === currentBook.id);
      if (progress) {
        setCurrentPage(progress.currentPage);
      }
    }
  }, [currentBook, user]);

  // Save progress when page changes
  useEffect(() => {
    if (currentBook && user && currentPage > 1) {
      const saveProgress = async () => {
        try {
          const percentage = Math.round((currentPage / currentBook.pages) * 100);
          await updateUser({
            readingProgress: [
              ...(user.readingProgress?.filter(b => b.bookId !== currentBook.id) || []),
              {
                bookId: currentBook.id,
                currentPage,
                totalPages: currentBook.pages,
                lastRead: new Date(),
                percentage,
              },
            ],
          });
        } catch (err) {
          console.error('Error saving progress:', err);
        }
      };

      // Debounce save
      const timer = setTimeout(saveProgress, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, currentBook, user, updateUser]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (!currentBook) return;

    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(p => p - 1);
    } else if (direction === 'next' && currentPage < currentBook.pages) {
      setCurrentPage(p => p + 1);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !currentBook) {
    return (
      <div className="page-container p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error || t('errors.notFound')}</p>
          <Button onClick={() => navigate('/library/books')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentPage / currentBook.pages) * 100);

  return (
    <div className="page-container flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/library/books')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>

          <div className="flex-1 text-center mx-4">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {currentBook.title}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {currentPage} / {currentBook.pages} ({progress}%)
            </p>
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-2xl hover:scale-110 transition-transform"
          >
            ⚙️
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Settings Menu */}
      {showMenu && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {t('settings.fontSize')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize('small')}
                  className={`px-3 py-1 text-xs rounded ${
                    fontSize === 'small'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`px-3 py-1 text-sm rounded ${
                    fontSize === 'medium'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-3 py-1 text-base rounded ${
                    fontSize === 'large'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  A
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {t('library.goToPage', { defaultValue: 'Go to page' })}
              </p>
              <input
                type="number"
                min="1"
                max={currentBook.pages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value, 10);
                  if (page >= 1 && page <= currentBook.pages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-20 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Book Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-3xl mx-auto px-6 py-8 ${getFontSizeClass()} leading-relaxed text-gray-900 dark:text-white`}>
          {/* In a real app, this would fetch the actual page content from the backend */}
          {/* For now, we'll show placeholder content */}

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {currentBook.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('library.author', { defaultValue: 'Author' })}: {currentBook.author}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('library.page', { defaultValue: 'Page' })} {currentPage}
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="space-y-4">
            <p>
              {currentBook.description || t('library.bookContentPlaceholder', {
                defaultValue: 'Book content would be displayed here. In the production version, this would fetch the actual page content from the backend based on the current page number.'
              })}
            </p>

            {currentBook.pdfUrl && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('library.viewFullPdf', { defaultValue: 'View full PDF version' })}
                </p>
                <a
                  href={currentBook.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  📄 {t('library.openPdf', { defaultValue: 'Open PDF' })}
                </a>
              </div>
            )}

            <div className="text-gray-700 dark:text-gray-300 space-y-4 pt-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
        <Button
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => handlePageChange('prev')}
        >
          ← {t('common.back')}
        </Button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/ai?book=${currentBook.id}`)}
            className="px-4 py-2 text-sm bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            🤖 {t('ai.askQuestion')}
          </button>
        </div>

        <Button
          variant="secondary"
          disabled={currentPage === currentBook.pages}
          onClick={() => handlePageChange('next')}
        >
          {t('common.next')} →
        </Button>
      </div>
    </div>
  );
}
