/**
 * 3D Qibla Compass Component
 * Uses DeviceOrientation API for real-time compass navigation
 */

import React, { useEffect, useState, useRef } from 'react';
import { getQiblaDirection } from '@masaajid/qibla';

interface QiblaResult {
  bearing: number;
  distance: number;
  cardinalDirection: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

export const QiblaCompass: React.FC = () => {
  // ========== STATE ==========
  const [qiblaData, setQiblaData] = useState<QiblaResult | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);

  // ========== REFS ==========
  const smoothHeadingRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const headingHistoryRef = useRef<number[]>([]);

  // ========== DETECT iOS ==========
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    console.log('Platform:', ios ? 'iOS' : 'Android/Other');
  }, []);

  // ========== GET GEOLOCATION ==========
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим устройством');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);

        // Calculate Qibla direction
        try {
          const result = getQiblaDirection(location, {
            bearingPrecision: 2,
            distancePrecision: 0,
            includeCardinalDirection: true,
            includeMagneticDeclination: true
          });

          console.log('Qibla direction calculated:', result);
          setQiblaData(result as QiblaResult);
          setLoading(false);
        } catch (err) {
          console.error('Qibla calculation error:', err);
          setError('Ошибка расчета направления на Киблу');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Не удалось получить ваше местоположение');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  // ========== REQUEST PERMISSION (iOS 13+) ==========
  const requestOrientationPermission = async () => {
    if (!isIOS) {
      setPermissionGranted(true);
      startCompass();
      return;
    }

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          startCompass();
        } else {
          setError('Доступ к компасу отклонен. Разрешите доступ в настройках Safari.');
        }
      } else {
        setPermissionGranted(true);
        startCompass();
      }
    } catch (err) {
      console.error('Permission error:', err);
      setError('Ошибка запроса доступа к компасу');
    }
  };

  // ========== SMOOTH HEADING (Moving Average) ==========
  const smoothHeading = (newHeading: number): number => {
    const history = headingHistoryRef.current;
    history.push(newHeading);

    const maxHistory = isIOS ? 3 : 2;
    if (history.length > maxHistory) {
      history.shift();
    }

    // Handle 360/0 crossing
    let adjusted = [...history];
    const first = adjusted[0];
    adjusted = adjusted.map(h => {
      const diff = h - first;
      if (diff > 180) return h - 360;
      if (diff < -180) return h + 360;
      return h;
    });

    // Average
    const avg = adjusted.reduce((a, b) => a + b, 0) / adjusted.length;

    // Normalize 0-360
    return (avg + 360) % 360;
  };

  // ========== HANDLE DEVICE ORIENTATION ==========
  const handleOrientation = (event: DeviceOrientationEvent) => {
    let heading = 0;

    // iOS: uses webkitCompassHeading (already with magnetic declination)
    if ((event as any).webkitCompassHeading !== undefined) {
      heading = (event as any).webkitCompassHeading;
    }
    // Android/others: use alpha directly
    else if (event.alpha !== null) {
      heading = event.alpha;
    } else {
      console.warn('No compass data available');
      return;
    }

    // Accuracy (only available on some devices)
    if ((event as any).webkitCompassAccuracy !== undefined) {
      const acc = (event as any).webkitCompassAccuracy;
      setAccuracy(acc);
      // If accuracy is low (> 20 degrees), needs calibration
      if (acc > 20 || acc < 0) {
        setNeedsCalibration(true);
      } else {
        setNeedsCalibration(false);
      }
    }

    // Smooth for fluidity
    const smoothed = smoothHeading(heading);

    // Use requestAnimationFrame for smooth animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      // Interpolation for smooth movement
      const current = smoothHeadingRef.current;
      let diff = smoothed - current;

      // Choose shortest path through 360/0
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      // Faster interpolation for better response
      const lerpFactor = isIOS ? 0.4 : 0.5;
      const newHeading = current + diff * lerpFactor;
      smoothHeadingRef.current = (newHeading + 360) % 360;

      // Update state more often for smoother animation
      let headingDiff = Math.abs(smoothHeadingRef.current - deviceHeading);
      if (headingDiff > 180) headingDiff = 360 - headingDiff;

      if (headingDiff > 0.1) {
        setDeviceHeading(smoothHeadingRef.current);
      }

      // Check if pointing to Qibla (±10 degrees)
      if (qiblaData) {
        const qiblaDiff = Math.abs(qiblaData.bearing - smoothHeadingRef.current);
        const normalizedDiff = qiblaDiff > 180 ? 360 - qiblaDiff : qiblaDiff;
        setIsPointingToQibla(normalizedDiff <= 10);
      }
    });
  };

  // ========== START COMPASS ==========
  const startCompass = () => {
    if (isIOS) {
      window.addEventListener('deviceorientation', handleOrientation as any, true);
    } else {
      // Android: try deviceorientationabsolute (absolute orientation)
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      } else {
        window.addEventListener('deviceorientation', handleOrientation as any, true);
      }
    }
    console.log('Compass started');
  };

  // ========== CALIBRATION ==========
  const handleCalibration = () => {
    setNeedsCalibration(false);
    headingHistoryRef.current = [];
    smoothHeadingRef.current = 0;
  };

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ========== CALCULATE RELATIVE ANGLE ==========
  const getRelativeQiblaAngle = (): number => {
    if (!qiblaData) return 0;
    return (qiblaData.bearing - deviceHeading + 360) % 360;
  };

  const relativeQiblaAngle = getRelativeQiblaAngle();

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-16 h-16 text-emerald-600 dark:text-emerald-400 animate-spin mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="32" />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-center">Определение вашего местоположения...</p>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // ========== PERMISSION REQUEST STATE ==========
  if (!permissionGranted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 max-w-md">
          <span className="text-6xl block text-center mb-4">🧭</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Доступ к компасу</h3>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            Для определения направления на Киблу необходим доступ к компасу вашего устройства
          </p>
          <button
            onClick={requestOrientationPermission}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Включить компас
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN INTERFACE ==========
  const distanceKm = qiblaData?.distance ? Math.round(qiblaData.distance) : '—';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 relative">
      {/* Qibla Direction Notification - FIXED */}
      {isPointingToQibla && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 dark:bg-emerald-600 rounded-xl p-3 px-6 shadow-lg animate-pulse max-w-xs w-auto">
          <p className="text-white text-sm text-center font-semibold flex items-center justify-center gap-2">
            <span>🧭</span>
            Вы направлены на Киблу!
          </p>
        </div>
      )}

      {/* Calibration Warning */}
      {needsCalibration && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 max-w-md">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm text-center mb-2">
            Низкая точность компаса. Выполните калибровку:
          </p>
          <p className="text-yellow-700 dark:text-yellow-400 text-xs text-center mb-3">
            Поверните устройство восьмеркой в воздухе
          </p>
          <button
            onClick={handleCalibration}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Сбросить калибровку
          </button>
        </div>
      )}

      {/* Location Info */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
          <span>📍</span>
          <span>{userLocation?.latitude.toFixed(4)}°, {userLocation?.longitude.toFixed(4)}°</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {qiblaData?.cardinalDirection} • {qiblaData?.bearing.toFixed(1)}° • {distanceKm} км до Мекки
        </p>
        {accuracy !== null && (
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Точность: ±{Math.abs(accuracy).toFixed(0)}°
          </p>
        )}
      </div>

      {/* ========== COMPASS ========== */}
      <div className="relative w-80 h-80 mb-6">
        {/* Rotating ring with degrees */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-emerald-500/30 shadow-2xl"
          style={{
            transform: `rotate(${-deviceHeading}deg)`,
            willChange: 'transform',
          }}
        >
          {/* Degree marks */}
          {[...Array(36)].map((_, i) => {
            const angle = i * 10;
            const isMajor = angle % 30 === 0;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-0 origin-bottom -translate-x-1/2"
                style={{
                  height: '50%',
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <div className={`mx-auto ${isMajor ? 'w-0.5 h-6 bg-gray-700 dark:bg-gray-300' : 'w-0.5 h-3 bg-gray-400'}`} />
                {angle % 90 === 0 && (
                  <div
                    className="absolute top-8 left-1/2 -translate-x-1/2 text-gray-900 dark:text-white font-bold text-sm"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {angle === 0 ? 'N' : angle === 90 ? 'E' : angle === 180 ? 'S' : 'W'}
                  </div>
                )}
              </div>
            );
          })}

          {/* NORTH Arrow (always at top of ring) */}
          <div className="absolute left-1/2 top-0 origin-bottom -translate-x-1/2 pt-2">
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-blue-500" />
              <div className="mt-1 text-blue-600 dark:text-blue-400 text-xs font-bold">N</div>
            </div>
          </div>

          {/* MECCA Arrow (relative to north) */}
          <div
            className="absolute left-1/2 top-0 origin-bottom -translate-x-1/2"
            style={{
              height: '50%',
              transform: `rotate(${qiblaData?.bearing || 0}deg)`,
            }}
          >
            <div className="flex flex-col items-center">
              <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[28px] transition-all duration-300 ${
                isPointingToQibla
                  ? 'border-b-emerald-400'
                  : 'border-b-emerald-500'
              }`} />
              <div className={`mt-1 text-xs font-bold transition-colors duration-300 ${
                isPointingToQibla ? 'text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>🕋</div>
            </div>
          </div>
        </div>

        {/* Static device arrow (red, always at top) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pt-4 pointer-events-none z-10">
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[32px] border-b-red-500" />
            <div className="mt-2 text-red-500 dark:text-red-400 text-xs font-bold bg-white dark:bg-gray-900 px-2 py-1 rounded">ВЫ</div>
          </div>
        </div>

        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-lg border-2 border-gray-700 dark:border-gray-600 z-20" />
      </div>

      {/* ========== INDICATORS ========== */}
      <div className="w-full max-w-md space-y-3">
        {/* Qibla Direction */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-emerald-500/30">
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Направление на Киблу</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {qiblaData?.bearing.toFixed(0)}°
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{qiblaData?.cardinalDirection}</p>
        </div>

        {/* Device Heading */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-blue-500/30">
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Ваш курс</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {deviceHeading.toFixed(0)}°
          </p>
        </div>

        {/* Relative Angle */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-yellow-500/30">
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Поверните на</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {relativeQiblaAngle <= 180
              ? `${relativeQiblaAngle.toFixed(0)}° вправо ↻`
              : `${(360 - relativeQiblaAngle).toFixed(0)}° влево ↺`
            }
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-full max-w-md">
        <p className="text-gray-700 dark:text-gray-300 text-xs text-center mb-2 font-semibold">Обозначения:</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-red-500" />
            <span className="text-gray-700 dark:text-gray-300">Ваше устройство (статичное)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">Север (вращается с компасом)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-emerald-500" />
            <span className="text-gray-700 dark:text-gray-300">Направление на Мекку 🕋</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QiblaCompass;
