import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePrayerStore, useUserStore } from '@shared/store';
import { Card, Button } from '@shared/ui';

export default function PrayerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { lessons, loadLessons } = usePrayerStore();

  useEffect(() => {
    if (lessons.length === 0) {
      loadLessons();
    }
  }, [lessons.length, loadLessons]);

  // Calculate prayer learning progress
  const completedLessons = user?.progress?.completedLessons || [];
  const totalLessons = lessons.length || 30; // Approximate total
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

  // Get current streak
  const currentStreak = user?.progress?.currentStreak || 0;

  return (
    <div className="page-container p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🕌 {t('prayer.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('prayer.description', { defaultValue: 'Learn and perfect your prayer' })}
        </p>
      </header>

      {/* Progress Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t('progress.learningProgress', { defaultValue: 'Learning Progress' })}
            </h3>
            <p className="text-sm opacity-90">
              {completedLessons.length} / {totalLessons} {t('prayer.lessons')}
            </p>
          </div>
          <div className="text-4xl">
            {progressPercent >= 100 ? '🎉' : progressPercent >= 50 ? '📚' : '🌱'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 text-sm">
          <span>🔥</span>
          <span>
            {currentStreak} {t('progress.daysInRow')}
          </span>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card
          hoverable
          onClick={() => navigate('/prayer/times')}
          className="text-center"
        >
          <div className="text-4xl mb-2">⏰</div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {t('prayer.times')}
          </h3>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/prayer/qibla')}
          className="text-center"
        >
          <div className="text-4xl mb-2">🧭</div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {t('prayer.qibla')}
          </h3>
        </Card>
      </div>

      {/* Lesson Categories */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('prayer.categories', { defaultValue: 'Categories' })}
        </h2>

        <div className="space-y-3">
          {/* Obligatory Prayers */}
          <Card
            hoverable
            onClick={() => navigate('/prayer/lessons?type=obligatory')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📿</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('prayer.obligatory')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('prayer.obligatoryDesc', { defaultValue: '5 daily prayers' })}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          {/* Optional Prayers */}
          <Card
            hoverable
            onClick={() => navigate('/prayer/lessons?type=optional')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌙</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('prayer.optional')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('prayer.optionalDesc', { defaultValue: 'Sunnah and Nafl prayers' })}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          {/* Special Prayers */}
          <Card
            hoverable
            onClick={() => navigate('/prayer/lessons?type=special')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('prayer.special')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('prayer.specialDesc', { defaultValue: 'Eid, Janazah, Tarawih' })}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          {/* Ablution (Wudu) */}
          <Card
            hoverable
            onClick={() => navigate('/prayer/lessons?type=ablution')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💧</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('prayer.ablution')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('prayer.ablutionDesc', { defaultValue: 'How to perform wudu' })}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Continue Learning */}
      {lessons.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('prayer.continueLearning', { defaultValue: 'Continue Learning' })}
            </h2>
            <button
              onClick={() => navigate('/prayer/lessons')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('common.all')} →
            </button>
          </div>

          <div className="space-y-3">
            {lessons.slice(0, 3).map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.slug);
              const difficulty = lesson.difficulty;
              const difficultyEmoji =
                difficulty === 'beginner' ? '🌱' :
                difficulty === 'intermediate' ? '📚' : '🎓';

              return (
                <Card
                  key={lesson.slug}
                  hoverable
                  onClick={() => navigate(`/prayer/lessons/${lesson.slug}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-xl">✓</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-xl">{difficultyEmoji}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {lesson.category} • {lesson.duration} {t('prayer.min', { defaultValue: 'min' })}
                      </p>
                    </div>

                    <span className="text-gray-400">→</span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-4">
            <Button
              variant="primary"
              onClick={() => navigate('/prayer/lessons')}
            >
              {t('prayer.viewAllLessons', { defaultValue: 'View All Lessons' })}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
