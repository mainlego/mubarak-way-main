import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePrayerStore, useUserStore } from '@shared/store';
import { Card, Button } from '@shared/ui';
import { PrayerCard, PrayerCircularProgress } from '@widgets/prayer';
import { Clock, Compass, BookOpen, Droplet, Star, Flame } from 'lucide-react';

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
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-container bg-gradient-accent">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t('prayer.title')}
            </h1>
            <p className="text-sm text-text-tertiary">
              {t('prayer.description', { defaultValue: 'Learn and perfect your prayer' })}
            </p>
          </div>
        </div>
      </header>

      <main className="container-app space-y-6 pb-24">
        {/* Progress Card with Circular Progress */}
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {t('progress.learningProgress', { defaultValue: 'Learning Progress' })}
              </h3>
              <p className="text-sm text-white/90">
                {completedLessons.length} / {totalLessons} {t('prayer.lessons')}
              </p>
            </div>
            <PrayerCircularProgress
              progress={progressPercent}
              size={80}
              strokeWidth={8}
            />
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 text-white/90">
            <Flame className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">
              {currentStreak} {t('progress.daysInRow')}
            </span>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            variant="glass"
            hoverable
            onClick={() => navigate('/prayer/times')}
          >
            <div className="flex flex-col items-center text-center py-3">
              <div className="icon-container bg-gradient-accent mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm">
                {t('prayer.times')}
              </h3>
            </div>
          </Card>

          <Card
            variant="glass"
            hoverable
            onClick={() => navigate('/prayer/qibla')}
          >
            <div className="flex flex-col items-center text-center py-3">
              <div className="icon-container bg-gradient-accent mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm">
                {t('prayer.qibla')}
              </h3>
            </div>
          </Card>
        </div>

        {/* Lesson Categories */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {t('prayer.categories', { defaultValue: 'Categories' })}
          </h2>

          <div className="space-y-3">
            {/* Obligatory Prayers */}
            <PrayerCard
              icon={BookOpen}
              title={t('prayer.obligatory')}
              subtitle={t('prayer.obligatoryDesc', { defaultValue: '5 daily prayers' })}
              iconBgColor="bg-gradient-accent"
              onClick={() => navigate('/prayer/lessons?type=obligatory')}
            />

            {/* Optional Prayers */}
            <PrayerCard
              icon={Star}
              title={t('prayer.optional')}
              subtitle={t('prayer.optionalDesc', { defaultValue: 'Sunnah and Nafl prayers' })}
              iconBgColor="bg-gradient-accent"
              onClick={() => navigate('/prayer/lessons?type=optional')}
            />

            {/* Special Prayers */}
            <PrayerCard
              icon={Star}
              title={t('prayer.special')}
              subtitle={t('prayer.specialDesc', { defaultValue: 'Eid, Janazah, Tarawih' })}
              iconBgColor="bg-gradient-accent"
              onClick={() => navigate('/prayer/lessons?type=special')}
            />

            {/* Ablution (Wudu) */}
            <PrayerCard
              icon={Droplet}
              title={t('prayer.ablution')}
              subtitle={t('prayer.ablutionDesc', { defaultValue: 'How to perform wudu' })}
              iconBgColor="bg-gradient-accent"
              onClick={() => navigate('/prayer/lessons?type=ablution')}
            />
          </div>
        </section>

        {/* Continue Learning */}
        {lessons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {t('prayer.continueLearning', { defaultValue: 'Continue Learning' })}
              </h2>
              <button
                onClick={() => navigate('/prayer/lessons')}
                className="text-sm text-accent hover:underline font-medium"
              >
                {t('common.all')} →
              </button>
            </div>

            <div className="space-y-3">
              {lessons.slice(0, 3).map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.slug);

                return (
                  <Card
                    key={lesson.slug}
                    variant="glass"
                    hoverable
                    onClick={() => navigate(`/prayer/lessons/${lesson.slug}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                            <span className="text-xl text-success">✓</span>
                          </div>
                        ) : (
                          <div className="icon-container bg-card">
                            <BookOpen className="w-5 h-5 text-accent" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-text-primary truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-text-tertiary truncate">
                          {lesson.category} • {lesson.duration} {t('prayer.min', { defaultValue: 'min' })}
                        </p>
                      </div>

                      <span className="text-text-tertiary">→</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/prayer/lessons')}
                className="w-full"
              >
                {t('prayer.viewAllLessons', { defaultValue: 'View All Lessons' })}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
