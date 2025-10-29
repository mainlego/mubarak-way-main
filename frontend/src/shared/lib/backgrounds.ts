/**
 * Islamic Backgrounds Library
 * Collection of high-quality religious backgrounds from Unsplash
 */

export type BackgroundCategory =
  | 'home'
  | 'library'
  | 'nashids'
  | 'qibla'
  | 'reader'
  | 'patterns';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

interface BackgroundStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
}

// Collection of Islamic backgrounds from Unsplash
export const islamicBackgrounds: Record<BackgroundCategory, string[]> = {
  // Home page - mosques and Islamic architecture
  home: [
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Mosque at sunset
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Blue mosque
    'https://images.unsplash.com/photo-1591288495669-42bdf4fe2157?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Islamic architecture
  ],

  // Library - books and calligraphy
  library: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Open Quran
    'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Ancient books
    'https://images.unsplash.com/photo-1609706808980-8c37dadc0c15?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Islamic calligraphy
    'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Manuscripts
  ],

  // Nashids - musical theme
  nashids: [
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Musical instruments
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Traditional instruments
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Sound waves
  ],

  // Qibla - prayer direction, compass, stars
  qibla: [
    'https://images.unsplash.com/photo-1591213954208-66b9e6ba0e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Kaaba at night
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Starry sky
    'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Compass
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Mosque at night
  ],

  // Reader - calm, reading-friendly backgrounds
  reader: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Nature and light
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Soft sunset
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Mountain landscapes
  ],

  // Additional Islamic patterns
  patterns: [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Geometric patterns
    'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Arabic patterns
  ]
};

// Time-based backgrounds for dynamic backgrounds
export const timeBasedBackgrounds: Record<TimeOfDay, string[]> = {
  morning: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  ],
  day: [
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1591288495669-42bdf4fe2157?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  ],
  evening: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  ],
  night: [
    'https://images.unsplash.com/photo-1591213954208-66b9e6ba0e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  ]
};

/**
 * Get a random background from a category
 */
export const getRandomBackground = (category: BackgroundCategory): string => {
  const backgrounds = islamicBackgrounds[category];
  if (!backgrounds || backgrounds.length === 0) {
    return islamicBackgrounds.home[0]; // Default fallback
  }
  return backgrounds[Math.floor(Math.random() * backgrounds.length)];
};

/**
 * Get background with gradient overlay
 */
export const getBackgroundWithOverlay = (
  category: BackgroundCategory,
  opacity: number = 0.4
): BackgroundStyle => {
  const backgroundUrl = getRandomBackground(category);
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}), rgba(0,0,0,${opacity})), url(${backgroundUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
};

/**
 * Get time of day based on current hour
 */
export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning'; // Morning - light tones
  } else if (hour >= 12 && hour < 18) {
    return 'day'; // Day - bright tones
  } else if (hour >= 18 && hour < 22) {
    return 'evening'; // Evening - sunset tones
  } else {
    return 'night'; // Night - dark tones
  }
};

/**
 * Get time-based background
 */
export const getTimeBasedBackground = (category: BackgroundCategory): string => {
  const timeOfDay = getTimeOfDay();
  const backgrounds = timeBasedBackgrounds[timeOfDay];

  if (backgrounds && backgrounds.length > 0) {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }

  return getRandomBackground(category);
};
