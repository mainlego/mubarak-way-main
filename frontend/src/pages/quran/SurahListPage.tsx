import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '@shared/store';
import { Card, Spinner } from '@shared/ui';
import type { Surah } from '@mubarak-way/shared';

export default function SurahListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { surahs, isLoading, error, loadSurahs } = useQuranStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan'>('all');

  useEffect(() => {
    if (surahs.length === 0 && !isLoading && !error) {
      loadSurahs();
    }
  }, [surahs.length, isLoading, error, loadSurahs]);

  // Filter surahs based on search and type
  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch =
      surah.nameArabic.includes(searchQuery) ||
      surah.nameTransliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery);

    const matchesType =
      filterType === 'all' ||
      surah.revelationType === filterType;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
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
          <button
            onClick={() => loadSurahs()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('quran.title')}
        </h1>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('quran.searchPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('common.all')} ({surahs.length})
          </button>
          <button
            onClick={() => setFilterType('meccan')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'meccan'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Meccan ({surahs.filter(s => s.revelationType === 'meccan').length})
          </button>
          <button
            onClick={() => setFilterType('medinan')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'medinan'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Medinan ({surahs.filter(s => s.revelationType === 'medinan').length})
          </button>
        </div>
      </header>

      {/* Surah List */}
      <div className="space-y-2">
        {filteredSurahs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('errors.notFound')}
          </div>
        ) : (
          filteredSurahs.map((surah) => (
            <Card
              key={surah._id}
              hoverable
              onClick={() => navigate(`/quran/surah/${surah.number}`)}
            >
              <div className="flex items-center gap-4">
                {/* Number */}
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                    {surah.number}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {surah.nameTransliteration}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {surah.nameTranslation}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {surah.numberOfAyahs} {t('quran.ayah')} • {surah.revelationType === 'meccan' ? 'Meccan' : 'Medinan'}
                  </p>
                </div>

                {/* Arabic Name */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl font-arabic text-gray-900 dark:text-white">
                    {surah.nameArabic}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Quick Navigation */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <button
          onClick={() => navigate('/quran/bookmarks')}
          className="w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
          aria-label={t('quran.bookmarks')}
        >
          📑
        </button>
        <button
          onClick={() => navigate('/quran/history')}
          className="w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
          aria-label={t('quran.history')}
        >
          🕐
        </button>
      </div>
    </div>
  );
}
