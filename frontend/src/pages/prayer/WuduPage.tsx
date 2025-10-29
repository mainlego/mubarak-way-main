/**
 * Wudu Page
 * Ablution instructions (Taharat, Ghusl, Tayammum)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tabs, Accordion, AccordionItem } from '@shared/ui';
import type { Tab } from '@shared/ui';
import { mockWuduData } from '@shared/lib/mockWuduData';
import { getLocalizedContent } from '@shared/lib/i18n';
import type { Language } from '@shared/types';

export const WuduPage: React.FC = () => {
  const { i18n } = useTranslation();
  const language = (i18n.language as Language) || 'ru';
  const [activeTab, setActiveTab] = useState<string>('taharat');

  const tabs: Tab[] = [
    {
      id: 'taharat',
      label: getLocalizedContent(
        mockWuduData.find((s) => s.type === 'taharat')!.title_i18n,
        language
      ),
    },
    {
      id: 'ghusl',
      label: getLocalizedContent(
        mockWuduData.find((s) => s.type === 'ghusl')!.title_i18n,
        language
      ),
    },
    {
      id: 'tayammum',
      label: getLocalizedContent(
        mockWuduData.find((s) => s.type === 'tayammum')!.title_i18n,
        language
      ),
    },
  ];

  const currentSection = mockWuduData.find((s) => s.id === activeTab);

  if (!currentSection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">💧</span>
            <h1 className="text-2xl font-bold">
              {language === 'ru'
                ? 'Омовение'
                : language === 'en'
                ? 'Ablution'
                : 'الوضوء'}
            </h1>
          </div>
          <p className="text-white/90">
            {getLocalizedContent(currentSection.description_i18n, language)}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3 p-4">
            <span className="text-3xl flex-shrink-0">💧</span>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                {getLocalizedContent(currentSection.title_i18n, language)}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {getLocalizedContent(currentSection.description_i18n, language)}
              </p>
            </div>
          </div>
        </Card>

        {/* Important Notes for Taharat */}
        {activeTab === 'taharat' && (
          <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3 p-4">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                  {language === 'ru'
                    ? 'Важные условия'
                    : language === 'en'
                    ? 'Important conditions'
                    : 'شروط مهمة'}
                </h4>
                <ul className="text-sm space-y-1 text-amber-900 dark:text-amber-200">
                  <li>
                    {language === 'ru'
                      ? '• Вода должна быть чистой и разрешённой'
                      : language === 'en'
                      ? '• Water must be clean and permissible'
                      : '• يجب أن يكون الماء طاهراً ومباحاً'}
                  </li>
                  <li>
                    {language === 'ru'
                      ? '• Удалите всё, что препятствует проникновению воды (лак, воск и т.д.)'
                      : language === 'en'
                      ? '• Remove anything that prevents water from reaching skin (nail polish, wax, etc.)'
                      : '• أزل كل ما يمنع وصول الماء للبشرة (طلاء الأظافر، الشمع، إلخ)'}
                  </li>
                  <li>
                    {language === 'ru'
                      ? '• Следуйте последовательности действий'
                      : language === 'en'
                      ? '• Follow the sequence of actions'
                      : '• اتبع الترتيب المطلوب'}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Important Notes for Tayammum */}
        {activeTab === 'tayammum' && (
          <Card className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-3 p-4">
              <span className="text-2xl flex-shrink-0">ℹ️</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-200">
                  {language === 'ru'
                    ? 'Когда совершается таяммум?'
                    : language === 'en'
                    ? 'When is tayammum performed?'
                    : 'متى يُجرى التيمم؟'}
                </h4>
                <ul className="text-sm space-y-1 text-purple-900 dark:text-purple-200">
                  <li>
                    {language === 'ru'
                      ? '• Когда нет доступа к воде'
                      : language === 'en'
                      ? '• When water is not available'
                      : '• عند عدم توفر الماء'}
                  </li>
                  <li>
                    {language === 'ru'
                      ? '• При болезни, когда вода может навредить'
                      : language === 'en'
                      ? '• During illness when water may cause harm'
                      : '• عند المرض الذي قد يضر معه الماء'}
                  </li>
                  <li>
                    {language === 'ru'
                      ? '• При сильном холоде без возможности нагреть воду'
                      : language === 'en'
                      ? '• In extreme cold without means to heat water'
                      : '• في البرد الشديد دون إمكانية تسخين الماء'}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Steps Accordion */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'ru'
              ? 'Шаги выполнения'
              : language === 'en'
              ? 'Steps to perform'
              : 'خطوات الأداء'}
          </h2>

          <Accordion>
            {currentSection.steps.map((step, index) => (
              <AccordionItem
                key={step.id}
                title={`${step.step_no}. ${getLocalizedContent(step.title_i18n, language)}`}
                defaultOpen={index === 0}
                icon={<span className="text-blue-600 dark:text-blue-400">💧</span>}
              >
                <div className="space-y-3">
                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300">
                    {getLocalizedContent(step.description_i18n, language)}
                  </p>

                  {/* Arabic Text */}
                  {step.arabic_text && (
                    <div className="arabic-text text-right text-lg p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" dir="rtl">
                      {step.arabic_text}
                    </div>
                  )}

                  {/* Transliteration */}
                  {step.translit_text && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {step.translit_text}
                    </p>
                  )}

                  {/* Notes */}
                  {step.notes_i18n && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded">
                      <div className="flex items-start space-x-2">
                        <span className="text-xl flex-shrink-0">💡</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {getLocalizedContent(step.notes_i18n, language)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Placeholder */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
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
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Completion Card */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-3 p-4">
            <span className="text-3xl flex-shrink-0">✅</span>
            <div>
              <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                {language === 'ru'
                  ? 'Вы готовы к намазу!'
                  : language === 'en'
                  ? 'You are ready for prayer!'
                  : 'أنت جاهز للصلاة!'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'ru'
                  ? 'После завершения омовения вы можете приступить к совершению намаза'
                  : language === 'en'
                  ? 'After completing ablution, you can proceed to perform prayer'
                  : 'بعد إتمام الوضوء، يمكنك المضي في أداء الصلاة'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WuduPage;
