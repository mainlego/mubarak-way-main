/**
 * Nashid Categories Configuration
 * Detailed categories matching shop implementation
 */

export interface CategoryConfig {
  id: string;
  label: {
    ru: string;
    en: string;
    ar: string;
  };
  emoji: string;
  description: {
    ru: string;
    en: string;
    ar: string;
  };
  color: string; // Tailwind color class
}

export const NASHID_CATEGORIES: Record<string, CategoryConfig> = {
  all: {
    id: 'all',
    label: {
      ru: 'Все нашиды',
      en: 'All Nashids',
      ar: 'جميع الأناشيد',
    },
    emoji: '📋',
    description: {
      ru: 'Показать все доступные нашиды',
      en: 'Show all available nashids',
      ar: 'إظهار جميع الأناشيد المتاحة',
    },
    color: 'blue',
  },

  spiritual: {
    id: 'spiritual',
    label: {
      ru: 'Духовные',
      en: 'Spiritual',
      ar: 'روحانية',
    },
    emoji: '🌙',
    description: {
      ru: 'Нашиды о духовности и вере',
      en: 'Nashids about spirituality and faith',
      ar: 'أناشيد عن الروحانية والإيمان',
    },
    color: 'purple',
  },

  family: {
    id: 'family',
    label: {
      ru: 'Семейные',
      en: 'Family',
      ar: 'عائلية',
    },
    emoji: '👨‍👩‍👧‍👦',
    description: {
      ru: 'Нашиды о семье и родителях',
      en: 'Nashids about family and parents',
      ar: 'أناشيد عن الأسرة والوالدين',
    },
    color: 'green',
  },

  gratitude: {
    id: 'gratitude',
    label: {
      ru: 'Благодарность',
      en: 'Gratitude',
      ar: 'الشكر',
    },
    emoji: '🤲',
    description: {
      ru: 'Нашиды благодарности Аллаху',
      en: 'Nashids of gratitude to Allah',
      ar: 'أناشيد الشكر لله',
    },
    color: 'yellow',
  },

  prophetic: {
    id: 'prophetic',
    label: {
      ru: 'О Пророке ﷺ',
      en: 'About the Prophet ﷺ',
      ar: 'عن النبي ﷺ',
    },
    emoji: '☪️',
    description: {
      ru: 'Нашиды о Пророке Мухаммаде ﷺ',
      en: 'Nashids about Prophet Muhammad ﷺ',
      ar: 'أناشيد عن النبي محمد ﷺ',
    },
    color: 'emerald',
  },

  tawhid: {
    id: 'tawhid',
    label: {
      ru: 'Единобожие',
      en: 'Tawhid',
      ar: 'التوحيد',
    },
    emoji: '☝️',
    description: {
      ru: 'Нашиды о единстве Аллаха',
      en: 'Nashids about the Oneness of Allah',
      ar: 'أناشيد عن توحيد الله',
    },
    color: 'indigo',
  },

  'quran-recitation': {
    id: 'quran-recitation',
    label: {
      ru: 'Чтение Корана',
      en: 'Quran Recitation',
      ar: 'تلاوة القرآن',
    },
    emoji: '📖',
    description: {
      ru: 'Чтение и напевы Корана',
      en: 'Quran recitation and chants',
      ar: 'تلاوة وأنغام القرآن',
    },
    color: 'cyan',
  },

  dua: {
    id: 'dua',
    label: {
      ru: 'Дуа',
      en: 'Dua',
      ar: 'الدعاء',
    },
    emoji: '🤲',
    description: {
      ru: 'Мольбы и дуа',
      en: 'Supplications and dua',
      ar: 'الأدعية والمناجاة',
    },
    color: 'teal',
  },

  religious: {
    id: 'religious',
    label: {
      ru: 'Религиозные',
      en: 'Religious',
      ar: 'دينية',
    },
    emoji: '🕌',
    description: {
      ru: 'Общие религиозные нашиды',
      en: 'General religious nashids',
      ar: 'أناشيد دينية عامة',
    },
    color: 'blue',
  },

  nasheed: {
    id: 'nasheed',
    label: {
      ru: 'Нашиды',
      en: 'Nasheed',
      ar: 'نشيد',
    },
    emoji: '🎵',
    description: {
      ru: 'Классические нашиды',
      en: 'Classic nasheeds',
      ar: 'أناشيد كلاسيكية',
    },
    color: 'rose',
  },

  general: {
    id: 'general',
    label: {
      ru: 'Общие',
      en: 'General',
      ar: 'عامة',
    },
    emoji: '🎼',
    description: {
      ru: 'Разное',
      en: 'Miscellaneous',
      ar: 'متنوعة',
    },
    color: 'gray',
  },

  favorites: {
    id: 'favorites',
    label: {
      ru: 'Избранное',
      en: 'Favorites',
      ar: 'المفضلة',
    },
    emoji: '⭐',
    description: {
      ru: 'Ваши избранные нашиды',
      en: 'Your favorite nashids',
      ar: 'أناشيدك المفضلة',
    },
    color: 'amber',
  },
};

// Helper function to get category config
export function getCategoryConfig(categoryId: string): CategoryConfig {
  return NASHID_CATEGORIES[categoryId] || NASHID_CATEGORIES.general;
}

// Helper function to get category label
export function getCategoryLabel(categoryId: string, language: 'ru' | 'en' | 'ar' = 'ru'): string {
  const config = getCategoryConfig(categoryId);
  return config.label[language];
}

// Get all categories as array
export function getAllCategories(): CategoryConfig[] {
  return Object.values(NASHID_CATEGORIES);
}

// Get categories for filter (excluding 'all' and 'favorites')
export function getFilterCategories(): CategoryConfig[] {
  return getAllCategories().filter(cat => cat.id !== 'all' && cat.id !== 'favorites');
}

// Color mapping for Tailwind classes
export const CATEGORY_COLORS: Record<string, {
  bg: string;
  text: string;
  border: string;
  hover: string;
}> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    hover: 'hover:bg-green-200 dark:hover:bg-green-900/50',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-700',
    hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
    hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/50',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700',
    hover: 'hover:bg-teal-200 dark:hover:bg-teal-900/50',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    hover: 'hover:bg-rose-200 dark:hover:bg-rose-900/50',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-700',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  },
};

export function getCategoryColors(color: string) {
  return CATEGORY_COLORS[color] || CATEGORY_COLORS.gray;
}
