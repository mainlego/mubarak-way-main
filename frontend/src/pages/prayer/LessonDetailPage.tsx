import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrayerStore, useUserStore } from '@shared/store';
import { Spinner, Button, Card } from '@shared/ui';

export default function LessonDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lessonSlug } = useParams<{ lessonSlug: string }>();
  const { currentLesson, isLoading, error, loadLesson } = usePrayerStore();
  const { user, updateUser } = useUserStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (lessonSlug) {
      loadLesson(lessonSlug);
    }
  }, [lessonSlug, loadLesson]);

  // Load saved progress
  useEffect(() => {
    if (currentLesson && user) {
      const progress = user.progress?.lessonProgress?.find(
        p => p.lessonSlug === currentLesson.slug
      );
      if (progress) {
        setCurrentStep(progress.currentStep);
      }
    }
  }, [currentLesson, user]);

  const handleNext = async () => {
    if (!currentLesson) return;

    const nextStep = currentStep + 1;

    // Save progress
    if (user) {
      try {
        const existingProgress = user.progress?.lessonProgress || [];
        const otherProgress = existingProgress.filter(p => p.lessonSlug !== currentLesson.slug);

        await updateUser({
          progress: {
            ...user.progress,
            lessonProgress: [
              ...otherProgress,
              {
                lessonSlug: currentLesson.slug,
                currentStep: nextStep,
                totalSteps: currentLesson.steps.length,
                lastAccessed: new Date().toISOString(),
              },
            ],
          },
        });
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }

    if (nextStep < currentLesson.steps.length) {
      setCurrentStep(nextStep);
    } else {
      // Lesson completed
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentLesson || !user) return;

    try {
      const completedLessons = user.progress?.completedLessons || [];
      if (!completedLessons.includes(currentLesson.slug)) {
        await updateUser({
          progress: {
            ...user.progress,
            completedLessons: [...completedLessons, currentLesson.slug],
          },
        });
      }

      // Show completion message
      alert(`🎉 ${t('prayer.lessonCompleted', { defaultValue: 'Lesson completed! Great job!' })}`);
      navigate('/prayer/lessons');
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div className="page-container p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">{error || t('errors.notFound')}</p>
          <Button onClick={() => navigate('/prayer/lessons')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const step = currentLesson.steps[currentStep];
  const progress = Math.round(((currentStep + 1) / currentLesson.steps.length) * 100);
  const isLastStep = currentStep === currentLesson.steps.length - 1;

  return (
    <div className="page-container flex flex-col h-screen">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/prayer/lessons')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {t('common.back')}
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep + 1} / {currentLesson.steps.length}
          </div>
        </div>

        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {currentLesson.title}
        </h1>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h2>

          {/* Step Content */}
          {step.type === 'text' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {step.content}
              </p>
            </div>
          )}

          {step.type === 'video' && (
            <div className="mb-6">
              {step.videoUrl ? (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={step.videoUrl}
                    controls
                    className="w-full h-full"
                  >
                    {t('errors.videoNotSupported', { defaultValue: 'Your browser does not support video playback.' })}
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎥</div>
                    <p>{t('prayer.videoPlaceholder', { defaultValue: 'Video content' })}</p>
                  </div>
                </div>
              )}
              {step.content && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">{step.content}</p>
              )}
            </div>
          )}

          {step.type === 'image' && (
            <div className="mb-6">
              {step.imageUrl ? (
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p>{t('prayer.imagePlaceholder', { defaultValue: 'Illustration' })}</p>
                  </div>
                </div>
              )}
              {step.content && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">{step.content}</p>
              )}
            </div>
          )}

          {step.type === 'audio' && (
            <div className="mb-6">
              <Card>
                {step.audioUrl ? (
                  <audio controls className="w-full">
                    <source src={step.audioUrl} type="audio/mpeg" />
                    {t('errors.audioNotSupported', { defaultValue: 'Your browser does not support audio playback.' })}
                  </audio>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔊</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('prayer.audioPlaceholder', { defaultValue: 'Audio recitation' })}
                    </p>
                  </div>
                )}
              </Card>
              {step.content && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">{step.content}</p>
              )}
            </div>
          )}

          {step.type === 'quiz' && step.quiz && (
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">{step.content}</p>

              {step.quiz.questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {qIndex + 1}. {question.question}
                  </h3>

                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[qIndex] === oIndex;
                      const isCorrect = oIndex === question.correctAnswer;
                      const showResult = quizAnswers[qIndex] !== undefined;

                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          disabled={showResult}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : isSelected
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                              : isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white">{option}</span>
                            {showResult && isCorrect && <span className="ml-auto">✓</span>}
                            {showResult && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswers[qIndex] !== undefined && question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        💡 {question.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Arabic Text (if present) */}
          {step.arabicText && (
            <Card className="mt-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
              <p className="text-center text-3xl font-arabic text-gray-900 dark:text-white leading-relaxed mb-3">
                {step.arabicText}
              </p>
              {step.transliteration && (
                <p className="text-center text-sm italic text-gray-600 dark:text-gray-400 mb-2">
                  {step.transliteration}
                </p>
              )}
              {step.translation && (
                <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                  {step.translation}
                </p>
              )}
            </Card>
          )}

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <Card className="mt-6 border-l-4 border-accent-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>{t('prayer.tips', { defaultValue: 'Tips' })}</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {step.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
        <Button
          variant="secondary"
          disabled={currentStep === 0}
          onClick={handlePrevious}
        >
          ← {t('common.back')}
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
        >
          {isLastStep ? t('prayer.completeLesson') : t('common.next')} →
        </Button>
      </div>
    </div>
  );
}
