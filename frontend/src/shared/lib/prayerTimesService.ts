/**
 * Prayer Times Service
 *
 * Provides comprehensive Islamic prayer times calculation using the Adhan library.
 * Features:
 * - Automatic geolocation and prayer time calculation
 * - Multiple calculation methods (MWL, ISNA, Egyptian, etc.)
 * - Madhab support (Shafi, Hanafi)
 * - High latitude rule adjustments
 * - Qibla direction calculation
 * - Offline caching of prayer times
 * - Browser notification support
 * - Real-time prayer tracking
 */

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Prayer,
  Madhab,
  HighLatitudeRule,
  Qibla,
} from 'adhan';
import { offlinePrayerTimes } from './offlineStorage';

// Types
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PrayerTimesData {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  qiyam?: Date;
  location: LocationCoords;
  calculationMethod: string;
  madhab: string;
}

export interface PrayerInfo {
  name: string;
  time: Date;
  timeString: string;
}

export interface NextPrayerInfo extends PrayerInfo {
  remainingTime: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
}

export interface QiblaInfo {
  direction: number;
  location: LocationCoords;
}

export interface PrayerTimesSettings {
  calculationMethod: keyof typeof CalculationMethodMap;
  madhab: 'shafi' | 'hanafi';
  highLatitudeRule: 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';
  adjustments?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
}

// Calculation method mapping
export const CalculationMethodMap = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Dubai: CalculationMethod.Dubai,
  Qatar: CalculationMethod.Qatar,
  Kuwait: CalculationMethod.Kuwait,
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  Singapore: CalculationMethod.Singapore,
  Turkey: CalculationMethod.Turkey,
  Tehran: CalculationMethod.Tehran,
  NorthAmerica: CalculationMethod.NorthAmerica,
} as const;

// High latitude rule mapping
const HighLatitudeRuleMap = {
  middleOfTheNight: HighLatitudeRule.MiddleOfTheNight,
  seventhOfTheNight: HighLatitudeRule.SeventhOfTheNight,
  twilightAngle: HighLatitudeRule.TwilightAngle,
} as const;

// Madhab mapping
const MadhabMap = {
  shafi: Madhab.Shafi,
  hanafi: Madhab.Hanafi,
} as const;

// Prayer name translations
export const PRAYER_NAMES: Record<string, string> = {
  [Prayer.Fajr]: 'Фаджр',
  [Prayer.Sunrise]: 'Восход',
  [Prayer.Dhuhr]: 'Зухр',
  [Prayer.Asr]: 'Аср',
  [Prayer.Maghrib]: 'Магриб',
  [Prayer.Isha]: 'Иша',
  [Prayer.None]: 'Нет',
};

class PrayerTimesService {
  private watchId: number | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private settings: PrayerTimesSettings = {
    calculationMethod: 'MuslimWorldLeague',
    madhab: 'shafi',
    highLatitudeRule: 'middleOfTheNight',
  };

  /**
   * Initialize the service and request notification permissions
   */
  async initialize(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }

