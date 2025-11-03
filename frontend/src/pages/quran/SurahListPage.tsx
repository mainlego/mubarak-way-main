import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuranStore } from '@shared/store';
import { Card, Spinner } from '@shared/ui';
import type { Surah } from '@mubarak-way/shared';
import { SurahCard } from '@widgets/quran';
import { BookOpen, Search, Bookmark, Clock } from 'lucide-react';

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
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container bg-gradient-accent">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('quran.title')}
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('quran.searchPlaceholder')}
            className="input w-full pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterType === 'all'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'glass text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('common.all')} ({surahs.length})
          </button>
          <button
            onClick={() => setFilterType('meccan')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterType === 'meccan'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'glass text-text-secondary hover:text-text-primary'
            }`}
          >
            Meccan ({surahs.filter(s => s.revelationType === 'meccan').length})
          </button>
          <button
            onClick={() => setFilterType('medinan')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterType === 'medinan'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'glass text-text-secondary hover:text-text-primary'
            }`}
          >
            Medinan ({surahs.filter(s => s.revelationType === 'medinan').length})
          </button>
        </div>
      </header>

      <main className="container-app pb-32">

        {/* Surah List */}
        <div className="space-y-3">
          {filteredSurahs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">
                {t('errors.notFound')}
              </p>
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <SurahCard
                key={surah._id}
                number={surah.number}
                nameArabic={surah.nameArabic}
                nameTransliteration={surah.nameTransliteration}
                nameTranslation={surah.nameTranslation}
                revelationType={surah.revelationType}
                versesCount={surah.numberOfAyahs}
                onClick={() => navigate(`/quran/surah/${surah.number}`)}
              />
            ))
          )}
        </div>

        {/* Quick Navigation */}
        <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-40">
          <button
            onClick={() => navigate('/quran/bookmarks')}
            className="w-12 h-12 bg-gradient-accent rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            aria-label={t('quran.bookmarks')}
          >
            <Bookmark className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => navigate('/quran/history')}
            className="w-12 h-12 bg-gradient-accent rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            aria-label={t('quran.history')}
          >
            <Clock className="w-6 h-6 text-white" />
          </button>
        </div>
      </main>
    </div>
  );
}
