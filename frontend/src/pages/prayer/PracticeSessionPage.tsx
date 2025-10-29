/**
 * Practice Session Page
 * Interactive prayer trainer with step-by-step guidance
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@shared/ui';
import { StepCard } from '@widgets/StepCard';
import { usePracticeStore } from '@shared/store/practiceStore';
import type { Language, LessonStep } from '@shared/types';

// Mock data - в будущем будет загружаться из API
const mockLessonSteps: Record<string, LessonStep[]> = {
  'fajr': [
    {
      id: '1',
      lesson_id: 'fajr',
      step_no: 1,
      kind: 'intention',
      image_light_url: null,
      image_dark_url: null,
      audio_url: null,
      arabic_text: 'نَوَيْتُ أَنْ أُصَلِّيَ لِلّهِ تَعَالَى رَكْعَتَيْ صَلَاةِ الْفَجْرِ',
      translit_text: 'Navaitu an usalliya lillahi ta\'ala rak\'atay salat al-fajr',
      translation_text: 'Я намереваюсь совершить для Аллаха два раката утренней молитвы',
      notes_i18n: {
        ru: 'Намерение произносится про себя',
        en: 'The intention is said silently',
        ar: 'النية تقال في القلب'
      }
    },
    {
      id: '2',
      lesson_id: 'fajr',
      step_no: 2,
      kind: 'takbir',
      image_light_url: null,
      image_dark_url: null,
      audio_url: null,
      arabic_text: 'اللَّهُ أَكْبَرُ',
      translit_text: 'Allahu Akbar',
      translation_text: 'Аллах велик',
      notes_i18n: {
        ru: 'Поднимите руки до уровня ушей',
        en: 'Raise your hands to ear level',
        ar: 'ارفع يديك إلى مستوى الأذنين'
      }
    },
  ]
};

export const PracticeSessionPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const language = (i18n.language as Language) || 'ru';
  const {
    current_rakat,
    current_step,
    total_rakats,
    isActive,
    startSession,
    nextStep,
    prevStep,
    nextRakat,
    endSession,
    reset
  } = usePracticeStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Get lesson steps (mock for now)
  const steps = lessonId ? mockLessonSteps[lessonId] || [] : [];
  const currentStep = steps[currentStepIndex];

  // Calculate progress percentage
  const progressPercent = steps.length > 0
    ? Math.round((completedSteps.size / steps.length) * 100)
    : 0;

  // Initialize session
  useEffect(() => {
    if (lessonId && !isActive) {
      startSession(lessonId, 2); // Default 2 rakats
    }
  }, [lessonId, isActive, startSession]);

  // Redirect if no lesson
  useEffect(() => {
    if (!lessonId || steps.length === 0) {
      navigate('/prayer/practice');
    }
  }, [lessonId, steps.length, navigate]);

  if (!lessonId || !currentStep) {
    return null;
  }

  const handleClose = () => {
    reset();
    navigate('/prayer/practice');
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      prevStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkComplete = () => {
    // Mark current step as completed
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepIndex);
    setCompletedSteps(newCompleted);

    // If last step, show completion modal
    if (currentStepIndex === steps.length - 1) {
      setShowCompletionModal(true);
      endSession();
    } else {
      // Auto-advance to next step
      handleNext();
    }
  };

  const handlePlayAudio = () => {
    // Placeholder for audio playback
    setIsAudioPlaying(true);
    setTimeout(() => {
      setIsAudioPlaying(false);
    }, 2000);
  };

  const handleFinishSession = () => {
    setShowCompletionModal(false);
    reset();
    navigate('/prayer');
  };

  const handleContinuePractice = () => {
    setShowCompletionModal(false);
    reset();
    setCompletedSteps(new Set());
    setCurrentStepIndex(0);
    navigate('/prayer/practice');
  };

  const isStepCompleted = completedSteps.has(currentStepIndex);
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-44">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {lessonId.charAt(0).toUpperCase() + lessonId.slice(1)}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ru'
                  ? 'Практика намаза'
                  : language === 'en'
                  ? 'Prayer practice'
                  : 'ممارسة الصلاة'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            {progressPercent}%
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <StepCard
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={steps.length}
          language={language}
          isCompleted={isStepCompleted}
          onPlayAudio={currentStep.audio_url ? handlePlayAudio : undefined}
          isAudioPlaying={isAudioPlaying}
        />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto px-3 py-3">
          {/* Step Counter */}
          <div className="mb-2 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {completedSteps.size} {language === 'ru' ? 'из' : language === 'en' ? 'of' : 'من'}{' '}
              {steps.length}{' '}
              {language === 'ru'
                ? 'шагов выполнено'
                : language === 'en'
                ? 'steps completed'
                : 'خطوات مكتملة'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevious}
              disabled={!canGoBack}
              className={!canGoBack ? 'invisible' : 'shrink-0'}
            >
              <span className="hidden sm:inline">← {t('action.back') || 'Назад'}</span>
              <span className="sm:hidden">←</span>
            </Button>

            {/* Complete Button */}
            <Button
              variant={isStepCompleted ? 'secondary' : 'primary'}
              size="lg"
              onClick={handleMarkComplete}
              className="flex-1 min-w-0"
            >
              {isStepCompleted ? (
                <span className="flex items-center justify-center space-x-2 truncate">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {language === 'ru'
                      ? 'Выполнено'
                      : language === 'en'
                      ? 'Done'
                      : 'مكتمل'}
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2 truncate">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {language === 'ru'
                      ? 'Я выполнил'
                      : language === 'en'
                      ? 'I did it'
                      : 'أكملت'}
                  </span>
                </span>
              )}
            </Button>

            {/* Next Button */}
            <Button
              variant="outline"
              size="md"
              onClick={handleNext}
              disabled={!canGoNext}
              className={!canGoNext ? 'invisible' : 'shrink-0'}
            >
              <span className="hidden sm:inline">{t('action.next') || 'Далее'} →</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <Card className="max-w-md w-full animate-fade-in p-6">
            <div className="text-center">
              {/* Celebration Icon */}
              <div className="mb-4 text-6xl">
                🎉
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {language === 'ru'
                  ? 'Поздравляем!'
                  : language === 'en'
                  ? 'Congratulations!'
                  : 'تهانينا!'}
              </h2>

              {/* Message */}
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {language === 'ru'
                  ? 'Вы успешно завершили практику намаза!'
                  : language === 'en'
                  ? 'You have successfully completed prayer practice!'
                  : 'لقد أكملت ممارسة الصلاة بنجاح!'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {steps.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ru'
                      ? 'Шагов'
                      : language === 'en'
                      ? 'Steps'
                      : 'خطوات'}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    100%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ru'
                      ? 'Прогресс'
                      : language === 'en'
                      ? 'Progress'
                      : 'التقدم'}
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {language === 'ru'
                    ? '«Продолжайте практиковаться, и ваш намаз станет совершенным!»'
                    : language === 'en'
                    ? '"Keep practicing and your prayer will become perfect!"'
                    : '«استمر في التمرين وستصبح صلاتك مثالية!»'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinishSession}
                  className="w-full"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>📊</span>
                    <span>
                      {language === 'ru'
                        ? 'Завершить'
                        : language === 'en'
                        ? 'Finish'
                        : 'إنهاء'}
                    </span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleContinuePractice}
                  className="w-full"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>
                      {language === 'ru'
                        ? 'Продолжить практику'
                        : language === 'en'
                        ? 'Continue practice'
                        : 'متابعة التمرين'}
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PracticeSessionPage;
