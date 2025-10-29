/**
 * usePrayerTimes Hook
 *
 * React hook for managing prayer times in components.
 * Features:
 * - Automatic location detection
 * - Real-time prayer tracking
 * - Countdown to next prayer
 * - Qibla direction
 * - Offline support
 * - Auto-refresh at midnight
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import prayerTimesService, {
  type PrayerTimesData,
  type LocationCoords,
  type PrayerInfo,
  type NextPrayerInfo,
  type QiblaInfo,
  type PrayerTimesSettings,
} from '../lib/prayerTimesService';

interface UsePrayerTimesOptions {
  autoRefresh?: boolean; // Auto-refresh at midnight
  refreshInterval?: number; // Interval to update countdown (ms)
  autoRequestLocation?: boolean; // Auto-request location on mount
  watchLocation?: boolean; // Watch for location changes
}

interface UsePrayerTimesReturn {
  // Prayer times data
  prayerTimes: PrayerTimesData | null;
  currentPrayer: PrayerInfo | null;
  nextPrayer: NextPrayerInfo | null;
  qiblaDirection: QiblaInfo | null;

  // Location
  location: LocationCoords | null;
  locationError: string | null;

  // Loading states
  isLoading: boolean;
  isLocationLoading: boolean;

  // Actions
  refreshPrayerTimes: () => Promise<void>;
  requestLocation: () => Promise<void>;
  updateLocation: (location: LocationCoords) => void;
  updateSettings: (settings: Partial<PrayerTimesSettings>) => Promise<void>;

  // Settings
  settings: PrayerTimesSettings | null;

  // Formatted data
  formattedPrayerTimes: Array<{ name: string; time: string; date: Date }>;
  timeUntilNextPrayer: string;
}

export const usePrayerTimes = (options: UsePrayerTimesOptions = {}): UsePrayerTimesReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 1000, // 1 second for countdown
    autoRequestLocation = true,
    watchLocation = false,
  } = options;

  // State
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerInfo | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<QiblaInfo | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [settings, setSettings] = useState<PrayerTimesSettings | null>(null);

  // Refs
  const refreshIntervalRef = useRef<number | null>(null);
  const midnightTimeoutRef = useRef<number | null>(null);

  /**
   * Initialize service
   */
  useEffect(() => {
    const init = async () => {
      await prayerTimesService.initialize();
      const currentSettings = prayerTimesService.getSettings();
      setSettings(currentSettings);
    };
    init();
  }, []);

  /**
   * Request user location
   */
  const requestLocation = useCallback(async () => {
    setIsLocationLoading(true);
    setLocationError(null);

    try {
      const coords = await prayerTimesService.getCurrentLocation();
      setLocation(coords);

      // Calculate Qibla direction
      const qibla = prayerTimesService.getQiblaDirection(coords);
      setQiblaDirection(qibla);

      return coords;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      setLocationError(message);
      console.error('Location error:', error);
      throw error;
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  /**
   * Manually update location
   */
  const updateLocation = useCallback((newLocation: LocationCoords) => {
    setLocation(newLocation);

    // Calculate Qibla direction
    const qibla = prayerTimesService.getQiblaDirection(newLocation);
    setQiblaDirection(qibla);
  }, []);

  /**
   * Refresh prayer times
   */
  const refreshPrayerTimes = useCallback(async () => {
    if (!location) {
      console.warn('No location available for prayer times calculation');
      return;
    }

    setIsLoading(true);

    try {
      const times = await prayerTimesService.getPrayerTimesWithOfflineSupport(location);
      setPrayerTimes(times);

      // Update current and next prayer
      const current = prayerTimesService.getCurrentPrayer(times);
      const next = prayerTimesService.getNextPrayer(times);

      setCurrentPrayer(current);
      setNextPrayer(next);
    } catch (error) {
      console.error('Error refreshing prayer times:', error);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (newSettings: Partial<PrayerTimesSettings>) => {
    await prayerTimesService.updateSettings(newSettings);
    const updated = prayerTimesService.getSettings();
    setSettings(updated);

    // Recalculate prayer times with new settings
    if (location) {
      await refreshPrayerTimes();
    }
  }, [location, refreshPrayerTimes]);

  /**
   * Setup midnight auto-refresh
   */
  useEffect(() => {
    if (!autoRefresh || !prayerTimes) return;

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      midnightTimeoutRef.current = window.setTimeout(() => {
        console.log('Auto-refreshing prayer times at midnight');
        refreshPrayerTimes();
        scheduleMidnightRefresh(); // Schedule next refresh
      }, timeUntilMidnight);
    };

    scheduleMidnightRefresh();

    return () => {
      if (midnightTimeoutRef.current !== null) {
        clearTimeout(midnightTimeoutRef.current);
      }
    };
  }, [autoRefresh, prayerTimes, refreshPrayerTimes]);

  /**
   * Setup countdown refresh interval
   */
  useEffect(() => {
    if (!prayerTimes || refreshInterval <= 0) return;

    refreshIntervalRef.current = window.setInterval(() => {
      // Update current and next prayer (for countdown)
      const current = prayerTimesService.getCurrentPrayer(prayerTimes);
      const next = prayerTimesService.getNextPrayer(prayerTimes);

      setCurrentPrayer(current);
      setNextPrayer(next);
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current !== null) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [prayerTimes, refreshInterval]);

  /**
   * Watch location changes
   */
  useEffect(() => {
    if (!watchLocation) return;

    prayerTimesService.watchLocation((newLocation) => {
      console.log('Location changed:', newLocation);
      setLocation(newLocation);

      // Calculate Qibla direction
      const qibla = prayerTimesService.getQiblaDirection(newLocation);
      setQiblaDirection(qibla);
    });

    return () => {
      prayerTimesService.stopWatchingLocation();
    };
  }, [watchLocation]);

  /**
   * Auto-request location on mount
   */
  useEffect(() => {
    if (autoRequestLocation && !location && !isLocationLoading) {
      requestLocation().catch((error) => {
        console.error('Auto location request failed:', error);
      });
    }
  }, [autoRequestLocation, location, isLocationLoading, requestLocation]);

  /**
   * Auto-refresh prayer times when location changes
   */
  useEffect(() => {
    if (location && !prayerTimes) {
      refreshPrayerTimes();
    }
  }, [location, prayerTimes, refreshPrayerTimes]);

  // Computed values
  const formattedPrayerTimes = prayerTimes
    ? prayerTimesService.getAllPrayerTimesFormatted(prayerTimes)
    : [];

  const timeUntilNextPrayer = prayerTimes
    ? prayerTimesService.getTimeUntilNextPrayer(prayerTimes)
    : '';

  return {
    // Data
    prayerTimes,
    currentPrayer,
    nextPrayer,
    qiblaDirection,
    location,
    locationError,

    // States
    isLoading,
    isLocationLoading,

    // Actions
    refreshPrayerTimes,
    requestLocation,
    updateLocation,
    updateSettings,

    // Settings
    settings,

    // Computed
    formattedPrayerTimes,
    timeUntilNextPrayer,
  };
};

export default usePrayerTimes;
