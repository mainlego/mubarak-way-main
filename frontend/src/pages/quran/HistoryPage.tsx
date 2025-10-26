import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useQuranStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { surahs, loadSurahs } = useQuranStore();

  useEffect(() => {
    if (surahs.length === 0) {
      loadSurahs();
    }
  }, [surahs.length, loadSurahs]);

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

  // Sort reading history by last read date
  const sortedHistory = [...(user.readingHistory?.quran || [])]
    .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime());

  const getSurahInfo = (surahNumber: number) => {
    return surahs.find(s => s.number === surahNumber);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('common.justNow', { defaultValue: 'Just now' });
    if (diffMins < 60) return t('common.minutesAgo', { defaultValue: `${diffMins} minutes ago`, count: diffMins });
    if (diffHours < 24) return t('common.hoursAgo', { defaultValue: `${diffHours} hours ago`, count: diffHours });
    if (diffDays < 7) return t('common.daysAgo', { defaultValue: `${diffDays} days ago`, count: diffDays });

    return date.toLocaleDateString();
  };

  if (surahs.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container p-4">
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
            🕐 {t('quran.history')}
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sortedHistory.length} {t('quran.surahs')}
        </p>
      </header>

      {/* Content */}
      {sortedHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('quran.noHistory', { defaultValue: 'No reading history yet' })}
          </p>
          <Button onClick={() => navigate('/quran')}>
            {t('quran.surahs')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistory.map((item) => {
            const surah = getSurahInfo(item.surahNumber);
            if (!surah) return null;

            return (
              <Card
                key={item.surahNumber}
                hoverable
                onClick={() => navigate(`/quran/surah/${item.surahNumber}`)}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {surah.nameTranslation}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span>
                        {t('quran.ayah')} {item.lastAyahRead}/{surah.numberOfAyahs}
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.lastRead)}</span>
                    </div>
                  </div>

                  {/* Arabic Name */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-2xl font-arabic text-gray-900 dark:text-white mb-2">
                      {surah.nameArabic}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600"
                        style={{
                          width: `${(item.lastAyahRead / surah.numberOfAyahs) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
