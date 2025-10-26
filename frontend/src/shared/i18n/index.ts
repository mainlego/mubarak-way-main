import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Get user language from Telegram or localStorage
const getUserLanguage = (): string => {
  const telegramLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  const savedLang = localStorage.getItem('language');

  if (savedLang) return savedLang;
  if (telegramLang) {
    // Map Telegram language codes
    if (telegramLang === 'ru') return 'ru';
    if (telegramLang === 'ar') return 'ar';
    return 'en'; // Default to English for others
  }

  return 'ru'; // Default language
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: getUserLanguage(),
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Update document direction for RTL languages
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('language', lng);
});

// Set initial direction
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

export default i18n;
