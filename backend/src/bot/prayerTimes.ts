/**
 * Prayer Times Calculation
 * Uses adhan.js library for precise Islamic prayer times
 */

import { Coordinates, CalculationMethod, PrayerTimes, Prayer, HighLatitudeRule, Madhab } from 'adhan';

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface PrayerInfo {
  name: string;
  time: Date;
  key: string;
  skipNotification?: boolean;
}

export interface CurrentNextPrayer {
  currentPrayer: PrayerInfo | null;
  nextPrayer: PrayerInfo | null;
}

/**
 * Calculate prayer times for a location
 */
export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  calculationMethodName: string = 'MuslimWorldLeague',
  madhab: string = 'shafi'
): PrayerTimesResult | null {
  try {
    const coordinates = new Coordinates(latitude, longitude);

    // Get calculation method
    const params = CalculationMethod.MuslimWorldLeague();

    // For high latitudes use special rule
    if (Math.abs(latitude) > 48) {
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    }

    // Set madhab
    params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
    };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    return null;
  }
}

/**
 * Get current and next prayer
 */
export function getCurrentAndNextPrayer(prayerTimes: PrayerTimesResult): CurrentNextPrayer {
  const now = new Date();
  const prayers: PrayerInfo[] = [
    { name: 'Фаджр', time: prayerTimes.fajr, key: 'fajr' },
    { name: 'Восход', time: prayerTimes.sunrise, key: 'sunrise', skipNotification: true },
    { name: 'Зухр', time: prayerTimes.dhuhr, key: 'dhuhr' },
    { name: 'Аср', time: prayerTimes.asr, key: 'asr' },
    { name: 'Магриб', time: prayerTimes.maghrib, key: 'maghrib' },
    { name: 'Иша', time: prayerTimes.isha, key: 'isha' },
  ];

  let currentPrayer: PrayerInfo | null = null;
  let nextPrayer: PrayerInfo | null = null;

  // Find current and next prayer
  for (let i = 0; i < prayers.length; i++) {
    if (now < prayers[i].time) {
      nextPrayer = prayers[i];
      currentPrayer = i > 0 ? prayers[i - 1] : prayers[prayers.length - 1];
      break;
    }
  }

  // If time after Isha, next prayer is Fajr tomorrow
  if (!nextPrayer) {
    currentPrayer = prayers[prayers.length - 1];
    nextPrayer = prayers[0];
  }

  return { currentPrayer, nextPrayer };
}

/**
 * Format time with timezone
 */
export function formatTime(date: Date, timezone: string = 'Europe/Moscow'): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
}

/**
 * Determine timezone from coordinates
 */
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  const timezones = [
    { name: 'Europe/Moscow', lat: [41, 82], lon: [19, 180] },
    { name: 'Europe/Kaliningrad', lat: [54, 56], lon: [19, 23] },
    { name: 'Europe/Samara', lat: [50, 56], lon: [45, 55] },
    { name: 'Asia/Yekaterinburg', lat: [54, 62], lon: [55, 65] },
    { name: 'Asia/Omsk', lat: [53, 60], lon: [68, 78] },
    { name: 'Asia/Krasnoyarsk', lat: [51, 72], lon: [84, 106] },
    { name: 'Asia/Irkutsk', lat: [50, 62], lon: [100, 120] },
    { name: 'Asia/Yakutsk', lat: [55, 75], lon: [115, 148] },
    { name: 'Asia/Vladivostok', lat: [42, 70], lon: [130, 150] },
    { name: 'Asia/Tashkent', lat: [37, 46], lon: [55, 74] },
    { name: 'Asia/Almaty', lat: [40, 56], lon: [46, 88] },
    { name: 'Europe/Istanbul', lat: [36, 42], lon: [25, 45] },
    { name: 'Asia/Dubai', lat: [22, 27], lon: [51, 57] },
    { name: 'Asia/Riyadh', lat: [16, 33], lon: [34, 56] },
    { name: 'Europe/London', lat: [49, 61], lon: [-11, 2] },
    { name: 'Europe/Paris', lat: [41, 51], lon: [-5, 10] },
    { name: 'Europe/Berlin', lat: [47, 55], lon: [5, 16] },
    { name: 'Asia/Jakarta', lat: [-11, 6], lon: [95, 141] },
    { name: 'Asia/Karachi', lat: [23, 38], lon: [60, 78] },
    { name: 'Asia/Dhaka', lat: [20, 27], lon: [88, 93] },
    { name: 'Asia/Tehran', lat: [25, 40], lon: [44, 64] },
    { name: 'Asia/Baghdad', lat: [29, 38], lon: [38, 49] },
    { name: 'Europe/Kiev', lat: [44, 53], lon: [22, 41] },
    { name: 'Europe/Minsk', lat: [51, 57], lon: [23, 33] },
  ];

  // Check if coordinates fall within any timezone
  for (const tz of timezones) {
    if (
      lat >= tz.lat[0] &&
      lat <= tz.lat[1] &&
      lon >= tz.lon[0] &&
      lon <= tz.lon[1]
    ) {
      return tz.name;
    }
  }

  // Fallback: use UTC offset based on longitude
  const offset = Math.round(lon / 15);
  return offset >= 0 ? `Etc/GMT-${offset}` : `Etc/GMT+${Math.abs(offset)}`;
}
