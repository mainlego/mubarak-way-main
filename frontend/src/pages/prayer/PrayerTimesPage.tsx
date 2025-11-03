import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore, usePrayerStore } from '@shared/store';
import { Card, Button, Spinner } from '@shared/ui';
import type { PrayerCalculationParams } from '@mubarak-way/shared';
import { MonthlyPrayerSchedule, PrayerCard } from '@widgets/prayer';
import { MapPin, Calendar, Settings as SettingsIcon, Bell, ArrowLeft, Clock } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  isPassed: boolean;
}

export default function PrayerTimesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { prayerTimes: apiPrayerTimes, calculatePrayerTimes, isLoading: storeLoading, error: storeError } = usePrayerStore();

  const [locationName, setLocationName] = useState<string>('');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get location from user settings or browser
    if (user?.prayerSettings?.location) {
      const loc = user.prayerSettings.location;
      setLocationName(loc.city || `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`);
      fetchPrayerTimes(loc.latitude, loc.longitude, loc.city, loc.country);
    } else {
      // Request geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLocationName(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
            fetchPrayerTimes(lat, lon);
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
    }
  }, [user, t]);

  // Process API prayer times when available
  useEffect(() => {
    if (apiPrayerTimes) {
      const now = new Date();
      const times: PrayerTime[] = [
        {
          name: t('prayer.fajr'),
          time: formatTime(new Date(apiPrayerTimes.fajr)),
          isPassed: new Date(apiPrayerTimes.fajr) < now,
        },
        {
          name: t('prayer.dhuhr'),
          time: formatTime(new Date(apiPrayerTimes.dhuhr)),
          isPassed: new Date(apiPrayerTimes.dhuhr) < now,
        },
        {
          name: t('prayer.asr'),
          time: formatTime(new Date(apiPrayerTimes.asr)),
          isPassed: new Date(apiPrayerTimes.asr) < now,
        },
        {
          name: t('prayer.maghrib'),
          time: formatTime(new Date(apiPrayerTimes.maghrib)),
          isPassed: new Date(apiPrayerTimes.maghrib) < now,
        },
        {
          name: t('prayer.isha'),
          time: formatTime(new Date(apiPrayerTimes.isha)),
          isPassed: new Date(apiPrayerTimes.isha) < now,
        },
      ];

      setPrayerTimes(times);

      // Set next prayer from API
      if (apiPrayerTimes.nextPrayer) {
        const nextTime = formatTime(new Date(apiPrayerTimes.nextPrayer.time));
        const nextName = t(`prayer.${apiPrayerTimes.nextPrayer.name}`);
        setNextPrayer({ name: nextName, time: nextTime, isPassed: false });
        setTimeUntilNext(apiPrayerTimes.nextPrayer.timeRemaining.formatted);
      } else {
        // Find next prayer manually
        const next = Array.isArray(times) ? times.find(t => !t.isPassed) : undefined;
        setNextPrayer(next || (Array.isArray(times) && times.length > 0 ? times[0] : null));
      }

      setIsLoading(false);
    }
  }, [apiPrayerTimes, t]);

  // Update time until next prayer every minute
  useEffect(() => {
    if (!nextPrayer) return;

    const interval = setInterval(() => {
      if (apiPrayerTimes?.nextPrayer) {
        setTimeUntilNext(calculateTimeRemaining(apiPrayerTimes.nextPrayer.time));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextPrayer, apiPrayerTimes]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const calculateTimeRemaining = (targetTime: string | Date): string => {
    const now = new Date();
    const target = new Date(targetTime);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}${t('common.hour')} ${minutes}${t('common.minute')}`;
    }
    return `${minutes}${t('common.minute')}`;
  };

  const fetchPrayerTimes = async (
    latitude: number,
    longitude: number,
    city?: string,
    country?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get calculation method and madhab from user settings
      const params: Partial<PrayerCalculationParams> = {
        calculationMethod: (user?.prayerSettings?.calculationMethod as any) || 'MuslimWorldLeague',
        madhab: user?.prayerSettings?.madhab || 'hanafi',
      };

      await calculatePrayerTimes(
        { latitude, longitude, city, country },
        params
      );
    } catch (err: any) {
      console.error('Error fetching prayer times:', err);
      setError(err.message || t('errors.serverError'));
      setIsLoading(false);
    }
  };

  const getTimeUntilPrayer = (prayerTime: string): string => {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);

    let targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, set to tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const diff = targetTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    }
    return `${minutesLeft}m`;
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
          <div className="text-6xl mb-4">📍</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header */}
      <header className="container-app pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/prayer')}
            className="icon-container bg-card hover:bg-card-hover"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-text-primary">
                {t('prayer.times')}
              </h1>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{locationName || t('prayer.detectingLocation', { defaultValue: 'Detecting location...' })}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </header>

      <main className="container-app space-y-6 pb-24">

        {/* Next Prayer */}
        {nextPrayer && (
          <Card variant="gradient">
            <div className="text-center">
              <p className="text-sm text-white/80 mb-2">
                {t('prayer.nextPrayer', { defaultValue: 'Next Prayer' })}
              </p>
              <h2 className="text-3xl font-bold text-white mb-2">{nextPrayer.name}</h2>
              <p className="text-5xl font-bold text-white mb-3">{nextPrayer.time}</p>
              <p className="text-sm text-white/90">
                {t('prayer.in', { defaultValue: 'in' })} {timeUntilNext || getTimeUntilPrayer(nextPrayer.time)}
              </p>
            </div>
          </Card>
        )}

        {/* All Prayer Times */}
        <section>
          <h3 className="text-lg font-bold text-text-primary mb-3">
            {t('prayer.todaysPrayers', { defaultValue: "Today's Prayers" })}
          </h3>

          <div className="space-y-2">
            {prayerTimes.map((prayer, index) => {
              const isNext = nextPrayer?.name === prayer.name;

              return (
                <Card
                  key={index}
                  variant={isNext ? 'gradient' : 'glass'}
                  className={`${
                    prayer.isPassed && !isNext ? 'opacity-60' : ''
                  } ${isNext ? 'ring-2 ring-accent' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        prayer.isPassed
                          ? 'bg-success/20 text-success'
                          : isNext
                          ? 'bg-white/30 text-white'
                          : 'bg-card text-text-primary'
                      }`}>
                        {prayer.isPassed ? '✓' : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          isNext ? 'text-white' : 'text-text-primary'
                        }`}>
                          {prayer.name}
                        </h4>
                        {isNext && (
                          <p className="text-xs text-white/80">
                            {t('prayer.upcoming', { defaultValue: 'Upcoming' })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        isNext ? 'text-white' : 'text-text-primary'
                      }`}>
                        {prayer.time}
                      </p>
                      {!prayer.isPassed && !isNext && (
                        <p className="text-xs text-text-tertiary">
                          {getTimeUntilPrayer(prayer.time)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Monthly Schedule */}
        {user?.prayerSettings?.location && (
          <section>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              {t('prayer.monthlySchedule', { defaultValue: 'Monthly Schedule' })}
            </h3>
            <MonthlyPrayerSchedule
              latitude={user.prayerSettings.location.latitude}
              longitude={user.prayerSettings.location.longitude}
              calculationMethod={user.prayerSettings.calculationMethod || 'MuslimWorldLeague'}
              madhab={user.prayerSettings.madhab || 'shafi'}
            />
          </section>
        )}

        {/* Settings */}
        <section>
          <h3 className="text-lg font-bold text-text-primary mb-3">
            {t('prayer.prayerSettings')}
          </h3>

          <div className="space-y-2">
            <PrayerCard
              icon={SettingsIcon}
              title={t('prayer.calculationMethod', { defaultValue: 'Calculation Method' })}
              subtitle={user?.prayerSettings?.madhab || 'Hanafi'}
              iconBgColor="bg-card"
              onClick={() => navigate('/settings/prayer')}
            />

            <PrayerCard
              icon={Bell}
              title={t('settings.notifications')}
              subtitle={t('prayer.prayerReminders', { defaultValue: 'Prayer reminders' })}
              iconBgColor="bg-card"
              onClick={() => navigate('/settings/notifications')}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
