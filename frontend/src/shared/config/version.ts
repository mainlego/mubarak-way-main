/**
 * Application Version Configuration
 * Auto-updated on each deployment
 */

export const APP_VERSION = '2.0.0';
export const BUILD_DATE = '2025-11-05T12:59:43.742Z';

export const VERSION_CONFIG = {
  current: APP_VERSION,
  buildDate: BUILD_DATE,
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
  storageKey: 'app_version',
} as const;

/**
 * Check if app version has changed
 */
export const hasVersionChanged = (): boolean => {
  const storedVersion = localStorage.getItem(VERSION_CONFIG.storageKey);
  return storedVersion !== null && storedVersion !== APP_VERSION;
};

/**
 * Update stored version
 */
export const updateStoredVersion = (): void => {
  localStorage.setItem(VERSION_CONFIG.storageKey, APP_VERSION);
};

/**
 * Clear app cache and reload
 */
export const clearCacheAndReload = async (): Promise<void> => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Clear service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Update version and reload
    updateStoredVersion();
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    // Fallback: just reload
    updateStoredVersion();
    window.location.reload();
  }
};
