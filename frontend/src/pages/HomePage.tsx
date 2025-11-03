import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@shared/store';
import { getTelegramUser } from '@shared/lib/telegram';
import { usePrayerTimes } from '@shared/hooks/usePrayerTimes';
import { BookOpen, School, Library } from 'lucide-react';
import {
  NextPrayerCard,
  DailyGoalsList,
  ModuleCard,
  SearchBar,
} from '@widgets/home';

export default function HomePage() {
  const { t } = useTranslation();
  const { user, login, isLoading } = useUserStore();
  const { prayerTimes, nextPrayer } = usePrayerTimes();

  useEffect(() => {
    const telegramUser = getTelegramUser();

    // Auto-login if we have Telegram user but no app user
    if (telegramUser && !user && !isLoading) {
      login().catch(console.error);
    }
  }, [user, login, isLoading]);

  // Calculate next prayer progress
  const nextPrayerData = useMemo(() => {
    if (!nextPrayer || !prayerTimes) {
      return {
        prayerName: 'Загрузка...',
        prayerNameAr: '...',
        prayerTime: '--:--',
        timeRemaining: '--',
        progress: 0,
      };
    }

    const now = new Date();
    const nextTime = new Date(nextPrayer.time);

    // Find previous prayer
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const nextIndex = prayers.findIndex(p => p === nextPrayer.name);
    const prevIndex = nextIndex > 0 ? nextIndex - 1 : prayers.length - 1;

    const prevPrayerTime = prayerTimes[prevIndex]
      ? new Date(prayerTimes[prevIndex].time)
      : new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago as fallback

    const totalDuration = nextTime.getTime() - prevPrayerTime.getTime();
    const elapsed = now.getTime() - prevPrayerTime.getTime();
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    const minutesRemaining = Math.floor((nextTime.getTime() - now.getTime()) / 60000);
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;

    const prayerNames: Record<string, { ru: string; ar: string }> = {
      fajr: { ru: 'Фаджр', ar: 'الفجر' },
      dhuhr: { ru: 'Зухр', ar: 'الظهر' },
      asr: { ru: 'Аср', ar: 'العصر' },
      maghrib: { ru: 'Магриб', ar: 'المغرب' },
      isha: { ru: 'Иша', ar: 'العشاء' },
    };

    return {
      prayerName: prayerNames[nextPrayer.name]?.ru || nextPrayer.name,
      prayerNameAr: prayerNames[nextPrayer.name]?.ar || '',
      prayerTime: nextTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeRemaining: `через ${hoursRemaining > 0 ? `${hoursRemaining}ч ` : ''}${mins}м`,
      progress,
    };
  }, [nextPrayer, prayerTimes]);

  // Mock daily goals (будем интегрировать с реальными данными позже)
  const dailyGoals = useMemo(
    () => [
      {
        id: 'quran-reading',
        title: 'Чтение Корана',
        titleAr: 'قراءة القرآن',
        progress: 3,
        total: 10,
        isCompleted: false,
        icon: '📖',
      },
      {
        id: 'prayers',
        title: 'Молитвы',
        titleAr: 'الصلاة',
        progress: 5,
        total: 5,
        isCompleted: true,
        icon: '🕌',
      },
      {
        id: 'dhikr',
        title: 'Зикр',
        titleAr: 'الذكر',
        progress: 50,
        total: 100,
        isCompleted: false,
        icon: '📿',
      },
    ],
    []
  );

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  }, []);

  return (
    <div className="page-container bg-gradient-primary min-h-screen">
      {/* Header with Greeting */}
      <header className="container-app pt-6 pb-4 safe-top">
        {/* Logo */}
        <div className="flex justify-center mb-4 animate-fade-in">
          <img
            src="/logo.svg"
            alt="Mubarak Way"
            className="h-16 w-auto opacity-90"
          />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-arabic text-accent animate-fade-in">
            السلام عليكم
          </h1>
          <p className="text-lg text-text-secondary">
            {greeting}
            {user && `, ${user.firstName}`}!
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <SearchBar />
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app space-y-6 pb-24">
        {/* Next Prayer Card */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <NextPrayerCard {...nextPrayerData} />
        </div>

        {/* Module Cards Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <ModuleCard
            title="Священный Коран"
            titleAr="القرآن الكريم"
            description="Читайте и изучайте Священный Коран"
            icon={BookOpen}
            route="/quran"
            gradient="accent"
          />
          <ModuleCard
            title="Обучение Намазу"
            titleAr="تعليم الصلاة"
            description="Пошаговые уроки намаза"
            icon={School}
            route="/prayer"
            gradient="primary"
          />
        </div>

        {/* Library Card */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <ModuleCard
            title="Исламская библиотека"
            titleAr="المكتبة الإسلامية"
            description="Книги и нашиды для духовного роста"
            icon={Library}
            route="/library"
            gradient="custom"
            customGradient="linear-gradient(135deg, #6B4E8C 0%, #8B6EAC 100%)"
          />
        </div>

        {/* Daily Goals */}
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <DailyGoalsList goals={dailyGoals} />
        </div>

        {/* Verse of the Day (Future Feature) */}
        {/* <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Card variant="glass">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Аят дня
            </h3>
            <p className="text-xl font-arabic text-accent text-center mb-2">
              وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
            </p>
            <p className="text-sm text-text-secondary text-center">
              "И кто боится Аллаха, тому Он создаёт выход"
            </p>
            <p className="text-xs text-text-tertiary text-center mt-2">
              Сура 65, Аят 2
            </p>
          </Card>
        </div> */}
      </main>
    </div>
  );
}
