/**
 * Prayer Times Calculation Utility
 * Uses the Adhan library for accurate Islamic prayer time calculations
 * Supports 12 different calculation methods used worldwide
 */

import * as adhan from 'adhan';
import type {
  PrayerCalculationMethod,
  Madhab,
  HighLatitudeRule,
  PrayerTimes,
  PrayerCalculationParams,
  PrayerAdjustments,
} from '@mubarak-way/shared';

/**
 * Map our PrayerCalculationMethod types to Adhan CalculationMethod
 */
const getCalculationMethod = (method: PrayerCalculationMethod) => {
  const methodMap: Record<PrayerCalculationMethod, () => any> = {
    MuslimWorldLeague: adhan.CalculationMethod.MuslimWorldLeague,
    Egyptian: adhan.CalculationMethod.Egyptian,
    Karachi: adhan.CalculationMethod.Karachi,
    UmmAlQura: adhan.CalculationMethod.UmmAlQura,
    Dubai: adhan.CalculationMethod.Dubai,
    Qatar: adhan.CalculationMethod.Qatar,
    Kuwait: adhan.CalculationMethod.Kuwait,
    MoonsightingCommittee: adhan.CalculationMethod.MoonsightingCommittee,
    Singapore: adhan.CalculationMethod.Singapore,
    Tehran: adhan.CalculationMethod.Tehran,
    Turkey: adhan.CalculationMethod.Turkey,
    NorthAmerica: adhan.CalculationMethod.NorthAmerica,
  };

  return methodMap[method]();
};

/**
 * Map our Madhab types to Adhan Madhab
 */
const getMadhab = (madhab: Madhab): string => {
  switch (madhab) {
    case 'hanafi':
      return adhan.Madhab.Hanafi;
    case 'shafi':
    case 'maliki':
    case 'hanbali':
    default:
      return adhan.Madhab.Shafi;  // Default for Shafi, Maliki, Hanbali
  }
};

/**
 * Map our HighLatitudeRule types to Adhan HighLatitudeRule
 */
const getHighLatitudeRule = (rule?: HighLatitudeRule): string => {
  if (!rule) return adhan.HighLatitudeRule.MiddleOfTheNight;

  switch (rule) {
    case 'SeventhOfTheNight':
      return adhan.HighLatitudeRule.SeventhOfTheNight;
    case 'TwilightAngle':
      return adhan.HighLatitudeRule.TwilightAngle;
    case 'MiddleOfTheNight':
    default:
      return adhan.HighLatitudeRule.MiddleOfTheNight;
  }
};

/**
 * Calculate prayer times for a given location, date, and calculation parameters
 */
export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  params: PrayerCalculationParams,
  city?: string,
  country?: string
): PrayerTimes {
  try {
    // Create coordinates
    const coordinates = new adhan.Coordinates(latitude, longitude);

    // Get calculation method parameters
    const calculationParams = getCalculationMethod(params.calculationMethod);

    // Set madhab
    calculationParams.madhab = getMadhab(params.madhab);

    // Set high latitude rule (for latitudes > 48°)
    if (Math.abs(latitude) > 48 || params.highLatitudeRule) {
      calculationParams.highLatitudeRule = getHighLatitudeRule(params.highLatitudeRule);
    }

    // Apply time adjustments if provided
    if (params.adjustments) {
      calculationParams.adjustments = {
        fajr: params.adjustments.fajr || 0,
        sunrise: params.adjustments.sunrise || 0,
        dhuhr: params.adjustments.dhuhr || 0,
        asr: params.adjustments.asr || 0,
        maghrib: params.adjustments.maghrib || 0,
        isha: params.adjustments.isha || 0,
      };
    }

    // Calculate prayer times
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, calculationParams);

    // Calculate Qibla direction
    const qibla = adhan.Qibla(coordinates) as any;

    // Get current and next prayer
    const now = new Date();
    const currentPrayer = prayerTimes.currentPrayer(now);
    const nextPrayer = prayerTimes.nextPrayer(now);

    // Calculate time remaining until next prayer
    let nextPrayerInfo = undefined;
    if (nextPrayer && prayerTimes.timeForPrayer(nextPrayer)) {
      const nextTime = prayerTimes.timeForPrayer(nextPrayer)!;
      const diff = nextTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        nextPrayerInfo = {
          name: getPrayerName(nextPrayer),
          time: nextTime,
          timeRemaining: {
            hours,
            minutes,
            seconds,
            formatted: `${hours}ч ${minutes}м`,
          },
        };
      }
    }

    // Get current prayer info
    let currentPrayerInfo = undefined;
    if (currentPrayer && prayerTimes.timeForPrayer(currentPrayer)) {
      currentPrayerInfo = {
        name: getPrayerName(currentPrayer),
        time: prayerTimes.timeForPrayer(currentPrayer)!,
      };
    }

    // Return formatted result
    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      date,
      location: {
        latitude,
        longitude,
        city,
        country,
      },
      calculationMethod: params.calculationMethod,
      madhab: params.madhab,
      qibla: qibla.direction,
      nextPrayer: nextPrayerInfo,
      currentPrayer: currentPrayerInfo,
    };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    throw new Error('Failed to calculate prayer times');
  }
}

