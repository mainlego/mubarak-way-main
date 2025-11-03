import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@shared/store';
import { Card } from '@shared/ui';

export default function ProgressPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  if (!user) {
    return (
      <div className="page-container p-4">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('errors.unauthorized')}
          </p>
        </div>
      </div>
    );
  }

  const progress = user.progress || {};
  const completedLessons = progress.completedLessons?.length || 0;
  const currentStreak = progress.currentStreak || 0;
  const longestStreak = progress.longestStreak || 0;

  // Calculate statistics
  const quranHistory = user.readingHistory?.quran || [];
  const booksHistory = user.readingHistory?.books || [];
  const totalReadPages = booksHistory.reduce((sum, book) => sum + book.currentPage, 0);
  const aiRequests = user.usage?.aiRequests || 0;

  // Mock achievements for demo
  const achievements = [
    {
      id: 'first_lesson',
      title: t('progress.firstLesson', { defaultValue: 'First Lesson' }),
      description: t('progress.firstLessonDesc', { defaultValue: 'Complete your first prayer lesson' }),
      icon: '🌱',
      unlocked: completedLessons >= 1,
      progress: completedLessons >= 1 ? 100 : 0,
    },
    {
      id: 'week_streak',
      title: t('progress.weekStreak', { defaultValue: '7 Day Streak' }),
      description: t('progress.weekStreakDesc', { defaultValue: 'Study for 7 days in a row' }),
      icon: '🔥',
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      progress: Math.min((currentStreak / 7) * 100, 100),
    },
    {
      id: 'ten_lessons',
      title: t('progress.tenLessons', { defaultValue: '10 Lessons' }),
      description: t('progress.tenLessonsDesc', { defaultValue: 'Complete 10 prayer lessons' }),
      icon: '📚',
      unlocked: completedLessons >= 10,
      progress: Math.min((completedLessons / 10) * 100, 100),
    },
    {
      id: 'quran_reader',
      title: t('progress.quranReader', { defaultValue: 'Quran Reader' }),
      description: t('progress.quranReaderDesc', { defaultValue: 'Read 5 different surahs' }),
      icon: '📖',
      unlocked: quranHistory.length >= 5,
      progress: Math.min((quranHistory.length / 5) * 100, 100),
    },
    {
      id: 'book_lover',
      title: t('progress.bookLover', { defaultValue: 'Book Lover' }),
      description: t('progress.bookLoverDesc', { defaultValue: 'Read 100 pages' }),
      icon: '📚',
      unlocked: totalReadPages >= 100,
      progress: Math.min((totalReadPages / 100) * 100, 100),
    },
    {
      id: 'ai_explorer',
      title: t('progress.aiExplorer', { defaultValue: 'AI Explorer' }),
      description: t('progress.aiExplorerDesc', { defaultValue: 'Ask AI 10 questions' }),
      icon: '🤖',
      unlocked: aiRequests >= 10,
      progress: Math.min((aiRequests / 10) * 100, 100),
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="page-container p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 {t('progress.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('progress.description', { defaultValue: 'Track your learning journey' })}
        </p>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {currentStreak}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('progress.currentStreak')}
          </p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
            {longestStreak}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('progress.longestStreak')}
          </p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {completedLessons}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('progress.completedLessons')}
          </p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="text-4xl mb-2">📄</div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {totalReadPages}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('progress.readPages')}
          </p>
        </Card>
      </section>

      {/* More Stats */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('progress.statistics')}
        </h2>

        <div className="space-y-2">
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📖</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('quran.surahs')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quranHistory.length} {t('progress.surahs', { defaultValue: 'surahs read' })}
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {quranHistory.length}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📚</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('library.books')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {booksHistory.length} {t('progress.booksReading', { defaultValue: 'books reading' })}
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {booksHistory.length}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('library.favorites')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.favorites.books.length + user.favorites.nashids.length + user.favorites.ayahs.length} {t('progress.totalFavorites', { defaultValue: 'items' })}
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {user.favorites.books.length + user.favorites.nashids.length + user.favorites.ayahs.length}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('ai.assistant')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiRequests} {t('progress.aiRequests')}
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {aiRequests}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Achievements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('progress.achievements')}
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {unlockedCount} / {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`relative overflow-hidden ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-500 dark:border-yellow-400'
                  : 'opacity-60'
              }`}
            >
              {/* Unlocked badge */}
              {achievement.unlocked && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ✓
                </div>
              )}

              <div className="text-center">
                <div className={`text-5xl mb-2 ${!achievement.unlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {achievement.description}
                </p>

                {/* Progress bar */}
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {Math.round(achievement.progress)}%
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Motivation Card */}
      <Card className="mt-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="text-center">
          <div className="text-4xl mb-3">
            {currentStreak >= 7 ? '🎉' : currentStreak >= 3 ? '💪' : '🌟'}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {currentStreak >= 7
              ? t('progress.amazingStreak', { defaultValue: 'Amazing streak!' })
              : currentStreak >= 3
              ? t('progress.keepGoing', { defaultValue: 'Keep going!' })
              : t('progress.startStreak', { defaultValue: 'Start your learning streak!' })
            }
          </h3>
          <p className="text-sm opacity-90">
            {currentStreak >= 7
              ? t('progress.amazingStreakDesc', { defaultValue: 'You\'re doing great! Keep up the excellent work.' })
              : currentStreak >= 3
              ? t('progress.keepGoingDesc', { defaultValue: 'You\'re on a roll! Don\'t break your streak.' })
              : t('progress.startStreakDesc', { defaultValue: 'Study every day to build your streak!' })
            }
          </p>
        </div>
      </Card>
    </div>
  );
}
