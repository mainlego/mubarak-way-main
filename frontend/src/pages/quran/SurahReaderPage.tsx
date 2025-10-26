import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuranStore, useUserStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';
import type { Ayah } from '@mubarak-way/shared';

export default function SurahReaderPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const { currentSurah, currentAyahs, isLoading, error, loadSurah, loadAyahs } = useQuranStore();
  const { user, toggleFavorite } = useUserStore();

  const [showTranslation, setShowTranslation] = useState(true);
  const [translationLanguage, setTranslationLanguage] = useState(i18n.language);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    if (surahNumber) {
      const number = parseInt(surahNumber, 10);
      loadSurah(number);
      loadAyahs(number, translationLanguage);
    }
  }, [surahNumber, translationLanguage, loadSurah, loadAyahs]);

  const handleToggleBookmark = async (ayahId: string) => {
    if (!user) return;
    await toggleFavorite('ayah', ayahId);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!currentSurah) return;
    const newNumber = direction === 'prev'
      ? currentSurah.number - 1
      : currentSurah.number + 1;

    if (newNumber >= 1 && newNumber <= 114) {
      navigate(`/quran/surah/${newNumber}`);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xl';
      case 'large': return 'text-4xl';
      default: return 'text-3xl';
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !currentSurah) {
    return (
      <div className="page-container p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error || t('errors.notFound')}</p>
          <Button onClick={() => navigate('/quran')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-4 pb-24">
      {/* Header */}
      <header className="mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/quran')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center flex-1">
            {currentSurah.nameTransliteration}
          </h1>

          <button
            onClick={() => navigate('/quran/ai')}
            className="text-2xl hover:scale-110 transition-transform"
          >
            🤖
          </button>
        </div>

        {/* Surah Info */}
        <div className="text-center mb-4">
          <p className="text-3xl font-arabic text-gray-900 dark:text-white mb-2">
            {currentSurah.nameArabic}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentSurah.nameTranslation} • {currentSurah.numberOfAyahs} {t('quran.ayah')} • {currentSurah.revelationType === 'meccan' ? 'Meccan' : 'Medinan'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? '🌐 Hide Translation' : '🌐 Show Translation'}
          </Button>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="small">{t('settings.small')}</option>
            <option value="medium">{t('settings.medium')}</option>
            <option value="large">{t('settings.large')}</option>
          </select>

          {showTranslation && (
            <select
              value={translationLanguage}
              onChange={(e) => setTranslationLanguage(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          )}
        </div>
      </header>

      {/* Bismillah */}
      {currentSurah.number !== 1 && currentSurah.number !== 9 && (
        <div className="text-center mb-8">
          <p className="text-3xl font-arabic text-gray-900 dark:text-white">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('quran.bismillah', { defaultValue: 'In the name of Allah, the Most Gracious, the Most Merciful' })}
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-6">
        {currentAyahs.map((ayah) => {
          const isBookmarked = user?.favorites.ayahs.includes(ayah._id) || false;

          return (
            <Card key={ayah._id} className="relative">
              {/* Ayah Number Badge */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {ayah.numberInSurah}
                </span>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => handleToggleBookmark(ayah._id)}
                className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform"
              >
                {isBookmarked ? '📑' : '📄'}
              </button>

              {/* Arabic Text */}
              <div className={`text-right font-arabic ${getFontSizeClass()} leading-relaxed text-gray-900 dark:text-white mb-4 pt-12`}>
                {ayah.textArabic}
              </div>

              {/* Translation */}
              {showTranslation && ayah.translation && (
                <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-4">
                  {ayah.translation}
                </div>
              )}

              {/* Transliteration */}
              {ayah.transliteration && (
                <div className="text-gray-600 dark:text-gray-400 text-sm italic mt-2">
                  {ayah.transliteration}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate(`/quran/ai?ayah=${ayah._id}`)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  💬 {t('ai.explainVerse')}
                </button>
                {ayah.audio && (
                  <button
                    onClick={() => setPlayingAudio(!playingAudio)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {playingAudio ? '⏸️' : '▶️'} {t('quran.audio')}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <Button
          variant="secondary"
          disabled={currentSurah.number === 1}
          onClick={() => handleNavigate('prev')}
        >
          ← {t('common.back')}
        </Button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentSurah.number} / 114
        </span>

        <Button
          variant="secondary"
          disabled={currentSurah.number === 114}
          onClick={() => handleNavigate('next')}
        >
          {t('common.next')} →
        </Button>
      </div>
    </div>
  );
}
