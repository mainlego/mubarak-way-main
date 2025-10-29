# Prayer Times Service - Documentation

## Overview

The Prayer Times Service provides comprehensive Islamic prayer times calculation using the Adhan library. It offers both **client-side** calculations (offline-first) and integrates with the existing **backend API** approach.

## Architecture

### Two Complementary Approaches

1. **Client-Side Service** (`prayerTimesService.ts`)
   - Uses Adhan library for local calculations
   - Works offline via IndexedDB caching
   - Instant calculations without API calls
   - Full control over calculation parameters
   - Perfect for PWA offline functionality

2. **Backend API Service** (`prayerStore.ts`)
   - Uses backend API for prayer times
   - Server-side calculations
   - Centralized calculation logic
   - Better for consistent results across devices

### When to Use Which?

**Use Client-Side Service when:**
- Building offline-first features
- Need instant results without API latency
- User customization of calculation methods is important
- PWA functionality is required
- Reducing server load is a priority

**Use Backend API when:**
- Centralized control is needed
- Historical data tracking is important
- Analytics on prayer time usage is needed
- Server-side adjustments are required

## Installation

The `adhan` package has been added to dependencies:

```json
{
  "dependencies": {
    "adhan": "^4.5.3"
  }
}
```

Run `npm install` to install dependencies.

## Usage

### Basic Usage with Hook

```typescript
import { usePrayerTimes } from '@shared/hooks';

function PrayerComponent() {
  const {
    prayerTimes,
    currentPrayer,
    nextPrayer,
    qiblaDirection,
    isLoading,
    formattedPrayerTimes,
    timeUntilNextPrayer,
  } = usePrayerTimes({
    autoRefresh: true,
    autoRequestLocation: true,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>Next Prayer: {nextPrayer?.name}</h2>
      <p>Time: {nextPrayer?.timeString}</p>
      <p>In: {timeUntilNextPrayer}</p>

      <h3>All Prayers:</h3>
      {formattedPrayerTimes.map(prayer => (
        <div key={prayer.name}>
          {prayer.name}: {prayer.time}
        </div>
      ))}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import prayerTimesService from '@shared/lib/prayerTimesService';

// Get current location
const location = await prayerTimesService.getCurrentLocation();

// Calculate prayer times
const prayerTimes = prayerTimesService.calculatePrayerTimes(location);

// Get current prayer
const current = prayerTimesService.getCurrentPrayer(prayerTimes);
console.log(`Current prayer: ${current.name} at ${current.timeString}`);

// Get next prayer with countdown
const next = prayerTimesService.getNextPrayer(prayerTimes);
console.log(`Next: ${next.name} in ${next.remainingTime.hours}h ${next.remainingTime.minutes}m`);

// Get Qibla direction
const qibla = prayerTimesService.getQiblaDirection(location);
console.log(`Qibla direction: ${qibla.direction}°`);
```

### With Offline Support

```typescript
// Get prayer times with automatic offline caching
const prayerTimes = await prayerTimesService.getPrayerTimesWithOfflineSupport();

// Will use cached data if offline or location unavailable
```

### Customizing Calculation Method

```typescript
import { usePrayerTimes } from '@shared/hooks';

function SettingsComponent() {
  const { updateSettings } = usePrayerTimes();

  const handleMethodChange = async (method: string) => {
    await updateSettings({
      calculationMethod: method as any,
      madhab: 'hanafi',
      highLatitudeRule: 'middleOfTheNight',
    });
  };

  return (
    <select onChange={(e) => handleMethodChange(e.target.value)}>
      <option value="MuslimWorldLeague">Muslim World League</option>
      <option value="Egyptian">Egyptian</option>
      <option value="Karachi">University of Islamic Sciences, Karachi</option>
      <option value="UmmAlQura">Umm Al-Qura University, Makkah</option>
      <option value="Dubai">Dubai</option>
      <option value="Qatar">Qatar</option>
      <option value="Kuwait">Kuwait</option>
      <option value="MoonsightingCommittee">Moonsighting Committee</option>
      <option value="Singapore">Singapore</option>
      <option value="Turkey">Turkey</option>
      <option value="Tehran">Tehran</option>
      <option value="NorthAmerica">Islamic Society of North America</option>
    </select>
  );
}
```

