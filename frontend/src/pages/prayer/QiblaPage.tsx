import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePrayerStore } from '@shared/store';
import { Card, Button, Spinner } from '@shared/ui';

export default function QiblaPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { qibla, calculateQibla } = usePrayerStore();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [heading, setHeading] = useState<number>(0); // Device heading
  const [qiblaDirection, setQiblaDirection] = useState<number>(0); // Qibla direction from north
  const [distance, setDistance] = useState<number>(0); // Distance to Kaaba in km
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompass, setHasCompass] = useState(false);

  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(userLocation);

          // Calculate Qibla using API
          try {
            await calculateQibla({
              latitude: userLocation.lat,
              longitude: userLocation.lon
            });
          } catch (err) {
            console.error('Failed to calculate Qibla:', err);
          }

          setIsLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(t('errors.locationPermission', { defaultValue: 'Location permission denied' }));
          setIsLoading(false);
        }
      );
    } else {
      setError(t('errors.geolocationNotSupported', { defaultValue: 'Geolocation not supported' }));
      setIsLoading(false);
    }

    // Check for device orientation support
    if ('DeviceOrientationEvent' in window) {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              startCompass();
            }
          })
          .catch(console.error);
      } else {
        // Non-iOS devices
        startCompass();
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [calculateQibla]);

  // Update Qibla direction and distance when API data is available
  useEffect(() => {
    if (qibla) {
      setQiblaDirection(qibla.direction);
      setDistance(qibla.distance);
    }
  }, [qibla]);

  const startCompass = () => {
    setHasCompass(true);
    window.addEventListener('deviceorientation', handleOrientation);
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      // alpha is the compass heading
      setHeading(event.alpha);
    }
  };

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          startCompass();
        }
      } catch (err) {
        console.error('Compass permission error:', err);
      }
    }
  };

  // Calculate the angle difference for the compass needle
  const needleRotation = hasCompass ? qiblaDirection - heading : qiblaDirection;

  const getDistance = (): string => {
    // Use distance from API if available, otherwise show loading
    if (distance > 0) {
      return `${distance.toFixed(0)} km`;
    }

    if (!location) return '';

    return t('common.calculating', { defaultValue: 'Calculating...' });
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🧭</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/prayer')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🧭 {t('prayer.qibla')}
        </h1>
      </header>

      {/* Main Compass */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* Compass Base */}
          <div
            ref={compassRef}
            className="w-80 h-80 rounded-full bg-white dark:bg-gray-800 shadow-2xl relative overflow-hidden"
            style={{
              transform: hasCompass ? `rotate(${-heading}deg)` : 'rotate(0deg)',
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Cardinal Directions */}
            <div className="absolute inset-0">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl font-bold text-red-600">
                N
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xl font-bold text-gray-400">
                S
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                W
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                E
              </div>
            </div>

            {/* Degree Markings */}
            <div className="absolute inset-0">
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 origin-center"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-140px)`,
                    }}
                  >
                    <div
                      className={`w-0.5 ${
                        angle % 90 === 0 ? 'h-4 bg-gray-900' : 'h-2 bg-gray-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Qibla Needle */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotate(${qiblaDirection}deg)`,
                transition: hasCompass ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              <div className="relative w-2 h-80">
                {/* Green arrow pointing to Qibla */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-green-500" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-32 bg-green-500 rounded-full" />

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-4 border-green-500 rounded-full" />

                {/* Red arrow pointing opposite */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-red-500 rounded-full" />
              </div>
            </div>

            {/* Kaaba Icon */}
            <div
              className="absolute top-16 left-1/2 -translate-x-1/2 text-4xl"
              style={{
                transform: `translateX(-50%) rotate(${qiblaDirection}deg)`,
              }}
            >
              🕋
            </div>
          </div>

          {/* Direction Indicator */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
            <p className="text-6xl font-bold text-primary-600 dark:text-primary-400">
              {Math.round(qiblaDirection)}°
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('prayer.qiblaDirection', { defaultValue: 'Qibla Direction' })}
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="p-4 space-y-3">
        {!hasCompass && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {t('prayer.compassDisabled', { defaultValue: 'Compass sensor not enabled' })}
              </p>
              <Button size="sm" onClick={requestCompassPermission}>
                {t('prayer.enableCompass', { defaultValue: 'Enable Compass' })}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {getDistance()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('prayer.distanceToKaaba', { defaultValue: 'Distance to Kaaba' })}
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : '-'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('prayer.yourLocation', { defaultValue: 'Your Location' })}
            </p>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">
              💡 {t('prayer.qiblaTip', { defaultValue: 'Hold your device flat and rotate until the green arrow points up' })}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
