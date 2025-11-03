import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePrayerStore, useUserStore } from '@shared/store';
import { Card, Spinner, Button } from '@shared/ui';

export default function LessonListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();
  const { lessons, isLoading, error, loadLessons, searchLessons } = usePrayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    if (searchQuery) {
      searchLessons(searchQuery);
    } else {
      const category = selectedType !== 'all' ? selectedType : undefined;
      loadLessons(category);
    }
  }, [searchQuery, selectedType, selectedDifficulty, loadLessons, searchLessons]);

  const completedLessons = user?.progress?.completedLessons || [];

  const types = [
    { id: 'all', name: t('common.all'), emoji: '📋' },
    { id: 'obligatory', name: t('prayer.obligatory'), emoji: '📿' },
    { id: 'optional', name: t('prayer.optional'), emoji: '🌙' },
    { id: 'special', name: t('prayer.special'), emoji: '⭐' },
    { id: 'ablution', name: t('prayer.ablution'), emoji: '💧' },
  ];

  const difficulties = [
    { id: 'all', name: t('common.all') },
    { id: 'beginner', name: t('prayer.beginner') },
    { id: 'intermediate', name: t('prayer.intermediate') },
    { id: 'advanced', name: t('prayer.advanced') },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '📚';
      case 'advanced': return '🎓';
      default: return '📖';
    }
  };

  if (isLoading && lessons.length === 0) {
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
          <Button onClick={() => loadLessons()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/prayer')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📖 {t('prayer.lessons')}
          </h1>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('prayer.searchLessonsPlaceholder', { defaultValue: 'Search lessons...' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedType === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{type.emoji}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedDifficulty === diff.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {diff.name}
            </button>
          ))}
        </div>
      </header>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('prayer.noLessonsFound', { defaultValue: 'No lessons found' })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.slug);
            const progress = user?.progress?.lessonProgress?.find(
              p => p.lessonSlug === lesson.slug
            );
            const progressPercent = progress ? Math.round((progress.currentStep / progress.totalSteps) * 100) : 0;

            return (
              <Card
                key={lesson.slug}
                hoverable
                onClick={() => navigate(`/prayer/lessons/${lesson.slug}`)}
                className={isCompleted ? 'border-2 border-green-500 dark:border-green-400' : ''}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                    ) : progressPercent > 0 ? (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {progressPercent}%
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getDifficultyEmoji(lesson.difficulty)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {lesson.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                        {getDifficultyEmoji(lesson.difficulty)} {t(`prayer.${lesson.difficulty}`)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ⏱️ {lesson.duration} {t('prayer.min', { defaultValue: 'min' })}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {lesson.category}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {progressPercent > 0 && !isCompleted && (
                      <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-gray-400">
                    →
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {completedLessons.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('progress.completedLessons')}
            </div>
          </div>
          <div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
          <div>
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {lessons.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('prayer.totalLessons', { defaultValue: 'Total Lessons' })}
            </div>
          </div>
          <div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
          <div>
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {Math.round((completedLessons.length / lessons.length) * 100) || 0}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('progress.progress', { defaultValue: 'Progress' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
