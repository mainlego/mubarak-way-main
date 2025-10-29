/**
 * Practice Page
 * Select a prayer to practice
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '@shared/ui';
import type { Language } from '@shared/types';

interface PrayerOption {
  id: string;
  name: { ru: string; en: string; ar: string };
  icon: string;
  rakats: number;
  category: 'obligatory' | 'sunnah' | 'special';
}

const PRAYER_OPTIONS: PrayerOption[] = [
  {
    id: 'fajr',
    name: { ru: 'Фаджр', en: 'Fajr', ar: 'الفجر' },
    icon: '🌅',
    rakats: 2,
    category: 'obligatory'
  },
  {
    id: 'dhuhr',
    name: { ru: 'Зухр', en: 'Dhuhr', ar: 'الظهر' },
    icon: '☀️',
    rakats: 4,
    category: 'obligatory'
  },
  {
    id: 'asr',
    name: { ru: 'Аср', en: 'Asr', ar: 'العصر' },
    icon: '🌤️',
    rakats: 4,
    category: 'obligatory'
  },
  {
    id: 'maghrib',
    name: { ru: 'Магриб', en: 'Maghrib', ar: 'المغرب' },
    icon: '🌆',
    rakats: 3,
    category: 'obligatory'
  },
  {
    id: 'isha',
    name: { ru: 'Иша', en: 'Isha', ar: 'العشاء' },
    icon: '🌙',
    rakats: 4,
    category: 'obligatory'
  },
  {
    id: 'witr',
    name: { ru: 'Витр', en: 'Witr', ar: 'الوتر' },
    icon: '✨',
    rakats: 3,
    category: 'sunnah'
  },
  {
    id: 'tahajjud',
    name: { ru: 'Тахаджуд', en: 'Tahajjud', ar: 'التهجد' },
    icon: '🌌',
    rakats: 8,
    category: 'sunnah'
  },
  {
    id: 'juma',
    name: { ru: 'Джума', en: 'Juma', ar: 'الجمعة' },
    icon: '🕌',
    rakats: 2,
    category: 'special'
  },
];

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = (i18n.language as Language) || 'ru';

  const handleStartPractice = (prayerId: string) => {
    navigate(`/prayer/practice/${prayerId}`);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { ru: string; en: string; ar: string }> = {
      obligatory: { ru: 'Обязательная', en: 'Obligatory', ar: 'فرض' },
      sunnah: { ru: 'Сунна', en: 'Sunnah', ar: 'سنة' },
      special: { ru: 'Особая', en: 'Special', ar: 'خاصة' }
    };
    return labels[category]?.[language] || category;
  };

  const obligatoryPrayers = PRAYER_OPTIONS.filter(p => p.category === 'obligatory');
  const sunnahPrayers = PRAYER_OPTIONS.filter(p => p.category === 'sunnah');
  const specialPrayers = PRAYER_OPTIONS.filter(p => p.category === 'special');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ru'
              ? 'Практика намаза'
              : language === 'en'
              ? 'Prayer Practice'
              : 'ممارسة الصلاة'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ru'
              ? 'Выберите намаз для практики'
              : language === 'en'
              ? 'Select a prayer to practice'
              : 'اختر الصلاة للتمرين'}
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {language === 'ru'
                    ? 'Быстрый старт'
                    : language === 'en'
                    ? 'Quick Start'
                    : 'البداية السريعة'}
                </h3>
                <p className="text-white/90 mb-4">
                  {language === 'ru'
                    ? 'Начните с утренней молитвы'
                    : language === 'en'
                    ? 'Start with Fajr prayer'
                    : 'ابدأ بصلاة الفجر'}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handleStartPractice('fajr')}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  {language === 'ru'
                    ? 'Начать'
                    : language === 'en'
                    ? 'Start'
                    : 'ابدأ'}
                </Button>
              </div>
              <div className="text-6xl">
                🌅
              </div>
            </div>
          </div>
        </Card>

        {/* Obligatory Prayers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {getCategoryLabel('obligatory')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obligatoryPrayers.map((prayer) => (
              <Card
                key={prayer.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStartPractice(prayer.id)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {prayer.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {prayer.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prayer.rakats}{' '}
                        {language === 'ru'
                          ? 'ракаата'
                          : language === 'en'
                          ? 'rakats'
                          : 'ركعات'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sunnah Prayers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {getCategoryLabel('sunnah')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sunnahPrayers.map((prayer) => (
              <Card
                key={prayer.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStartPractice(prayer.id)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {prayer.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {prayer.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prayer.rakats}{' '}
                        {language === 'ru'
                          ? 'ракаата'
                          : language === 'en'
                          ? 'rakats'
                          : 'ركعات'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Prayers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {getCategoryLabel('special')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialPrayers.map((prayer) => (
              <Card
                key={prayer.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStartPractice(prayer.id)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {prayer.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {prayer.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prayer.rakats}{' '}
                        {language === 'ru'
                          ? 'ракаата'
                          : language === 'en'
                          ? 'rakats'
                          : 'ركعات'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold mb-1 text-blue-900 dark:text-blue-200">
                  {language === 'ru'
                    ? 'Как это работает?'
                    : language === 'en'
                    ? 'How does it work?'
                    : 'كيف يعمل؟'}
                </h4>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  {language === 'ru'
                    ? 'Выберите намаз, следуйте пошаговым инструкциям и отмечайте выполненные шаги. Система отслеживает ваш прогресс.'
                    : language === 'en'
                    ? 'Select a prayer, follow step-by-step instructions and mark completed steps. The system tracks your progress.'
                    : 'اختر الصلاة، اتبع التعليمات خطوة بخطوة وحدد الخطوات المكتملة. يتتبع النظام تقدمك.'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PracticePage;