    // Load saved settings
    const savedSettings = await this.loadSettings();
    if (savedSettings) {
      this.settings = savedSettings;
    }
  }

  /**
   * Get current geolocation
   */
  async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Start watching location changes
   */
  watchLocation(callback: (location: LocationCoords) => void): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000, // 1 minute
      }
    );
  }

  /**
   * Stop watching location changes
   */
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculate prayer times for a given date and location
   */
  calculatePrayerTimes(
    location: LocationCoords,
    date: Date = new Date(),
    settings?: Partial<PrayerTimesSettings>
  ): PrayerTimesData {
    const coords = new Coordinates(location.latitude, location.longitude);

    // Merge settings
    const currentSettings = { ...this.settings, ...settings };

    // Get calculation parameters
    const params = CalculationMethodMap[currentSettings.calculationMethod]();
    params.madhab = MadhabMap[currentSettings.madhab];
    params.highLatitudeRule = HighLatitudeRuleMap[currentSettings.highLatitudeRule];

    // Apply adjustments if provided
    if (currentSettings.adjustments) {
      params.adjustments = {
        fajr: currentSettings.adjustments.fajr || 0,
        sunrise: currentSettings.adjustments.sunrise || 0,
        dhuhr: currentSettings.adjustments.dhuhr || 0,
        asr: currentSettings.adjustments.asr || 0,
        maghrib: currentSettings.adjustments.maghrib || 0,
        isha: currentSettings.adjustments.isha || 0,
      };
    }

    // Calculate prayer times
    const prayerTimes = new PrayerTimes(coords, date, params);

    // Calculate Qiyam (last third of night)
    const qiyam = this.calculateQiyamTime(prayerTimes);

    return {
      date,
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      qiyam,
      location,
      calculationMethod: currentSettings.calculationMethod,
      madhab: currentSettings.madhab,
    };
  }

  /**
   * Calculate Qiyam time (last third of the night)
   */
  private calculateQiyamTime(prayerTimes: PrayerTimes): Date {
    const maghrib = prayerTimes.maghrib.getTime();
    const fajr = prayerTimes.fajr.getTime();

    // If fajr is on next day
    const fajrTime = fajr < maghrib ? fajr + 24 * 60 * 60 * 1000 : fajr;

    const nightDuration = fajrTime - maghrib;
    const lastThirdStart = maghrib + (nightDuration * 2) / 3;

    return new Date(lastThirdStart);
  }

  /**
   * Get current prayer name
   */
  getCurrentPrayer(prayerTimes: PrayerTimesData): PrayerInfo | null {
    const now = new Date();
    const prayers: Array<[keyof PrayerTimesData, Date]> = [
      ['fajr', prayerTimes.fajr],
      ['dhuhr', prayerTimes.dhuhr],
      ['asr', prayerTimes.asr],
      ['maghrib', prayerTimes.maghrib],
      ['isha', prayerTimes.isha],
    ];

    for (let i = 0; i < prayers.length; i++) {
      const [name, time] = prayers[i];
      const nextTime = prayers[i + 1]?.[1];

      if (now >= time && (!nextTime || now < nextTime)) {
        return {
          name: this.getPrayerNameInRussian(name as string),
          time,
          timeString: this.formatTime(time),
        };
      }
    }

    // If before Fajr, previous prayer was Isha
    if (now < prayerTimes.fajr) {
      return {
        name: this.getPrayerNameInRussian('isha'),
        time: prayerTimes.isha,
        timeString: this.formatTime(prayerTimes.isha),
      };
    }

    return null;
  }

  /**
   * Get next prayer info with countdown
   */
  getNextPrayer(prayerTimes: PrayerTimesData): NextPrayerInfo | null {
    const now = new Date();
    const prayers: Array<[string, Date]> = [
      ['fajr', prayerTimes.fajr],
      ['sunrise', prayerTimes.sunrise],
      ['dhuhr', prayerTimes.dhuhr],
      ['asr', prayerTimes.asr],
      ['maghrib', prayerTimes.maghrib],
      ['isha', prayerTimes.isha],
    ];

    for (const [name, time] of prayers) {
      if (now < time) {
        const remainingMs = time.getTime() - now.getTime();
        const remainingSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        return {
          name: this.getPrayerNameInRussian(name),
          time,
          timeString: this.formatTime(time),
          remainingTime: {
            hours,
            minutes,
            seconds,
            totalSeconds: remainingSeconds,
          },
        };
      }
    }

    // If after Isha, next prayer is tomorrow's Fajr
    const tomorrowTimes = this.calculatePrayerTimes(
      prayerTimes.location,
      new Date(now.getTime() + 24 * 60 * 60 * 1000)
    );

    const remainingMs = tomorrowTimes.fajr.getTime() - now.getTime();
    const remainingSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return {
      name: this.getPrayerNameInRussian('fajr'),
      time: tomorrowTimes.fajr,
      timeString: this.formatTime(tomorrowTimes.fajr),
      remainingTime: {
        hours,
        minutes,
        seconds,
        totalSeconds: remainingSeconds,
      },
    };
  }

  /**
   * Calculate Qibla direction for a location
   */
  getQiblaDirection(location: LocationCoords): QiblaInfo {
    const coords = new Coordinates(location.latitude, location.longitude);
    const qibla = Qibla(coords);

    return {
      direction: qibla,
      location,
    };
  }

  /**
   * Get prayer times with offline support
   */
  async getPrayerTimesWithOfflineSupport(
    location?: LocationCoords,
    date: Date = new Date()
  ): Promise<PrayerTimesData> {
    try {
      // Use provided location or get current location
      const coords = location || (await this.getCurrentLocation());

      // Calculate prayer times
      const prayerTimes = this.calculatePrayerTimes(coords, date);

      // Cache for offline use
      await offlinePrayerTimes.savePrayerTimes(
        date,
        coords,
        prayerTimes,
        this.settings.calculationMethod
      );

      return prayerTimes;
    } catch (error) {
      console.error('Error calculating prayer times:', error);

      // Try to get from cache
      const cached = await offlinePrayerTimes.getPrayerTimes(date);
      if (cached) {
        console.log('Using cached prayer times');
        return cached.times as PrayerTimesData;
      }

      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Schedule prayer notifications
   */
  async setupNotifications(prayerTimes: PrayerTimesData): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const prayers: Array<[string, Date]> = [
      ['Фаджр', prayerTimes.fajr],
      ['Зухр', prayerTimes.dhuhr],
      ['Аср', prayerTimes.asr],
      ['Магриб', prayerTimes.maghrib],
      ['Иша', prayerTimes.isha],
    ];

    const now = new Date();

    for (const [name, time] of prayers) {
      if (time > now) {
        const timeUntil = time.getTime() - now.getTime();

        setTimeout(() => {
          new Notification(`Время намаза: ${name}`, {
            body: `Наступило время намаза ${name}`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: `prayer-${name}`,
            requireInteraction: false,
          });
        }, timeUntil);
      }
    }
  }

  /**
   * Update service settings
   */
  async updateSettings(settings: Partial<PrayerTimesSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettings(this.settings);
  }

  /**
   * Get current settings
   */
  getSettings(): PrayerTimesSettings {
    return { ...this.settings };
  }

  /**
   * Save settings to localStorage
   */
  private async saveSettings(settings: PrayerTimesSettings): Promise<void> {
    try {
      localStorage.setItem('prayerTimesSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving prayer times settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  private async loadSettings(): Promise<PrayerTimesSettings | null> {
    try {
      const saved = localStorage.getItem('prayerTimesSettings');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading prayer times settings:', error);
      return null;
    }
  }

  /**
   * Format time to HH:MM
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get prayer name in Russian
   */
  private getPrayerNameInRussian(name: string): string {
    const names: Record<string, string> = {
      fajr: 'Фаджр',
      sunrise: 'Восход',
      dhuhr: 'Зухр',
      asr: 'Аср',
      maghrib: 'Магриб',
      isha: 'Иша',
      qiyam: 'Кыям',
    };
    return names[name.toLowerCase()] || name;
  }

  /**
   * Get time until next prayer in human-readable format
   */
  getTimeUntilNextPrayer(prayerTimes: PrayerTimesData): string {
    const nextPrayer = this.getNextPrayer(prayerTimes);
    if (!nextPrayer) return '';

    const { hours, minutes } = nextPrayer.remainingTime;

    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин`;
  }

  /**
   * Get all prayer times formatted
   */
  getAllPrayerTimesFormatted(prayerTimes: PrayerTimesData): Array<{ name: string; time: string; date: Date }> {
    return [
      { name: 'Фаджр', time: this.formatTime(prayerTimes.fajr), date: prayerTimes.fajr },
      { name: 'Восход', time: this.formatTime(prayerTimes.sunrise), date: prayerTimes.sunrise },
      { name: 'Зухр', time: this.formatTime(prayerTimes.dhuhr), date: prayerTimes.dhuhr },
      { name: 'Аср', time: this.formatTime(prayerTimes.asr), date: prayerTimes.asr },
      { name: 'Магриб', time: this.formatTime(prayerTimes.maghrib), date: prayerTimes.maghrib },
      { name: 'Иша', time: this.formatTime(prayerTimes.isha), date: prayerTimes.isha },
      ...(prayerTimes.qiyam ? [{ name: 'Кыям', time: this.formatTime(prayerTimes.qiyam), date: prayerTimes.qiyam }] : []),
    ];
  }
}

// Export singleton instance
export const prayerTimesService = new PrayerTimesService();
export default prayerTimesService;
