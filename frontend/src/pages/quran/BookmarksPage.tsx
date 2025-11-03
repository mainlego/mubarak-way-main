import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useQuranStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import { quranService } from '@shared/lib/services/quranService';
import type { Ayah } from '@mubarak-way/shared';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useUserStore();
  const { surahs, loadSurahs } = useQuranStore();

  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surahs.length === 0) {
      loadSurahs();
    }
  }, [surahs.length, loadSurahs]);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user || user.favorites.ayahs.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load all bookmarked ayahs by their ObjectId
        const ayahPromises = user.favorites.ayahs.map(async (ayahId) => {
          try {
            return await quranService.getAyahById(ayahId);
          } catch (err) {
            console.error(`Failed to load ayah ${ayahId}:`, err);
            return null;
          }
        });

        const ayahs = await Promise.all(ayahPromises);
        setBookmarkedAyahs(ayahs.filter(Boolean) as Ayah[]);
      } catch (err) {
        console.error('Error loading bookmarks:', err);
        setError(t('errors.serverError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [user, t]);

  const handleRemoveBookmark = async (ayahId: string) => {
    await toggleFavorite('ayahs', ayahId);
    setBookmarkedAyahs(prev => prev.filter(a => a._id !== ayahId));
  };

  const getSurahInfo = (ayah: Ayah) => {
    return surahs.find(s => s.number === ayah.surahNumber);
  };

  if (!user) {
    return (
      <div className="page-container p-4">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('errors.unauthorized')}
          </p>
          <Button onClick={() => navigate('/')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container p-4 pb-32">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/quran')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📑 {t('quran.bookmarks')}
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {bookmarkedAyahs.length} {t('quran.ayah')}
        </p>
      </header>

      {/* Content */}
      {error ? (
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : bookmarkedAyahs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📑</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('quran.noBookmarks', { defaultValue: 'No bookmarks yet' })}
          </p>
          <Button onClick={() => navigate('/quran')}>
            {t('quran.surahs')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedAyahs.map((ayah) => {
            const surah = getSurahInfo(ayah);

            return (
              <Card key={ayah._id}>
                {/* Surah Info */}
                {surah && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div
                      onClick={() => navigate(`/quran/surah/${surah.number}`)}
                      className="cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {surah.nameTransliteration}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('quran.ayah')} {ayah.numberInSurah}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(ayah._id)}
                      className="text-red-600 dark:text-red-400 hover:scale-110 transition-transform"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {/* Arabic Text */}
                <div className="text-right font-arabic text-2xl leading-relaxed text-gray-900 dark:text-white mb-3">
                  {ayah.textArabic}
                </div>

                {/* Translation */}
                {ayah.translation && (
                  <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {ayah.translation}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate(`/quran/ai?ayah=${ayah._id}`)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    💬 {t('ai.explainVerse')}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