/**
 * Convert Adhan Prayer enum to our prayer name type
 */
function getPrayerName(prayer: string): 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'sunrise' {
  switch (prayer) {
    case adhan.Prayer.Fajr:
      return 'fajr';
    case adhan.Prayer.Sunrise:
      return 'sunrise';
    case adhan.Prayer.Dhuhr:
      return 'dhuhr';
    case adhan.Prayer.Asr:
      return 'asr';
    case adhan.Prayer.Maghrib:
      return 'maghrib';
    case adhan.Prayer.Isha:
      return 'isha';
    default:
      return 'fajr';
  }
}

/**
 * Get all available calculation methods with descriptions
 */
export function getCalculationMethods() {
  return [
    {
      value: 'MuslimWorldLeague',
      label: 'Muslim World League',
      description: 'Fajr: 18°, Isha: 17° - Used worldwide',
      regions: ['Europe', 'Americas', 'Australia'],
    },
    {
      value: 'Egyptian',
      label: 'Egyptian General Authority',
      description: 'Fajr: 19.5°, Isha: 17.5° - Egypt',
      regions: ['Egypt'],
    },
    {
      value: 'Karachi',
      label: 'University of Islamic Sciences, Karachi',
      description: 'Fajr: 18°, Isha: 18° - Pakistan',
      regions: ['Pakistan', 'Bangladesh', 'India'],
    },
    {
      value: 'UmmAlQura',
      label: 'Umm Al-Qura University',
      description: 'Fajr: 18.5°, Isha: 90 min - Saudi Arabia',
      regions: ['Saudi Arabia', 'Mecca', 'Medina'],
    },
    {
      value: 'Dubai',
      label: 'Dubai (UAE)',
      description: 'Fajr: 18.2°, Isha: 18.2° - UAE',
      regions: ['UAE', 'Dubai'],
    },
    {
      value: 'Qatar',
      label: 'Qatar',
      description: 'Fajr: 18°, Isha: 90 min - Qatar',
      regions: ['Qatar'],
    },
    {
      value: 'Kuwait',
      label: 'Kuwait',
      description: 'Fajr: 18°, Isha: 17.5° - Kuwait',
      regions: ['Kuwait'],
    },
    {
      value: 'MoonsightingCommittee',
      label: 'Moonsighting Committee',
      description: 'Fajr: 18°, Isha: 18° - North America',
      regions: ['USA', 'Canada'],
    },
    {
      value: 'Singapore',
      label: 'Singapore',
      description: 'Fajr: 20°, Isha: 18° - Singapore',
      regions: ['Singapore', 'Malaysia'],
    },
    {
      value: 'Tehran',
      label: 'Institute of Geophysics, Tehran',
      description: 'Fajr: 17.7°, Isha: 14° - Iran',
      regions: ['Iran'],
    },
    {
      value: 'Turkey',
      label: 'Diyanet (Turkey)',
      description: 'Fajr: 18°, Isha: 17° - Turkey',
      regions: ['Turkey'],
    },
    {
      value: 'NorthAmerica',
      label: 'ISNA (North America)',
      description: 'Fajr: 15°, Isha: 15° - North America',
      regions: ['USA', 'Canada'],
    },
  ];
}

/**
 * Calculate Qibla direction for a given location
 */
export function calculateQibla(latitude: number, longitude: number): number {
  const coordinates = new adhan.Coordinates(latitude, longitude);
  const qibla = adhan.Qibla(coordinates) as any;
  return qibla.direction;
}

/**
 * Calculate distance to Mecca (Kaaba) in kilometers
 */
export function calculateDistanceToMecca(latitude: number, longitude: number): number {
  const MECCA_LAT = 21.4225;
  const MECCA_LNG = 39.8261;
  const EARTH_RADIUS = 6371; // km

  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (MECCA_LAT * Math.PI) / 180;
  const deltaLat = ((MECCA_LAT - latitude) * Math.PI) / 180;
  const deltaLng = ((MECCA_LNG - longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}
