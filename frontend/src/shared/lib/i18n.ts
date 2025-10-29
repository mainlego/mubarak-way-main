import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language, I18nContent } from '@shared/types';

// Translation resources will be loaded dynamically
const resources = {
  ru: {
    translation: {
      // Navigation
      'nav.home': 'Главная',
      'nav.lessons': 'Уроки',
      'nav.practice': 'Практика',
      'nav.progress': 'Прогресс',
      'nav.wudu': 'Омовение',

      // Onboarding
      'onboarding.welcome': 'Добро пожаловать',
      'onboarding.selectLanguage': 'Выберите язык',
      'onboarding.selectMadhab': 'Выберите мазхаб',
      'onboarding.selectLevel': 'Выберите уровень',
      'onboarding.continue': 'Продолжить',
      'onboarding.skip': 'Пропустить',

      // Lesson Types
      'lessonType.obligatory': 'Обязательные',
      'lessonType.optional': 'Дополнительные',
      'lessonType.significant': 'Значимые',
      'lessonType.special': 'Специальные',
      'lessonType.intro': 'Введение',
      'lessonType.wudu': 'Омовение',

      // Madhabs
      'madhab.hanafi': 'Ханафи',
      'madhab.shafii': 'Шафии',
      'madhab.maliki': 'Малики',
      'madhab.hanbali': 'Ханбали',

      // Levels
      'level.beginner': 'Начинающий',
      'level.intermediate': 'Средний',
      'level.advanced': 'Продвинутый',

      // Actions
      'action.save': 'Сохранить',
      'action.cancel': 'Отмена',
      'action.continue': 'Продолжить',
      'action.back': 'Назад',
      'action.next': 'Далее',
      'action.finish': 'Завершить',
      'action.startPractice': 'Начать практику',
      'action.saveDua': 'Запомнить ду\'а',
      'action.bookmark': 'Добавить в закладки',
      'action.markComplete': 'Отметить пройденным',

      // Audio Player
      'audio.play': 'Воспроизвести',
      'audio.pause': 'Пауза',
      'audio.speed': 'Скорость',
      'audio.autoplay': 'Автовоспроизведение',

      // Progress
      'progress.completed': 'Завершено',
      'progress.inProgress': 'В процессе',
      'progress.streak': 'Серия дней',
      'progress.savedDuas': 'Сохранённые ду\'а',

      // Common
      'common.appName': 'Mubarak Way',
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.retry': 'Повторить',
      'common.offline': 'Офлайн режим',
      'common.rakats': 'ракаатов',

      // Greeting
      'greeting.welcome': 'Добро пожаловать',
      'greeting.assalamu': 'Ассаляму алейкум',

      // Update Notification
      'update.available': 'Доступно обновление',
      'update.description': 'Новая версия приложения готова к установке',
      'update.install': 'Обновить',
      'update.dismiss': 'Закрыть',

      // Sections
      'section.whoMust': 'Кто обязан',
      'section.types': 'Виды',
      'section.conditions': 'Условия',
      'section.adhan': 'Азан',
      'section.iqama': 'Икамат',
      'section.adab': 'Этикет',
      'section.invalidators': 'Что нарушает',
      'section.specialNotes': 'Особые заметки',

      // Prayer Categories
      'category.fard': 'Фард',
      'category.sunnah': 'Сунна',
      'category.wajib': 'Важиб',
      'category.nafl': 'Нафль',
    },
  },
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.lessons': 'Lessons',
      'nav.practice': 'Practice',
      'nav.progress': 'Progress',
      'nav.wudu': 'Ablution',

      // Onboarding
      'onboarding.welcome': 'Welcome',
      'onboarding.selectLanguage': 'Select Language',
      'onboarding.selectMadhab': 'Select Madhab',
      'onboarding.selectLevel': 'Select Level',
      'onboarding.continue': 'Continue',
      'onboarding.skip': 'Skip',

      // Lesson Types
      'lessonType.obligatory': 'Obligatory',
      'lessonType.optional': 'Optional',
      'lessonType.significant': 'Significant',
      'lessonType.special': 'Special',
      'lessonType.intro': 'Introduction',
      'lessonType.wudu': 'Ablution',

      // Madhabs
      'madhab.hanafi': 'Hanafi',
      'madhab.shafii': 'Shafi\'i',
      'madhab.maliki': 'Maliki',
      'madhab.hanbali': 'Hanbali',

      // Levels
      'level.beginner': 'Beginner',
      'level.intermediate': 'Intermediate',
      'level.advanced': 'Advanced',

      // Actions
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.continue': 'Continue',
      'action.back': 'Back',
      'action.next': 'Next',
      'action.finish': 'Finish',
      'action.startPractice': 'Start Practice',
      'action.saveDua': 'Save Dua',
      'action.bookmark': 'Bookmark',
      'action.markComplete': 'Mark Complete',

      // Audio Player
      'audio.play': 'Play',
      'audio.pause': 'Pause',
      'audio.speed': 'Speed',
      'audio.autoplay': 'Autoplay',

      // Progress
      'progress.completed': 'Completed',
      'progress.inProgress': 'In Progress',
      'progress.streak': 'Day Streak',
      'progress.savedDuas': 'Saved Duas',

      // Common
      'common.appName': 'Mubarak Way',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.retry': 'Retry',
      'common.offline': 'Offline Mode',
      'common.rakats': 'rakats',

      // Greeting
      'greeting.welcome': 'Welcome',
      'greeting.assalamu': 'Assalamu Alaikum',

      // Update Notification
      'update.available': 'Update Available',
      'update.description': 'A new version of the app is ready to install',
      'update.install': 'Update',
      'update.dismiss': 'Dismiss',

      // Sections
      'section.whoMust': 'Who Must',
      'section.types': 'Types',
      'section.conditions': 'Conditions',
      'section.adhan': 'Adhan',
      'section.iqama': 'Iqama',
      'section.adab': 'Etiquette',
      'section.invalidators': 'What Invalidates',
      'section.specialNotes': 'Special Notes',

      // Prayer Categories
      'category.fard': 'Fard',
      'category.sunnah': 'Sunnah',
      'category.wajib': 'Wajib',
      'category.nafl': 'Nafl',
    },
  },
  ar: {
    translation: {
      // Navigation
      'nav.home': 'الرئيسية',
      'nav.lessons': 'الدروس',
      'nav.practice': 'التدريب',
      'nav.progress': 'التقدم',
      'nav.wudu': 'الوضوء',

      // Onboarding
      'onboarding.welcome': 'مرحبا',
      'onboarding.selectLanguage': 'اختر اللغة',
      'onboarding.selectMadhab': 'اختر المذهب',
      'onboarding.selectLevel': 'اختر المستوى',
      'onboarding.continue': 'متابعة',
      'onboarding.skip': 'تخطي',

      // Lesson Types
      'lessonType.obligatory': 'الفرائض',
      'lessonType.optional': 'السنن',
      'lessonType.significant': 'المهمة',
      'lessonType.special': 'الخاصة',
      'lessonType.intro': 'المقدمة',
      'lessonType.wudu': 'الوضوء',

      // Madhabs
      'madhab.hanafi': 'الحنفي',
      'madhab.shafii': 'الشافعي',
      'madhab.maliki': 'المالكي',
      'madhab.hanbali': 'الحنبلي',

      // Levels
      'level.beginner': 'مبتدئ',
      'level.intermediate': 'متوسط',
      'level.advanced': 'متقدم',

      // Actions
      'action.save': 'حفظ',
      'action.cancel': 'إلغاء',
      'action.continue': 'متابعة',
      'action.back': 'رجوع',
      'action.next': 'التالي',
      'action.finish': 'إنهاء',
      'action.startPractice': 'بدء التدريب',
      'action.saveDua': 'حفظ الدعاء',
      'action.bookmark': 'إضافة للمفضلة',
      'action.markComplete': 'تحديد كمكتمل',

      // Audio Player
      'audio.play': 'تشغيل',
      'audio.pause': 'إيقاف مؤقت',
      'audio.speed': 'السرعة',
      'audio.autoplay': 'التشغيل التلقائي',

      // Progress
      'progress.completed': 'مكتمل',
      'progress.inProgress': 'قيد التنفيذ',
      'progress.streak': 'سلسلة الأيام',
      'progress.savedDuas': 'الأدعية المحفوظة',

      // Common
      'common.appName': 'طريق المبارك',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.retry': 'إعادة المحاولة',
      'common.offline': 'وضع عدم الاتصال',
      'common.rakats': 'ركعات',

      // Greeting
      'greeting.welcome': 'مرحبا',
      'greeting.assalamu': 'السلام عليكم',

      // Update Notification
      'update.available': 'تحديث متاح',
      'update.description': 'نسخة جديدة من التطبيق جاهزة للتثبيت',
      'update.install': 'تحديث',
      'update.dismiss': 'إغلاق',

      // Sections
      'section.whoMust': 'من يجب عليه',
      'section.types': 'الأنواع',
      'section.conditions': 'الشروط',
      'section.adhan': 'الأذان',
      'section.iqama': 'الإقامة',
      'section.adab': 'الآداب',
      'section.invalidators': 'ما يبطل',
      'section.specialNotes': 'ملاحظات خاصة',

      // Prayer Categories
      'category.fard': 'فرض',
      'category.sunnah': 'سنة',
      'category.wajib': 'واجب',
      'category.nafl': 'نفل',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

/**
 * Helper to get localized content from I18nContent object
 */
export function getLocalizedContent(content: I18nContent, lang: Language): string {
  return content[lang] || content.en || content.ru;
}

/**
 * Set app language and RTL direction
 */
export function setAppLanguage(lang: Language): void {
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}