### Setting Up Notifications

```typescript
// Request permission
const granted = await prayerTimesService.requestNotificationPermission();

if (granted) {
  // Setup notifications for today's prayers
  await prayerTimesService.setupNotifications(prayerTimes);
}
```

### Location Watching

```typescript
const { watchLocation } = usePrayerTimes({
  watchLocation: true, // Auto-update when location changes
});

// Location will automatically update prayer times
```

## Hook Options

```typescript
interface UsePrayerTimesOptions {
  autoRefresh?: boolean;        // Auto-refresh at midnight (default: true)
  refreshInterval?: number;     // Countdown update interval in ms (default: 1000)
  autoRequestLocation?: boolean; // Auto-request location on mount (default: true)
  watchLocation?: boolean;      // Watch for location changes (default: false)
}
```

## Hook Return Values

```typescript
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
```

## Calculation Methods

All major calculation methods are supported:

- **Muslim World League** - Used in Europe, Far East, parts of America
- **Egyptian** - Egyptian General Authority of Survey
- **Karachi** - University of Islamic Sciences, Karachi
- **Umm Al-Qura** - Used in Saudi Arabia
- **Dubai** - Used in UAE
- **Qatar** - Modified version of Umm Al-Qura
- **Kuwait** - Used in Kuwait
- **Moonsighting Committee** - Used in North America
- **Singapore** - Used in Singapore, Malaysia, Indonesia
- **Turkey** - Diyanet İşleri Başkanlığı
- **Tehran** - Institute of Geophysics, University of Tehran
- **ISNA** - Islamic Society of North America

## Madhab Support

- **Shafi** - Standard Asr calculation (shadow = object length + noon shadow)
- **Hanafi** - Later Asr time (shadow = 2x object length + noon shadow)

## High Latitude Rules

For locations above 48° latitude:

- **Middle of the Night** - Fajr/Isha based on middle of night
- **Seventh of the Night** - Fajr/Isha based on 1/7th of night
- **Twilight Angle** - Fajr/Isha based on angle

## Features

### ✅ Core Features
- [x] Automatic geolocation
- [x] Prayer time calculations using Adhan library
- [x] Multiple calculation methods (12 methods)
- [x] Madhab support (Shafi/Hanafi)
- [x] High latitude rule adjustments
- [x] Qibla direction calculation
- [x] Current prayer detection
- [x] Next prayer with countdown
- [x] Offline caching via IndexedDB

### ✅ Advanced Features
- [x] Browser notifications
- [x] Location watching
- [x] Auto-refresh at midnight
- [x] Real-time countdown updates
- [x] Qiyam (night prayer) calculation
- [x] Custom prayer time adjustments
- [x] Settings persistence
- [x] React hook integration

### ✅ Offline Support
- [x] IndexedDB caching
- [x] Automatic fallback to cached data
- [x] Works completely offline after initial load

## Integration with Existing Code

The existing `usePrayerStore` hook (backend API approach) continues to work unchanged. You can use both approaches:

```typescript
// Backend API approach (existing)
import { usePrayerStore } from '@shared/store';
const { prayerTimes, calculatePrayerTimes } = usePrayerStore();

// Client-side approach (new)
import { usePrayerTimes } from '@shared/hooks';
const { prayerTimes, refreshPrayerTimes } = usePrayerTimes();
```

### Hybrid Approach Example

