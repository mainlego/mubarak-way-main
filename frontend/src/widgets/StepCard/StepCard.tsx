/**
 * StepCard Widget
 * Displays a single prayer step with all details
 */

import React from 'react';
import { Card, Button } from '@shared/ui';
import type { LessonStep, Language } from '@shared/types';
import { getLocalizedContent } from '@shared/lib/i18n';

interface StepCardProps {
  step: LessonStep;
  stepNumber: number;
  totalSteps: number;
  language: Language;
  isCompleted?: boolean;
  onPlayAudio?: () => void;
  isAudioPlaying?: boolean;
}

const STEP_KIND_ICONS: Record<string, string> = {
  intention: '🤲',
  takbir: '🙌',
  standing: '🧍',
  recitation: '📖',
  ruku: '🙇',
  qiyam: '🧍',
  sajdah: '🛐',
  sitting: '🧘',
  second_sajdah: '🛐',
  tashahhud: '☝️',
  salam: '👋',
  other: '💫',
};

const STEP_KIND_LABELS: Record<string, { ru: string; en: string; ar: string }> = {
  intention: { ru: 'Намерение', en: 'Intention', ar: 'النية' },
  takbir: { ru: 'Такбир', en: 'Takbir', ar: 'التكبير' },
  standing: { ru: 'Стояние', en: 'Standing', ar: 'القيام' },
  recitation: { ru: 'Чтение', en: 'Recitation', ar: 'القراءة' },
  ruku: { ru: 'Руку\'', en: 'Ruku', ar: 'الركوع' },
  qiyam: { ru: 'Кыям', en: 'Qiyam', ar: 'القيام' },
  sajdah: { ru: 'Саджда', en: 'Sajdah', ar: 'السجود' },
  sitting: { ru: 'Сидение', en: 'Sitting', ar: 'الجلوس' },
  second_sajdah: { ru: 'Вторая саджда', en: 'Second Sajdah', ar: 'السجدة الثانية' },
  tashahhud: { ru: 'Ташаххуд', en: 'Tashahhud', ar: 'التشهد' },
  salam: { ru: 'Салам', en: 'Salam', ar: 'السلام' },
  other: { ru: 'Другое', en: 'Other', ar: 'آخر' },
};

export const StepCard: React.FC<StepCardProps> = ({
  step,
  stepNumber,
  totalSteps,
  language,
  isCompleted = false,
  onPlayAudio,
  isAudioPlaying = false,
}) => {
  const stepKindLabel = STEP_KIND_LABELS[step.kind]?.[language] || step.kind;
  const stepIcon = STEP_KIND_ICONS[step.kind] || '💫';

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{stepIcon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {stepNumber}. {stepKindLabel}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ru'
                ? `Шаг ${stepNumber} из ${totalSteps}`
                : language === 'en'
                ? `Step ${stepNumber} of ${totalSteps}`
                : `الخطوة ${stepNumber} من ${totalSteps}`}
            </p>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Image Placeholder */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 h-64 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <div className="text-6xl mb-4">{stepIcon}</div>
            <svg
              className="w-20 h-20 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              {language === 'ru'
                ? 'Иллюстрация появится здесь'
                : language === 'en'
                ? 'Illustration will appear here'
                : 'ستظهر الصورة هنا'}
            </p>
          </div>
        </div>
      </Card>

      {/* Arabic Text */}
      {step.arabic_text && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="arabic-text text-center text-2xl p-4" dir="rtl">
            {step.arabic_text}
          </div>
        </Card>
      )}

      {/* Transliteration */}
      {step.translit_text && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <p className="text-center text-gray-700 dark:text-gray-300 italic text-lg p-4">
            {step.translit_text}
          </p>
        </Card>
      )}

      {/* Translation */}
      {step.translation_text && (
        <Card>
          <p className="text-center text-gray-800 dark:text-gray-200 font-medium p-4">
            {step.translation_text}
          </p>
        </Card>
      )}

      {/* Notes */}
      {step.notes_i18n && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
          <div className="flex items-start space-x-3 p-4">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 text-yellow-900 dark:text-yellow-200">
                {language === 'ru'
                  ? 'Важная заметка'
                  : language === 'en'
                  ? 'Important note'
                  : 'ملاحظة مهمة'}
              </h4>
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                {getLocalizedContent(step.notes_i18n, language)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Audio Player */}
      {step.audio_url && onPlayAudio && (
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔊</span>
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                  {language === 'ru'
                    ? 'Прослушать произношение'
                    : language === 'en'
                    ? 'Listen to pronunciation'
                    : 'استمع إلى النطق'}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {language === 'ru'
                    ? 'Нажмите для воспроизведения'
                    : language === 'en'
                    ? 'Tap to play'
                    : 'اضغط للتشغيل'}
                </p>
              </div>
            </div>
            <Button
              variant={isAudioPlaying ? 'secondary' : 'primary'}
              size="sm"
              onClick={onPlayAudio}
            >
              {isAudioPlaying ? '⏸️' : '▶️'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StepCard;