```typescript
function PrayerTimesPage() {
  // Use backend API as primary
  const { prayerTimes: apiTimes, calculatePrayerTimes } = usePrayerStore();

  // Use client-side as fallback/offline
  const {
    prayerTimes: localTimes,
    refreshPrayerTimes,
    location,
  } = usePrayerTimes({ autoRequestLocation: false });

  useEffect(() => {
    if (location) {
      // Try API first
      calculatePrayerTimes(location).catch(() => {
        // Fallback to local calculation
        refreshPrayerTimes();
      });
    }
  }, [location]);

  const times = apiTimes || localTimes;

  return <PrayerTimesDisplay times={times} />;
}
```

## Type Definitions

```typescript
interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface PrayerTimesData {
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

interface PrayerInfo {
  name: string;
  time: Date;
  timeString: string;
}

interface NextPrayerInfo extends PrayerInfo {
  remainingTime: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
}

interface QiblaInfo {
  direction: number;
  location: LocationCoords;
}

interface PrayerTimesSettings {
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
```

## Browser Notifications

Notifications are automatically scheduled for each prayer time:

```typescript
// Request permission
const granted = await prayerTimesService.requestNotificationPermission();

if (granted) {
  // Setup notifications
  await prayerTimesService.setupNotifications(prayerTimes);
}
```

Notification will show:
- Title: "Время намаза: [Prayer Name]"
- Body: "Наступило время намаза [Prayer Name]"
- Icon: `/icon-192x192.png`

## Performance Considerations

### Client-Side Service
- ✅ Zero API calls after location is obtained
- ✅ Instant calculations (< 1ms)
- ✅ Works completely offline
- ✅ No server load

### Backend API
- ⚠️ Requires API call for each calculation
- ⚠️ Dependent on server availability
- ✅ Centralized logic
- ✅ Historical tracking

## Caching Strategy

Prayer times are cached in IndexedDB with the following structure:

```typescript
{
  date: "2025-01-15",
  location: { latitude: 55.7558, longitude: 37.6173 },
  times: { /* PrayerTimesData */ }
}
```

Cache is automatically used when:
- Network is unavailable
- Location service fails
- API request fails

## Testing

```typescript
// Test calculation
const testLocation = { latitude: 55.7558, longitude: 37.6173 }; // Moscow
const times = prayerTimesService.calculatePrayerTimes(testLocation);

console.log('Fajr:', times.fajr);
console.log('Dhuhr:', times.dhuhr);
console.log('Asr:', times.asr);
console.log('Maghrib:', times.maghrib);
console.log('Isha:', times.isha);

// Test Qibla
const qibla = prayerTimesService.getQiblaDirection(testLocation);
console.log('Qibla from Moscow:', qibla.direction, '°'); // ~165.9°
```

## Migration from mubarak-way-shop

The original `prayerTimesService.js` from mubarak-way-shop has been fully migrated to TypeScript with:

- ✅ Full TypeScript type safety
- ✅ All features preserved
- ✅ Integration with unified offlineStorage
- ✅ React hook wrapper
- ✅ Enhanced error handling
- ✅ Better code organization

## Files Created

1. **`frontend/src/shared/lib/prayerTimesService.ts`** (624 lines)
   - Main service class with all prayer time logic

2. **`frontend/src/shared/hooks/usePrayerTimes.ts`** (233 lines)
   - React hook for easy component integration

3. **`frontend/src/shared/hooks/index.ts`**
   - Hook exports

4. **`frontend/package.json`** (updated)
   - Added `adhan` dependency

5. **`PRAYER_TIMES_README.md`** (this file)
   - Complete documentation

## Next Steps

To fully integrate into the app:

1. **Update PrayerTimesPage.tsx** to use the new hook (optional)
2. **Add settings UI** for calculation method selection
3. **Implement notification preferences** in settings
4. **Test on production** with Render deployment

## Support

For issues or questions:
- Check Adhan library docs: https://github.com/batoulapps/adhan-js
- Review this README
- Check browser console for errors
- Verify geolocation permissions
